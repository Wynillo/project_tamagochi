import type { ItemType, NeedType, StatType, StatusEffectType } from './CommonTypes';

export interface ItemData {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  stackable: boolean;
  maxStack: number;
  consumable: boolean;
  effects: ItemEffect[];
  sprite: string;
  animation?: string;
  conditions?: {
    minLevel?: number;
    requiresSpecies?: string[];
    requiresPersonality?: string[];
    timePhase?: string[];
  };
}

export interface ItemEffect {
  type: 'heal' | 'boost' | 'cure' | 'train' | 'evolve' | 'unlock';
  target: 'self' | 'creature' | 'party';
  stat?: StatType;
  needType?: NeedType;
  value: number;
  duration?: number;
  chance?: number;
  statusEffect?: StatusEffectType;
  animation?: string;
}

export interface InventoryState {
  items: InventoryItem[];
  currency: {
    gold: number;
    points: number;
  };
  capacity: number;
  equipment: EquipmentSlots;
  keyItems: string[];
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  acquiredAt: number;
  equipped?: boolean;
  metadata?: {
    obtainedFrom?: string;
    specialFlags?: string[];
  };
}

export interface EquipmentSlots {
  head?: EquippedItem;
  body?: EquippedItem;
  accessory?: EquippedItem;
}

export interface EquippedItem {
  itemId: string;
  durability: number;
  maxDurability: number;
  enchantments?: string[];
}
