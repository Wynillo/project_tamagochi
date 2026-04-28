import type { CombatCreature, AttackData } from '@/data/types/CombatTypes';

export interface AttackResult {
  damage: number;
  isHit: boolean;
  isCrit: boolean;
  effectsApplied: string[];
  recoilDamage: number;
}

export class AttackResolver {
  resolveAttack(attacker: CombatCreature, defender: CombatCreature, attack: AttackData): AttackResult {
    const hitRoll = Math.random() * 100;
    const isHit = hitRoll <= attack.accuracy;
    if (!isHit) {
      return { damage: 0, isHit: false, isCrit: false, effectsApplied: [], recoilDamage: 0 };
    }

    const scalingStat = attacker.stats[attack.statScaling];
    let baseDamage = attack.power * (scalingStat / 20);

    const effectiveness = this.getEffectiveness(attack.element, defender);
    baseDamage *= effectiveness;

    const variance = 0.9 + Math.random() * 0.2;
    baseDamage *= variance;

    const isCrit = Math.random() < 0.05;
    if (isCrit) baseDamage *= 1.5;

    const defense = defender.stats.sta / 50;
    const damage = Math.max(1, Math.floor(baseDamage / defense));

    let recoilDamage = 0;
    if (attack.specialEffect?.type === 'recoil') {
      recoilDamage = Math.floor(damage * (attack.specialEffect.value / 100));
    }

    const effectsApplied: string[] = [];
    if (attack.specialEffect && Math.random() * 100 < attack.specialEffect.chance) {
      effectsApplied.push(attack.specialEffect.type);
    }

    return { damage, isHit: true, isCrit, effectsApplied, recoilDamage };
  }

  getEffectiveness(_attackElement: string, _defender: CombatCreature): number {
    return 1.0;
  }
}
