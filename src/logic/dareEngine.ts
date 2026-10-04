import {
  ALL_DARES,
  DARES_BY_ID,
  DARES_BY_TIME,
  type AgeGroup,
  type Dare,
  type DareGender,
  type TimeOfDay,
} from '../data/dares';
import type { DarePools, UserProfile } from '../storage/types';
import { getTimeOfDay } from './time';

export const POOL_SIZE = 100;

/**
 * When a time-of-day bucket runs low on unused dares, the pool is topped up
 * from the closest-feeling buckets so the user can reach every eligible dare.
 */
const FALLBACK_ORDER: Record<TimeOfDay, readonly TimeOfDay[]> = {
  morning: ['morning', 'afternoon', 'evening', 'night'],
  afternoon: ['afternoon', 'morning', 'evening', 'night'],
  evening: ['evening', 'night', 'afternoon', 'morning'],
  night: ['night', 'evening', 'afternoon', 'morning'],
};

type Random = () => number;

export function getAgeGroup(age: number): AgeGroup {
  if (age < 20) return 'teen';
  if (age < 40) return 'adult';
  return 'mature';
}

/** Non-binary and "Prefer not to say" receive only dares written for everyone. */
function getDareGender(profile: UserProfile): DareGender | null {
  if (profile.gender === 'Woman') return 'woman';
  if (profile.gender === 'Man') return 'man';
  return null;
}

/** Whether a dare suits this user's age group and gender. */
export function isEligible(dare: Dare, profile: UserProfile): boolean {
  if (dare.ages && !dare.ages.includes(getAgeGroup(profile.age))) return false;
  if (dare.gender && dare.gender !== getDareGender(profile)) return false;
  return true;
}

/** How many dares this user can ever receive. */
export function countEligible(profile: UserProfile): number {
  return ALL_DARES.filter((dare) => isEligible(dare, profile)).length;
}

/** How many eligible dares this user has not yet completed. */
export function countRemaining(profile: UserProfile, completedDareIds: readonly string[]): number {
  const completed = new Set(completedDareIds);
  return ALL_DARES.filter((dare) => !completed.has(dare.id) && isEligible(dare, profile)).length;
}

function shuffle<T>(items: T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Builds a randomized pool of up to POOL_SIZE unused dare IDs that suit
 * `timeOfDay` and the user's age group and gender.
 */
export function buildPool(
  timeOfDay: TimeOfDay,
  completed: ReadonlySet<string>,
  profile: UserProfile,
  random: Random = Math.random,
): string[] {
  const pool: string[] = [];
  for (const bucket of FALLBACK_ORDER[timeOfDay]) {
    const unused = DARES_BY_TIME[bucket]
      .filter((d) => !completed.has(d.id) && isEligible(d, profile))
      .map((d) => d.id);
    pool.push(...shuffle(unused, random).slice(0, POOL_SIZE - pool.length));
    if (pool.length >= POOL_SIZE) break;
  }
  return pool;
}

export interface DareSelection {
  dareId: string;
  pools: DarePools;
}

/**
 * Selects the next dare for the given moment.
 *
 * 1. Determine the time-of-day bucket from the device's local time.
 * 2. Reuse that bucket's saved pool, stripped of completed, unknown or ineligible IDs.
 * 3. If the pool is empty, build a fresh one from unused, eligible dares only.
 * 4. Pick randomly from the pool.
 *
 * Returns null when every eligible dare has been completed.
 */
export function selectNextDare(
  completedDareIds: readonly string[],
  pools: DarePools,
  profile: UserProfile,
  now: number,
  random: Random = Math.random,
): DareSelection | null {
  const timeOfDay = getTimeOfDay(new Date(now));
  const completed = new Set(completedDareIds);
  const isAvailable = (id: string) => {
    const dare = DARES_BY_ID.get(id);
    return dare !== undefined && !completed.has(id) && isEligible(dare, profile);
  };

  let pool = (pools[timeOfDay] ?? []).filter(isAvailable);
  if (pool.length === 0) pool = buildPool(timeOfDay, completed, profile, random);
  if (pool.length === 0) return null;

  const dareId = pool[Math.floor(random() * pool.length)];
  return {
    dareId,
    pools: { ...pools, [timeOfDay]: pool.filter((id) => id !== dareId) },
  };
}

/** Removes a completed dare from every saved pool. */
export function removeFromPools(pools: DarePools, dareId: string): DarePools {
  const next: DarePools = {};
  for (const key of Object.keys(pools) as TimeOfDay[]) {
    next[key] = pools[key]?.filter((id) => id !== dareId);
  }
  return next;
}
