import { CreatureState, EvolutionCandidate, EvolutionCondition, EvolutionPath } from '@/data/types/CreatureTypes';
import { TimeState } from '@/data/types/TimeTypes';
import { EvolutionTree } from './EvolutionTree';
import { EVOLUTION_WEIGHTS, LIFE_STAGE_THRESHOLDS } from '@/data/constants/GameConstants';

export class EvolutionEngine {
  constructor(private evolutionTree: EvolutionTree) {}

  checkEvolution(creature: CreatureState, _timeState: TimeState): EvolutionCandidate[] {
    return this.calculateCandidates(creature);
  }

  calculateCandidates(creature: CreatureState): EvolutionCandidate[] {
    const paths = this.evolutionTree.getPossibleEvolutions(creature.speciesId);
    const candidates: EvolutionCandidate[] = [];

    for (const path of paths) {
      let totalWeight = path.weightBonus;
      const matchedConditions: string[] = [];

      for (const condition of path.conditions) {
        if (this.evaluateCondition(condition, creature)) {
          totalWeight += condition.weight;
          matchedConditions.push(condition.type);
        }
      }

      totalWeight += this.calculateCareQualityWeight(creature) * EVOLUTION_WEIGHTS.careQuality;
      totalWeight += this.calculateTrainingFocusWeight(creature) * EVOLUTION_WEIGHTS.statRequirements;
      totalWeight += this.calculateBattleWeight(creature) * EVOLUTION_WEIGHTS.battleRecord;
      totalWeight += this.calculatePersonalityWeight(creature) * EVOLUTION_WEIGHTS.personality;
      totalWeight += this.calculateHiddenWeight(creature, path) * EVOLUTION_WEIGHTS.hidden;

      candidates.push({
        creatureId: path.targetCreatureId,
        totalWeight,
        matchedConditions,
        isHidden: path.conditions.some(c => c.type === 'hidden'),
      });
    }

    return candidates.sort((a, b) => b.totalWeight - a.totalWeight);
  }

  evaluateCondition(condition: EvolutionCondition, creature: CreatureState): boolean {
    switch (condition.type) {
      case 'statThreshold': {
        const stat = creature.stats[condition.key as keyof typeof creature.stats];
        return this.compare(stat, condition.operator, condition.value as number);
      }
      case 'careQuality': {
        const careQuality = this.calculateCareQuality(creature);
        return this.compare(careQuality, condition.operator, condition.value as number);
      }
      case 'personality': {
        return creature.personality.traits.includes(condition.key as any);
      }
      case 'battleRecord': {
        const totalBattles = creature.battlesWon + creature.battlesLost;
        if (totalBattles === 0) return false;
        const winRate = creature.battlesWon / totalBattles;
        return this.compare(winRate, condition.operator, condition.value as number);
      }
      case 'timeOfDay': {
        return true;
      }
      case 'hidden': {
        return creature.history.some(h => h.type === condition.key);
      }
      default:
        return false;
    }
  }

  compare(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      default: return false;
    }
  }

  calculateCareQuality(creature: CreatureState): number {
    const quality = Math.max(0, 100 - creature.careMistakes * 10) / 100;
    return quality;
  }

  calculateCareQualityWeight(creature: CreatureState): number {
    return this.calculateCareQuality(creature);
  }

  calculateTrainingFocusWeight(creature: CreatureState): number {
    const stats = creature.stats;
    const maxStat = Math.max(stats.str, stats.spd, stats.int, stats.sta);
    const total = stats.str + stats.spd + stats.int + stats.sta;
    return total > 0 ? maxStat / total : 0;
  }

  calculateBattleWeight(creature: CreatureState): number {
    const total = creature.battlesWon + creature.battlesLost;
    return total > 0 ? creature.battlesWon / total : 0.5;
  }

  calculatePersonalityWeight(creature: CreatureState): number {
    const strengths = Object.values(creature.personality.traitStrengths);
    return strengths.length > 0 ? strengths.reduce((a, b) => a + b, 0) / strengths.length : 0.5;
  }

  calculateHiddenWeight(creature: CreatureState, path: EvolutionPath): number {
    const hiddenConditions = path.conditions.filter(c => c.type === 'hidden');
    if (hiddenConditions.length === 0) return 0.5;
    const met = hiddenConditions.filter(c => this.evaluateCondition(c, creature)).length;
    return met / hiddenConditions.length;
  }

  shouldEvolve(creature: CreatureState, stageHours: number): boolean {
    const threshold = LIFE_STAGE_THRESHOLDS[creature.stage];
    if (stageHours < threshold) return false;
    const candidates = this.calculateCandidates(creature);
    return candidates.length > 0 && candidates[0].totalWeight > 0.3;
  }
}
