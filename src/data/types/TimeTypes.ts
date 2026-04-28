import type { TimePhase } from './CommonTypes';

export interface TimeState {
  gameTime: Date;
  lastRealTimestamp: number;
  totalPlayTime: number;
  phase: TimePhase;
  timeScale: number;
  isPaused: boolean;
  nextTickAt: number;
}
