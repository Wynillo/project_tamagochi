import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { CreatureState, Needs, StatusEffect, LifeEvent } from '../data/types/CreatureTypes';
import type { WorldState, WeatherState, NPCState } from '../data/types/WorldTypes';
import type { TimeState } from '../data/types/TimeTypes';
import type { InventoryState, InventoryItem, EquipmentSlots } from '../data/types/ItemTypes';
import type { RegionId, SceneId, LifeStage, TimePhase, PersonalityId } from '../data/types/CommonTypes';
import { SaveManager } from '../persistence/SaveManager';

type PersonalityIdType = PersonalityId;

interface SessionState {
  currentScene: SceneId;
  activeEvent: string | null;
  isPaused: boolean;
  pendingNotifications: Notification[];
}

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface RetiredCreature {
  id: string;
  name: string;
  finalFormId: string;
  lifespanHours: number;
  achievements: string[];
  retiredAt: number;
}

export interface PlayerState {
  settings: GameSettings;
  hallOfFame: RetiredCreature[];
  achievements: string[];
  tutorialFlags: Record<string, boolean>;
}

export interface GameState {
  creature: CreatureState;
  world: WorldState;
  time: TimeState;
  inventory: InventoryState;
  player: PlayerState;
  session: SessionState;
}

interface CreatureActions {
  setCreatureName: (name: string) => void;
  updateNeeds: (delta: Partial<Needs>) => void;
  setNeed: (needType: keyof Needs, value: number) => void;
  addStatGain: (stat: keyof import('../data/types/CommonTypes').Stats, amount: number) => void;
  addPersonalityTrait: (trait: PersonalityIdType) => void;
  recordCareMistake: () => void;
  setStage: (stage: LifeStage) => void;
  setSpecies: (speciesId: string) => void;
  addLifeEvent: (event: Omit<LifeEvent, 'timestamp'>) => void;
  addStatusEffect: (effect: StatusEffect) => void;
  removeStatusEffect: (effectId: string) => void;
  clearExpiredStatusEffects: () => void;
  updateFatigue: (delta: number) => void;
}

interface WorldActions {
  setCurrentRegion: (regionId: RegionId) => void;
  unlockRegion: (regionId: RegionId) => void;
  setNPCState: (npcId: string, state: Partial<NPCState>) => void;
  setEncounterFlag: (flag: string, value: boolean) => void;
  setWeather: (weather: WeatherState) => void;
}

