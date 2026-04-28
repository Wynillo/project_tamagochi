import type { PlayerState, GameSettings, RetiredCreature } from '../../state/useGameStore';

type StoreSet = (updater: (state: PlayerState) => void) => void;

export const createPlayerActions = (set: StoreSet, _get: () => PlayerState) => ({
  updateSettings: (settings: Partial<GameSettings>) =>
    set((state) => ({
      ...state,
      settings: {
        ...state.settings,
        ...settings,
      },
    })),

  addToHallOfFame: (creature: RetiredCreature) =>
    set((state) => ({
      ...state,
      hallOfFame: [...state.hallOfFame, creature],
    })),

  unlockAchievement: (achievementId: string) =>
    set((state) => ({
      ...state,
      achievements: state.achievements.includes(achievementId)
        ? state.achievements
        : [...state.achievements, achievementId],
    })),

  setTutorialFlag: (flag: string, value: boolean) =>
    set((state) => ({
      ...state,
      tutorialFlags: {
        ...state.tutorialFlags,
        [flag]: value,
      },
    })),
});

export type PlayerActions = ReturnType<typeof createPlayerActions>;
