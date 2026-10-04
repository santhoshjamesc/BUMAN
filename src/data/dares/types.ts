export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/** What the dare grows in the user. */
export type DarePillar = 'gratitude' | 'first' | 'influence' | 'growth';

/** 13–19 | 20–39 | 40+ */
export type AgeGroup = 'teen' | 'adult' | 'mature';

export type DareGender = 'woman' | 'man';

/** Raw dare as authored in the per-category data files. */
export interface DareSeed {
  /** Stable, never-reused identifier (e.g. `mor-001`). Persisted in completedDareIds. */
  id: string;
  text: string;
  pillar: DarePillar;
  /** Age groups this dare suits. Omitted = all ages. */
  ages?: AgeGroup[];
  /** Written specifically for this gender. Omitted = everyone. */
  gender?: DareGender;
}

export interface Dare extends DareSeed {
  timeOfDay: TimeOfDay;
}
