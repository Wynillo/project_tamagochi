import type { TimeState } from '../../data/types/TimeTypes';
import type { TimePhase } from '../../data/types/CommonTypes';

type StoreSet = (updater: (state: TimeState) => void) => void;

export const createTimeActions = (set: StoreSet, _get: () => TimeState) => ({
  tick: (deltaMinutes: number) =>
    set((state) => ({
      ...state,
      gameTime: new Date(state.gameTime.getTime() + deltaMinutes * 60000),
      totalPlayTime: state.totalPlayTime + deltaMinutes,
    })),

  setGameTime: (time: Date) =>
    set((state) => ({
      ...state,
      gameTime: time,
    })),

  setPhase: (phase: TimePhase) =>
    set((state) => ({
      ...state,
      phase,
    })),

  advanceTime: (minutes: number) =>
    set((state) => ({
      ...state,
      gameTime: new Date(state.gameTime.getTime() + minutes * 60000),
      totalPlayTime: state.totalPlayTime + minutes,
    })),

  pauseGame: () =>
    set((state) => ({
      ...state,
      isPaused: true,
    })),

  resumeGame: () =>
    set((state) => ({
      ...state,
      isPaused: false,
      nextTickAt: Date.now(),
    })),

  setTimeScale: (scale: number) =>
    set((state) => ({
      ...state,
      timeScale: Math.max(0.1, Math.min(10, scale)),
    })),

  updateLastRealTimestamp: (timestamp: number) =>
    set((state) => ({
      ...state,
      lastRealTimestamp: timestamp,
    })),
});

export type TimeActions = ReturnType<typeof createTimeActions>;
