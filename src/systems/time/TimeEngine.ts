import type { TimeState } from '@/data/types/TimeTypes';
import type { TimePhase } from '@/data/types/CommonTypes';
import { TIME_PHASES } from '@/data/constants/GameConstants';

export class TimeEngine {
  private intervalId: number | null = null;
  private tickIntervalMs = 1000; // 1 real second = 1 game minute
  private onPhaseChange?: (prev: TimePhase, next: TimePhase) => void;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private getState: () => TimeState,
    private setState: (updater: (state: TimeState) => void) => void,
    private onTick?: (deltaMinutes: number) => void,
  ) {}

  start() {
    if (this.intervalId !== null) {
      return;
    }
    this.setState((s) => {
      s.nextTickAt = Date.now();
      s.isPaused = false;
    });
    this.intervalId = window.setInterval(() => this.tick(), this.tickIntervalMs);
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.setState((s) => {
      s.isPaused = true;
    });
  }

  tick() {
    const state = this.getState();
    if (state.isPaused) {
      return;
    }

    const now = Date.now();
    const deltaMs = now - state.nextTickAt;
    
    if (deltaMs < this.tickIntervalMs / state.timeScale) {
      return;
    }

    const deltaMinutes = Math.floor(deltaMs / this.tickIntervalMs) * state.timeScale;
    
    this.advanceTime(deltaMinutes);

    this.setState((s) => {
      s.nextTickAt = now;
    });

    if (this.onTick) {
      this.onTick(deltaMinutes);
    }
  }

  getCurrentPhase(date: Date): TimePhase {
    const hour = date.getHours();
    
    for (const [phase, range] of Object.entries(TIME_PHASES) as Array<[TimePhase, { start: number; end: number }]>) {
      if (range.start <= range.end) {
        if (hour >= range.start && hour < range.end) {
          return phase;
        }
      } else {
        if (hour >= range.start || hour < range.end) {
          return phase;
        }
      }
    }
    
    return 'day';
  }

  advanceTime(minutes: number) {
    this.setState((state) => {
      const previousPhase = state.phase;
      state.gameTime = new Date(state.gameTime.getTime() + minutes * 60 * 1000);
      state.totalPlayTime += minutes;
      
      const newPhase = this.getCurrentPhase(state.gameTime);
      if (newPhase !== previousPhase && this.onPhaseChange) {
        this.onPhaseChange(previousPhase, newPhase);
      }
      state.phase = newPhase;
    });
  }

  setPhaseChangeCallback(callback: (prev: TimePhase, next: TimePhase) => void) {
    this.onPhaseChange = callback;
  }

  setTickInterval(intervalMs: number) {
    this.tickIntervalMs = intervalMs;
    if (this.intervalId !== null) {
      this.stop();
      this.start();
    }
  }

  setTimeScale(scale: number) {
    this.setState((s) => {
      s.timeScale = Math.max(0.1, scale);
    });
  }
}
