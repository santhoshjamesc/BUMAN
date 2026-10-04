import AsyncStorage from '@react-native-async-storage/async-storage';

import { DARES_BY_ID } from '../data/dares';
import { INITIAL_STATE, type PersistedState } from './types';

// v2: dares were rewritten with age/gender targeting, so v1 progress no longer maps to the same texts.
const STORAGE_KEY = 'buman:state:v2';

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Defensively merges whatever was on disk with defaults so corrupt data never crashes the app. */
function sanitize(raw: unknown): PersistedState {
  if (!raw || typeof raw !== 'object') return INITIAL_STATE;
  const data = raw as Partial<PersistedState>;

  const completedDareIds = Array.isArray(data.completedDareIds)
    ? [...new Set(data.completedDareIds.filter((id) => typeof id === 'string'))]
    : [];
  const completed = new Set(completedDareIds);

  const currentDareId =
    typeof data.currentDareId === 'string' &&
    DARES_BY_ID.has(data.currentDareId) &&
    !completed.has(data.currentDareId)
      ? data.currentDareId
      : null;

  const profile =
    data.profile && typeof data.profile.name === 'string' && isNumber(data.profile.age)
      ? data.profile
      : null;

  return {
    version: 1,
    profile,
    completedDareIds,
    currentDareId,
    pools: data.pools && typeof data.pools === 'object' ? data.pools : {},
    lastCompletedAt: isNumber(data.lastCompletedAt) ? data.lastCompletedAt : null,
    nextDareAvailableAt: isNumber(data.nextDareAvailableAt) ? data.nextDareAvailableAt : null,
    lastCompliment: typeof data.lastCompliment === 'string' ? data.lastCompliment : null,
  };
}

export async function loadState(): Promise<PersistedState> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? sanitize(JSON.parse(json)) : INITIAL_STATE;
  } catch {
    return INITIAL_STATE;
  }
}

// Writes are chained so they always land on disk in the order they were made.
let writeQueue: Promise<void> = Promise.resolve();

export function saveState(state: PersistedState): Promise<void> {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)));
  return writeQueue;
}
