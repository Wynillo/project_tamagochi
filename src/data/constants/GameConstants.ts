import type { LifeStage, TimePhase, GameRank } from '../types/CommonTypes';

export const NEED_DECAY_RATES: Record<LifeStage, Record<'hunger' | 'energy' | 'mood' | 'discipline', number>> = {
  egg: { hunger: 0, energy: 0, mood: 0, discipline: 0 },
  baby: { hunger: 5, energy: 4, mood: 3, discipline: 1 },
  child: { hunger: 4, energy: 3, mood: 2, discipline: 2 },
  adult: { hunger: 3, energy: 2, mood: 2, discipline: 3 },
  mature: { hunger: 2, energy: 2, mood: 1, discipline: 4 },
  elder: { hunger: 3, energy: 4, mood: 2, discipline: 3 },
};

export const CARE_MISTAKE_THRESHOLDS = {
  minor: 3,
  moderate: 5,
  severe: 10,
  critical: 20,
} as const;

export const TIME_PHASES: Record<TimePhase, { start: number; end: number }> = {
  dawn: { start: 5, end: 7 },
  day: { start: 7, end: 12 },
  afternoon: { start: 12, end: 17 },
  dusk: { start: 17, end: 20 },
  night: { start: 20, end: 23 },
  deepNight: { start: 23, end: 5 },
};

export const STAT_TRAINING_GAINS: Record<GameRank, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 5,
  S: 8,
};

export const FATIGUE_THRESHOLDS = {
  tired: 30,
  exhausted: 60,
  collapsed: 90,
} as const;

export const EVOLUTION_WEIGHTS = {
  careQuality: 0.3,
  statRequirements: 0.25,
  personality: 0.2,
  battleRecord: 0.15,
  hidden: 0.1,
} as const;

export const LIFE_STAGE_THRESHOLDS: Record<LifeStage, number> = {
  egg: 0,
  baby: 2,
  child: 12,
  adult: 48,
  mature: 120,
  elder: 200,
};

export const OFFLINE_SIMULATION = {
  maxOfflineHours: 48,
  tickRateMinutes: 15,
  decayMultiplier: 0.5,
  randomEventChance: 0.1,
  maxRandomEvents: 5,
} as const;

export const SAVE_SETTINGS = {
  autoSaveInterval: 60000,
  maxSaveSlots: 3,
  compressionEnabled: true,
  cloudSyncEnabled: false,
} as const;

export const MAX_STAT_VALUE = 100;
export const MAX_NEED_VALUE = 100;
export const INITIAL_EGG_SPECIES_IDS: string[] = ['SPARKLESPHERE'];