interface TimeActions {
  tick: (deltaMinutes: number) => void;
  setGameTime: (time: Date) => void;
  setPhase: (phase: TimePhase) => void;
  advanceTime: (minutes: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setTimeScale: (scale: number) => void;
  updateLastRealTimestamp: (timestamp: number) => void;
}

interface InventoryActions {
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  equipItem: (itemId: string, slot: keyof EquipmentSlots) => void;
  unequipItem: (slot: keyof EquipmentSlots) => void;
  setMaxCapacity: (capacity: number) => void;
}

interface PlayerActions {
  updateSettings: (settings: Partial<GameSettings>) => void;
  addToHallOfFame: (creature: RetiredCreature) => void;
  unlockAchievement: (achievementId: string) => void;
  setTutorialFlag: (flag: string, value: boolean) => void;
}

interface SessionActions {
  setCurrentScene: (sceneId: SceneId) => void;
  setActiveEvent: (eventId: string | null) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotification: (notificationId: string) => void;
  clearNotifications: () => void;
}

interface GameActions {
  resetStore: () => void;
}

type GameStoreState = GameState &
  CreatureActions &
  WorldActions &
  TimeActions &
  InventoryActions &
  PlayerActions &
  SessionActions &
  GameActions;

const getInitialState = (): GameState => ({
  creature: {
    id: '',
    name: '',
    stage: 'egg',
    speciesId: '',
    stats: { str: 1, spd: 1, int: 1, sta: 1 },
    needs: { hunger: 100, energy: 100, mood: 100, discipline: 100 },
    personality: { traits: [], traitStrengths: {} as Record<PersonalityIdType, number> },
    evolution: {
      currentFormId: '',
      evolutionHistory: [],
      nextEvolutionAt: null,
      evolutionCandidates: [],
    },
    statusEffects: [],
    history: [],
    careMistakes: 0,
    fatigue: 0,
    stageStartTime: Date.now(),
    battlesWon: 0,
    battlesLost: 0,
  },
  world: {
    currentRegion: 'nursery',
    discoveredRegions: ['nursery'],
    playerPosition: { x: 0, y: 0 },
    weather: {
      current: 'clear',
      duration: 60,
      nextWeather: 'clear',
      timeUntilChange: 60,
    },
    gameTime: Date.now(),
    npcs: {},
    activeQuests: [],
    completedQuests: [],
    unlockedShortcuts: [],
  },
  time: {
    gameTime: new Date(),
    lastRealTimestamp: Date.now(),
    totalPlayTime: 0,
    phase: 'day',
    timeScale: 1,
    isPaused: false,
    nextTickAt: Date.now(),
  },
  inventory: {
    items: [],
    currency: { gold: 0, points: 0 },
    capacity: 20,
    equipment: {},
    keyItems: [],
  },
  player: {
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      notificationsEnabled: true,
    },
    hallOfFame: [],
    achievements: [],
    tutorialFlags: {},
  },
  session: {
    currentScene: 'boot',
    activeEvent: null,
    isPaused: false,
    pendingNotifications: [],
  },
});

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, _get) => ({
      ...getInitialState(),

      resetStore: () => {
        set(getInitialState());
      },

      setCreatureName: (name: string) =>
        set((state) => ({
          ...state,
          creature: { ...state.creature, name },
        })),

      updateNeeds: (delta: Partial<Needs>) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            needs: { ...state.creature.needs, ...delta },
          },
        })),

      setNeed: (needType: keyof Needs, value: number) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            needs: {
              ...state.creature.needs,
              [needType]: Math.max(0, Math.min(100, value)),
            },
          },
        })),

      addStatGain: (stat: keyof import('../data/types/CommonTypes').Stats, amount: number) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            stats: {
              ...state.creature.stats,
              [stat]: state.creature.stats[stat] + amount,
            },
          },
        })),

      addPersonalityTrait: (trait: PersonalityIdType) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            personality: {
              ...state.creature.personality,
              traits: state.creature.personality.traits.includes(trait)
                ? state.creature.personality.traits
                : [...state.creature.personality.traits, trait],
              traitStrengths: {
                ...state.creature.personality.traitStrengths,
                [trait]: (state.creature.personality.traitStrengths[trait] || 0) + 1,
              },
            },
          },
        })),

      recordCareMistake: () =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            careMistakes: state.creature.careMistakes + 1,
          },
        })),

      setStage: (stage: LifeStage) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            stage,
            stageStartTime: Date.now(),
          },
        })),

      setSpecies: (speciesId: string) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            speciesId,
          },
        })),

      addLifeEvent: (event: Omit<LifeEvent, 'timestamp'>) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            history: [
              ...state.creature.history,
              { ...event, timestamp: Date.now() },
            ],
          },
        })),

      addStatusEffect: (effect: StatusEffect) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            statusEffects: [...state.creature.statusEffects, effect],
          },
        })),

      removeStatusEffect: (effectId: string) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            statusEffects: state.creature.statusEffects.filter(
              (e) => e.id !== effectId
            ),
          },
        })),

      clearExpiredStatusEffects: () =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            statusEffects: state.creature.statusEffects.filter(
              (e) => e.remainingMinutes > 0
            ),
          },
        })),

      updateFatigue: (delta: number) =>
        set((state) => ({
          ...state,
          creature: {
            ...state.creature,
            fatigue: Math.max(0, Math.min(100, state.creature.fatigue + delta)),
          },
        })),

      setCurrentRegion: (regionId: RegionId) =>
        set((state) => ({
          ...state,
          world: { ...state.world, currentRegion: regionId },
        })),

      unlockRegion: (regionId: RegionId) =>
        set((state) => ({
          ...state,
          world: {
            ...state.world,
            discoveredRegions: state.world.discoveredRegions.includes(regionId)
              ? state.world.discoveredRegions
              : [...state.world.discoveredRegions, regionId],
          },
        })),

      setNPCState: (npcId: string, npcState: Partial<NPCState>) =>
        set((state) => {
          const existingNPC = state.world.npcs[npcId];
          const newNPC = existingNPC
            ? { ...existingNPC, ...npcState }
            : {
                npcId,
                currentDialogue: null,
                friendship: 0,
                tradesCompleted: 0,
                lastInteraction: null,
                isAvailable: true,
                currentTask: null,
                ...npcState,
              };
          return {
            ...state,
            world: {
              ...state.world,
              npcs: { ...state.world.npcs, [npcId]: newNPC },
            },
          };
        }),

      setEncounterFlag: (flag: string, value: boolean) =>
        set((state) => ({
          ...state,
          world: {
            ...(state.world as WorldState & Record<string, unknown>),
            [flag]: value,
          },
        })),

      setWeather: (weather: WeatherState) =>
        set((state) => ({
          ...state,
          world: { ...state.world, weather },
        })),

      tick: (deltaMinutes: number) =>
        set((state) => ({
          ...state,
          time: {
            ...state.time,
            gameTime: new Date(state.time.gameTime.getTime() + deltaMinutes * 60000),
            totalPlayTime: state.time.totalPlayTime + deltaMinutes,
          },
        })),

      setGameTime: (time: Date) =>
        set((state) => ({
          ...state,
          time: { ...state.time, gameTime: time },
        })),

      setPhase: (phase: TimePhase) =>
        set((state) => ({
          ...state,
          time: { ...state.time, phase },
        })),

      advanceTime: (minutes: number) =>
        set((state) => ({
          ...state,
          time: {
            ...state.time,
            gameTime: new Date(state.time.gameTime.getTime() + minutes * 60000),
            totalPlayTime: state.time.totalPlayTime + minutes,
          },
        })),

      pauseGame: () =>
        set((state) => ({
          ...state,
          time: { ...state.time, isPaused: true },
        })),

      resumeGame: () =>
        set((state) => ({
          ...state,
          time: {
            ...state.time,
            isPaused: false,
            nextTickAt: Date.now(),
          },
        })),

      setTimeScale: (scale: number) =>
        set((state) => ({
          ...state,
          time: {
            ...state.time,
            timeScale: Math.max(0.1, Math.min(10, scale)),
          },
        })),

      updateLastRealTimestamp: (timestamp: number) =>
        set((state) => ({
          ...state,
          time: { ...state.time, lastRealTimestamp: timestamp },
        })),

      addItem: (item: InventoryItem) =>
        set((state) => {
          const existingItem = state.inventory.items.find(
            (i: InventoryItem) => i.itemId === item.itemId
          );
          let newItems: InventoryItem[];
          if (existingItem && existingItem.quantity !== undefined) {
            newItems = state.inventory.items.map((i: InventoryItem) =>
              i.itemId === item.itemId
                ? { ...i, quantity: (i.quantity ?? 0) + item.quantity }
                : i
            );
          } else {
            newItems = [...state.inventory.items, item];
          }
          return {
            ...state,
            inventory: { ...state.inventory, items: newItems },
          };
        }),

      removeItem: (itemId: string, quantity: number = 1) =>
        set((state) => {
          const itemIndex = state.inventory.items.findIndex(
            (i) => i.itemId === itemId
          );
          if (itemIndex === -1) return state;

          const item = state.inventory.items[itemIndex];
          let newItems: InventoryItem[];
          if ((item.quantity ?? 0) <= quantity) {
            newItems = state.inventory.items.filter((_, i) => i !== itemIndex);
          } else {
            newItems = state.inventory.items.map((i, iIdx) =>
              iIdx === itemIndex ? { ...i, quantity: (i.quantity ?? 0) - quantity } : i
            );
          }
          return {
            ...state,
            inventory: { ...state.inventory, items: newItems },
          };
        }),

      equipItem: (itemId: string, slot: keyof EquipmentSlots) =>
        set((state) => {
          const item = state.inventory.items.find((i) => i.itemId === itemId);
          const newItems = item
            ? state.inventory.items.map((i) =>
                i.itemId === itemId ? { ...i, equipped: true } : i
              )
            : state.inventory.items;
          return {
            ...state,
            inventory: {
              ...state.inventory,
              equipment: {
                ...state.inventory.equipment,
                [slot]: { itemId, durability: 100, maxDurability: 100 },
              },
              items: newItems,
            },
          };
        }),

      unequipItem: (slot: keyof EquipmentSlots) =>
        set((state) => {
          const equipped = state.inventory.equipment[slot];
          if (!equipped) return state;
          const item = state.inventory.items.find((i) => i.itemId === equipped.itemId);
          const newItems = item
            ? state.inventory.items.map((i) =>
                i.itemId === equipped.itemId ? { ...i, equipped: false } : i
              )
            : state.inventory.items;
          return {
            ...state,
            inventory: {
              ...state.inventory,
              equipment: { ...state.inventory.equipment, [slot]: undefined },
              items: newItems,
            },
          };
        }),

      setMaxCapacity: (capacity: number) =>
        set((state) => ({
          ...state,
          inventory: { ...state.inventory, capacity },
        })),

      updateSettings: (settings: Partial<GameSettings>) =>
        set((state) => ({
          ...state,
          player: {
            ...state.player,
            settings: { ...state.player.settings, ...settings },
          },
        })),

      addToHallOfFame: (creature: RetiredCreature) =>
        set((state) => ({
          ...state,
          player: { ...state.player, hallOfFame: [...state.player.hallOfFame, creature] },
        })),

      unlockAchievement: (achievementId: string) =>
        set((state) => ({
          ...state,
          player: {
            ...state.player,
            achievements: state.player.achievements.includes(achievementId)
              ? state.player.achievements
              : [...state.player.achievements, achievementId],
          },
        })),

      setTutorialFlag: (flag: string, value: boolean) =>
        set((state) => ({
          ...state,
          player: {
            ...state.player,
            tutorialFlags: { ...state.player.tutorialFlags, [flag]: value },
          },
        })),

      setCurrentScene: (sceneId: SceneId) =>
        set((state) => ({
          ...state,
          session: { ...state.session, currentScene: sceneId },
        })),

      setActiveEvent: (eventId: string | null) =>
        set((state) => ({
          ...state,
          session: { ...state.session, activeEvent: eventId },
        })),

      pauseSession: () =>
        set((state) => ({
          ...state,
          session: { ...state.session, isPaused: true },
        })),

      resumeSession: () =>
        set((state) => ({
          ...state,
          session: { ...state.session, isPaused: false },
        })),

      addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) =>
        set((state) => ({
          ...state,
          session: {
            ...state.session,
            pendingNotifications: [
              ...state.session.pendingNotifications,
              {
                ...notification,
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
              },
            ],
          },
        })),

      clearNotification: (notificationId: string) =>
        set((state) => ({
          ...state,
          session: {
            ...state.session,
            pendingNotifications: state.session.pendingNotifications.filter(
              (n) => n.id !== notificationId
            ),
          },
        })),

      clearNotifications: () =>
        set((state) => ({
          ...state,
          session: { ...state.session, pendingNotifications: [] },
        })),
    }),
      {
        name: 'digital-companion-game',
        storage: createJSONStorage(() => ({
          getItem: async (_name: string) => {
            try {
              const save = await SaveManager.load('autosave');
              return save ? JSON.stringify(save) : null;
            } catch {
              return null;
            }
          },
          setItem: async (_name: string, value: string) => {
            try {
              await SaveManager.save('autosave', JSON.parse(value));
            } catch {
              // Ignore save errors
            }
          },
          removeItem: async (_name: string) => {
            try {
              await SaveManager.deleteSave('autosave');
            } catch {
              // Ignore delete errors
            }
          },
        })),
        partialize: (state: GameStoreState) => ({
          creature: state.creature,
          world: state.world,
          time: state.time,
          inventory: state.inventory,
          player: state.player,
        }),
      }
    )
);

let storeInstance: ReturnType<typeof useGameStore> | null = null;

export const getGameStore = (): ReturnType<typeof useGameStore> => {
  if (!storeInstance) {
    storeInstance = useGameStore;
  }
  return storeInstance;
};

export default useGameStore;
