import { CreatureData, EvolutionPath } from '@/data/types/CreatureTypes';

export class EvolutionTree {
  private creatures: Map<string, CreatureData> = new Map();

  constructor(creatures: CreatureData[]) {
    creatures.forEach(c => this.creatures.set(c.id, c));
  }

  getCreatureData(id: string): CreatureData | undefined {
    return this.creatures.get(id);
  }

  getPossibleEvolutions(currentFormId: string): EvolutionPath[] {
    const creature = this.getCreatureData(currentFormId);
    return creature?.evolutionPaths ?? [];
  }

  validateTree(): boolean {
    for (const creature of this.creatures.values()) {
      for (const path of creature.evolutionPaths) {
        if (!this.creatures.has(path.targetCreatureId)) {
          console.warn(`EvolutionTree: Invalid targetCreatureId "${path.targetCreatureId}" for creature "${creature.id}"`);
          return false;
        }
      }
    }
    return true;
  }
}
