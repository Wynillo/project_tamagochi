import type { Stats, AttackRiskLevel, ElementType, StatType, StatusEffectType } from './CommonTypes';
import type { PersonalityState, StatusEffect } from './CreatureTypes';
import type { Tactic } from './CommonTypes';

export type { StatusEffectType, Tactic };

export interface AttackData {
  id: string;
  name: string;
  element: ElementType;
  power: number;
  accuracy: number;
  riskLevel: AttackRiskLevel;
  statScaling: StatType;
  scalingFactor: number;
  specialEffect?: {
    type: StatusEffectType;
    chance: number;
    duration: number;
    value: number;
  };
  animation: string;
  sound: string;
}

export interface Attack {
  id: string;
  currentCooldown: number;
}

export interface CombatCreature {
  creatureId: string;
  name: string;
  currentHp: number;
  maxHp: number;
  stats: Stats;
  attacks: Attack[];
  availableAttacks: AttackData[];
  personality: PersonalityState;
  discipline: number;
  statusEffects: StatusEffect[];
  isPlayer: boolean;
}

export interface CombatState {
  phase: 'init' | 'start' | 'player' | 'tacticSelected' | 'creatureAI' | 'attackChosen' | 'resolve' | 'checkWin' | 'enemyTurn' | 'victory' | 'defeat' | 'end';
  playerCreature: CombatCreature;
  enemyCreature: CombatCreature;
  turnOrder: 'player' | 'enemy';
  roundNumber: number;
  selectedTactic: Tactic | null;
  battleLog: BattleLogEntry[];
  isPaused: boolean;
  rewards: ItemReward[];
  timeSkipped: number;
}

export interface BattleLogEntry {
  timestamp: number;
  actor: 'player' | 'enemy' | 'system';
  action: string;
  description: string;
  damage?: number;
  healing?: number;
  statusEffect?: StatusEffectType;
}

export interface BattleResult {
  winner: 'player' | 'enemy' | 'fled';
  rewards: ItemReward[];
  flags: string[];
  timeSkipped: number;
  careMistake: boolean;
}

export interface ItemReward {
  itemId: string;
  quantity: number;
}

export interface AttackResult {
  damage: number;
  isHit: boolean;
  isCrit: boolean;
  effectsApplied: string[];
  recoilDamage: number;
}
