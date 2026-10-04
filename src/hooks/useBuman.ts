import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { pickCompliment } from '../data/compliments';
import { DARES_BY_ID, type Dare } from '../data/dares';
import {
  countEligible,
  countRemaining,
  removeFromPools,
  selectNextDare,
} from '../logic/dareEngine';
import { DAY_MS } from '../logic/time';
import { loadState, saveState } from '../storage/storage';
import type { PersistedState, UserProfile } from '../storage/types';

export type Phase =
  | { name: 'loading' }
  | { name: 'onboarding' }
  | { name: 'dare'; dare: Dare; profile: UserProfile }
  | { name: 'compliment'; compliment: string }
  | { name: 'progress'; completed: number; from: number }
  | { name: 'countdown'; nextDareAvailableAt: number }
  | { name: 'finished'; profile: UserProfile; total: number };

const isLocked = (state: PersistedState, now: number) =>
  state.nextDareAvailableAt !== null && now < state.nextDareAvailableAt;

/**
 * Guards against the device clock moving backwards: the cooldown can never
 * be longer than 24 hours from "now".
 */
function clampCooldown(state: PersistedState, now: number): PersistedState {
  if (state.nextDareAvailableAt === null || state.nextDareAvailableAt - now <= DAY_MS) {
    return state;
  }
  return { ...state, nextDareAvailableAt: now + DAY_MS };
}

/** Assigns a new dare if none is active and the cooldown is over. */
function ensureDare(state: PersistedState, now: number): PersistedState {
  if (!state.profile || state.currentDareId || isLocked(state, now)) return state;
  const selection = selectNextDare(state.completedDareIds, state.pools, state.profile, now);
  if (!selection) return state;
  return {
    ...state,
    currentDareId: selection.dareId,
    pools: selection.pools,
    nextDareAvailableAt: null,
  };
}

const reconcile = (state: PersistedState, now: number) => ensureDare(clampCooldown(state, now), now);

export function useBuman() {
  const [state, setState] = useState<PersistedState | null>(null);
  const [compliment, setCompliment] = useState<string | null>(null);
  /**
   * Count the progress body fills from before the timer is shown; null once
   * it has been seen. Starts at 0 so every app open replays the fill.
   */
  const [progressFrom, setProgressFrom] = useState<number | null>(0);
  // Latest state for callbacks that may be invoked from a screen that is still fading out.
  const stateRef = useRef<PersistedState | null>(null);
  stateRef.current = state;

  const commit = useCallback((next: PersistedState) => {
    stateRef.current = next;
    setState(next);
    saveState(next).catch(() => undefined);
  }, []);

  /** Re-applies time-based rules; no-op (and no write) if nothing changed. */
  const refresh = useCallback(() => {
    const current = stateRef.current;
    if (!current) return;
    const next = reconcile(current, Date.now());
    if (next !== current) commit(next);
  }, [commit]);

  useEffect(() => {
    let mounted = true;
    loadState().then((loaded) => {
      if (!mounted) return;
      const next = reconcile(loaded, Date.now());
      if (next !== loaded) commit(next);
      else {
        stateRef.current = next;
        setState(next);
      }
    });
    return () => {
      mounted = false;
    };
  }, [commit]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') refresh();
      // Coming back from the background counts as opening the app again.
      if (status === 'background') setProgressFrom(0);
    });
    return () => subscription.remove();
  }, [refresh]);

  const completeOnboarding = useCallback(
    (profile: UserProfile) => {
      const state = stateRef.current;
      if (!state || state.profile) return;
      commit(reconcile({ ...state, profile }, Date.now()));
    },
    [commit],
  );

  const completeDare = useCallback(() => {
    const state = stateRef.current;
    if (!state?.currentDareId) return;

    const now = Date.now();
    const dareId = state.currentDareId;
    const message = pickCompliment(state.lastCompliment);

    commit({
      ...state,
      completedDareIds: state.completedDareIds.includes(dareId)
        ? state.completedDareIds
        : [...state.completedDareIds, dareId],
      currentDareId: null,
      pools: removeFromPools(state.pools, dareId),
      lastCompletedAt: now,
      nextDareAvailableAt: now + DAY_MS,
      lastCompliment: message,
    });
    setCompliment(message);
    setProgressFrom(state.completedDareIds.length);
  }, [commit]);

  const dismissCompliment = useCallback(() => setCompliment(null), []);
  const dismissProgress = useCallback(() => setProgressFrom(null), []);

  let phase: Phase = { name: 'loading' };
  if (state) {
    const currentDare = state.currentDareId ? DARES_BY_ID.get(state.currentDareId) : undefined;
    if (!state.profile) phase = { name: 'onboarding' };
    else if (compliment) phase = { name: 'compliment', compliment };
    else if (currentDare) phase = { name: 'dare', dare: currentDare, profile: state.profile };
    else if (progressFrom !== null)
      phase = { name: 'progress', completed: state.completedDareIds.length, from: progressFrom };
    else if (countRemaining(state.profile, state.completedDareIds) === 0)
      phase = { name: 'finished', profile: state.profile, total: countEligible(state.profile) };
    else if (state.nextDareAvailableAt !== null && isLocked(state, Date.now()))
      phase = { name: 'countdown', nextDareAvailableAt: state.nextDareAvailableAt };
  }

  return {
    phase,
    completeOnboarding,
    completeDare,
    dismissCompliment,
    dismissProgress,
    /** Called when the countdown reaches 00:00:00. */
    unlockNextDare: refresh,
  };
}
