import type { RegionId, WeatherType, EncounterType, Position } from './CommonTypes';

export interface RegionData {
  id: RegionId;
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number;
  encounters: EncounterEntry[];
  npcs: NPCData[];
  weatherPatterns: WeatherPattern[];
  resources: ResourceNode[];
  music: string;
  background: string;
  connections: RegionConnection[];
}

export interface EncounterEntry {
  creatureId: string;
  minLevel: number;
  maxLevel: number;
  chance: number;
  conditions?: {
    timePhase?: 'dawn' | 'day' | 'afternoon' | 'dusk' | 'night' | 'deepNight';
    weather?: WeatherType;
    requiresItem?: string;
  };
  type: EncounterType;
}

export interface RegionConnection {
  targetRegion: RegionId;
  position: Position;
  requiresItem?: string;
  requiresStat?: {
    stat: 'str' | 'spd' | 'int' | 'sta';
    value: number;
  };
}

export interface ResourceNode {
  id: string;
  type: 'node' | 'chest' | 'hidden';
  position: Position;
  resourceId: string;
  respawnTime: number;
  requiresTool?: string;
  isVisible: boolean;
}

export interface WeatherPattern {
  weather: WeatherType;
  probability: number;
  timePhases: Array<'dawn' | 'day' | 'afternoon' | 'dusk' | 'night' | 'deepNight'>;
  duration: number;
}

export interface NPCData {
  id: string;
  name: string;
  description: string;
  role: 'shopkeeper' | 'trainer' | 'questGiver' | 'story' | 'vendor';
  dialogue: DialogueTree;
  trades?: TradeOffer[];
  services?: NPCService[];
  position: Position;
  sprites: {
    idle: string;
    talk: string;
    happy: string;
  };
  schedule?: DailySchedule;
}

export interface NPCState {
  npcId: string;
  currentDialogue: string | null;
  friendship: number;
  tradesCompleted: number;
  lastInteraction: number | null;
  isAvailable: boolean;
  currentTask: string | null;
}

export interface DialogueTree {
  greetings: string[];
  topics: DialogueTopic[];
  goodbyes: string[];
  conditions?: {
    requiresQuest?: string;
    requiresFriendship?: number;
    requiresItem?: string;
  };
}

export interface DialogueTopic {
  id: string;
  text: string;
  responses: DialogueResponse[];
}

export interface DialogueResponse {
  text: string;
  nextTopic: string | null;
  action?: {
    type: 'openShop' | 'startQuest' | 'giveItem' | 'heal';
    data: unknown;
  };
}

export interface TradeOffer {
  itemId: string;
  cost: {
    currency: 'gold' | 'points' | 'item';
    amount: number;
    itemId?: string;
  };
  quantity: number;
  restockTime: number;
}

export interface NPCService {
  type: 'heal' | 'train' | 'store' | 'info';
  cost: number;
  description: string;
}

export interface DailySchedule {
  activities: {
    task: string;
    timePhase: 'dawn' | 'day' | 'afternoon' | 'dusk' | 'night' | 'deepNight';
    position: Position;
  }[];
}

export interface WeatherState {
  current: WeatherType;
  duration: number;
  nextWeather: WeatherType;
  timeUntilChange: number;
}

export interface WorldState {
  currentRegion: RegionId;
  discoveredRegions: RegionId[];
  playerPosition: Position;
  weather: WeatherState;
  gameTime: number;
  npcs: Record<string, NPCState>;
  activeQuests: string[];
  completedQuests: string[];
  unlockedShortcuts: string[];
}
