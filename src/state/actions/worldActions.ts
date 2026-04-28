import type { WorldState, WeatherState, NPCState } from '../../data/types/WorldTypes';
import type { RegionId } from '../../data/types/CommonTypes';

type StoreSet = (updater: (state: WorldState) => void) => void;

export const createWorldActions = (set: StoreSet, _get: () => WorldState) => ({
  setCurrentRegion: (regionId: RegionId) =>
    set((state) => ({
      ...state,
      currentRegion: regionId,
    })),

  unlockRegion: (regionId: RegionId) =>
    set((state) => ({
      ...state,
      discoveredRegions: state.discoveredRegions.includes(regionId)
        ? state.discoveredRegions
        : [...state.discoveredRegions, regionId],
    })),

  setNPCState: (npcId: string, npcState: Partial<NPCState>) =>
    set((state) => {
      const existingNPC = state.npcs[npcId];
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
        npcs: {
          ...state.npcs,
          [npcId]: newNPC,
        },
      };
    }),

  setEncounterFlag: (flag: string, value: boolean) =>
    set((state) => ({
      ...state,
      [flag]: value,
    } as WorldState & Record<string, unknown>)),

  setWeather: (weather: WeatherState) =>
    set((state) => ({
      ...state,
      weather,
    })),
});

export type WorldActions = ReturnType<typeof createWorldActions>;
