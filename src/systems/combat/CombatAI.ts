import type { CombatCreature, Tactic, AttackData } from '@/data/types/CombatTypes';

export class CombatAI {
  decideTactic(selectedTactic: Tactic, creature: CombatCreature): Tactic {
    const roll = Math.random() * 100;
    if (roll > creature.discipline) {
      const primaryTrait = creature.personality.traits[0];
      switch (primaryTrait) {
        case 'reckless': return 'goAllOut';
        case 'cautious': return 'playItSafe';
        case 'greedy': return 'goAllOut';
        case 'loyal': return selectedTactic;
        case 'lazy': return 'playItSafe';
        case 'hyperactive': return 'goAllOut';
        default: return selectedTactic;
      }
    }
    return selectedTactic;
  }

  selectAttack(tactic: Tactic, creature: CombatCreature): AttackData {
    let preferredRisk: string[];
    switch (tactic) {
      case 'goAllOut': preferredRisk = ['high', 'medium']; break;
      case 'playItSafe': preferredRisk = ['low', 'medium']; break;
      case 'useYourHead': preferredRisk = ['medium', 'special']; break;
      default: preferredRisk = ['low', 'medium', 'high'];
    }
    const valid = creature.availableAttacks.filter(a => preferredRisk.includes(a.riskLevel));
    if (valid.length === 0) return creature.availableAttacks[0];
    const totalWeight = valid.reduce((sum, a) => sum + a.power, 0);
    let random = Math.random() * totalWeight;
    for (const attack of valid) {
      random -= attack.power;
      if (random <= 0) return attack;
    }
    return valid[0];
  }

  selectEnemyAttack(enemy: CombatCreature): AttackData {
    return this.selectAttack('goAllOut', enemy);
  }
}
