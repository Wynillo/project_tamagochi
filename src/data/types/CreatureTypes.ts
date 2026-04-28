import type { LifeStage, ElementType, PersonalityId, Stats, GrowthRates, SleepType, StatusEffectType } from './CommonTypes';

export interface CreatureData {
  id: string;
  name: string;
  stage: LifeStage;
  element: ElementType;
  baseStats: Stats;
  growthRates: GrowthRates;
  lifespanHours: number;
  sleepSchedule: SleepType;
  sprites: {
    idle: string;
    happy: string;
    sad: string;
    sleeping: string;
    eating: string;
    training: string;
    battleIdle: string;
    attacks: string[];
    evolutionIn: string;
    evolutionOut: string;
  };
  sounds: {
    cry: string;
    happy: string;
    hurt: string;
    attack: string[];
  };
  personalityAffinities: Record<PersonalityId, number>;
  evolutionPaths: EvolutionPath[];
  learnableAttacks: string[];
  description: string;
  lore: string;
  discovered: boolean;
}

export interface Needs {
  hunger: number;
  energy: number;
  mood: number;
  discipline: number;
}

export interface PersonalityState {
  traits: PersonalityId[];
  traitStrengths: Record<PersonalityId, number>;
}

export interface EvolutionState {
  currentFormId: string;
  evolutionHistory: string[];
  nextEvolutionAt: number | null;
  evolutionCandidates: EvolutionCandidate[];
}

export interface EvolutionCondition {
  type: 'statThreshold' | 'careQuality' | 'personality' | 'battleRecord' | 'hidden' | 'timeOfDay';
  key: string;
  operator: '>' | '<' | '==' | '>=' | '<=';
  value: number | string | boolean;
  weight: number;
}

export interface EvolutionPath {
  targetCreatureId: string;
  conditions: EvolutionCondition[];
  weightBonus: number;
}

export interface EvolutionCandidate {
  creatureId: string;
  totalWeight: number;
  matchedConditions: string[];
  isHidden: boolean;
}

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  durationMinutes: number;
  remainingMinutes: number;
}

export interface LifeEvent {
  timestamp: number;
  type: string;
  description: string;
}

export interface CreatureState {
  id: string;
  name: string;
  stage: LifeStage;
  speciesId: string;
  stats: Stats;
  needs: Needs;
  personality: PersonalityState;
  evolution: EvolutionState;
  statusEffects: StatusEffect[];
  history: LifeEvent[];
  careMistakes: number;
  fatigue: number;
  stageStartTime: number;
  battlesWon: number;
  battlesLost: number;
}

