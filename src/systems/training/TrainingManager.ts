import { StatType, GameRank } from '@/data/types/CommonTypes';
import { CreatureState } from '@/data/types/CreatureTypes';
import { STAT_TRAINING_GAINS, FATIGUE_THRESHOLDS } from '@/data/constants/GameConstants';

export interface TrainingResult {
  stat: StatType;
  rank: GameRank;
  statGain: number;
  fatigueIncrease: number;
  moodChange: number;
  timeSkipped: number;
}

export interface MiniGameConfig {
  stat: StatType;
  difficulty: number;
  baseDuration: number;
  fatigueCost: number;
  timeSkipMinutes: number;
  sceneKey: string;
}

export class TrainingManager {
  canTrain(_stat: StatType, creature: CreatureState): boolean {
    return creature.needs.energy > 10 && creature.fatigue < FATIGUE_THRESHOLDS.collapsed;
  }

  getMiniGameConfig(stat: StatType, creature: CreatureState): MiniGameConfig {
    const statValue = creature.stats[stat];
    const difficulty = Math.min(10, Math.ceil(statValue / 10));
    return {
      stat,
      difficulty,
      baseDuration: 30,
      fatigueCost: 15,
      timeSkipMinutes: 30,
      sceneKey: `Training${stat.charAt(0).toUpperCase() + stat.slice(1)}Scene`,
    };
  }

  calculateRank(performanceScore: number): GameRank {
    if (performanceScore >= 95) return 'S';
    if (performanceScore >= 85) return 'A';
    if (performanceScore >= 70) return 'B';
    if (performanceScore >= 50) return 'C';
    return 'D';
  }

  completeTraining(stat: StatType, performanceScore: number, _creature: CreatureState): TrainingResult {
    const rank = this.calculateRank(performanceScore);
    const statGain = STAT_TRAINING_GAINS[rank];
    const fatigueIncrease = 15 + (rank === 'S' ? 5 : 0);
    const moodChange = rank === 'S' || rank === 'A' ? 5 : -3;
    const timeSkipped = 30;

    return {
      stat,
      rank,
      statGain,
      fatigueIncrease,
      moodChange,
      timeSkipped,
    };
  }
}
