import type { TimeOfDay } from '../data/dares';

export type Gender = 'Woman' | 'Man' | 'Non-binary' | 'Prefer not to say';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
}

/** Saved, randomized pools of unused dare IDs, one per time-of-day bucket. */
export type DarePools = Partial<Record<TimeOfDay, string[]>>;

export interface PersistedState {
  version: 1;
  profile: UserProfile | null;
  /** Every dare the user has finished. These are never shown again. */
  completedDareIds: string[];
  /** The dare currently revealed to the user, if any. */
  currentDareId: string | null;
  pools: DarePools;
  /** Epoch ms of the most recent completion. */
  lastCompletedAt: number | null;
  /** Epoch ms when the next dare unlocks. */
  nextDareAvailableAt: number | null;
  lastCompliment: string | null;
}

export const INITIAL_STATE: PersistedState = {
  version: 1,
  profile: null,
  completedDareIds: [],
  currentDareId: null,
  pools: {},
  lastCompletedAt: null,
  nextDareAvailableAt: null,
  lastCompliment: null,
};
