import { afternoonDares } from './afternoon';
import { eveningDares } from './evening';
import { morningDares } from './morning';
import { nightDares } from './night';
import type { Dare, DareSeed, TimeOfDay } from './types';

export type { AgeGroup, Dare, DareGender, DarePillar, DareSeed, TimeOfDay } from './types';

const withTime = (seeds: DareSeed[], timeOfDay: TimeOfDay): Dare[] =>
  seeds.map((seed) => ({ ...seed, timeOfDay }));

export const DARES_BY_TIME: Record<TimeOfDay, readonly Dare[]> = {
  morning: withTime(morningDares, 'morning'),
  afternoon: withTime(afternoonDares, 'afternoon'),
  evening: withTime(eveningDares, 'evening'),
  night: withTime(nightDares, 'night'),
};

export const ALL_DARES: readonly Dare[] = [
  ...DARES_BY_TIME.morning,
  ...DARES_BY_TIME.afternoon,
  ...DARES_BY_TIME.evening,
  ...DARES_BY_TIME.night,
];

export const DARES_BY_ID: ReadonlyMap<string, Dare> = new Map(
  ALL_DARES.map((dare) => [dare.id, dare]),
);

export const TOTAL_DARES = ALL_DARES.length;
