import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttackResolver } from '@/systems/combat/AttackResolver';
import type { CombatCreature, AttackData } from '@/data/types/CombatTypes';

describe('AttackResolver', () => {
  let attackResolver: AttackResolver;

  const mockAttacker: CombatCreature = {
    creatureId: 'attacker-1',
    name: 'Attacker',
    currentHp: 100,
    maxHp: 100,
    stats: { str: 50, spd: 40, int: 30, sta: 45 },
    attacks: [{ id: 'attack-1', currentCooldown: 0 }],
    availableAttacks: [],
    personality: { traits: [], traitStrengths: {} },
    discipline: 50,
    statusEffects: [],
    isPlayer: true,
  };

  const mockDefender: CombatCreature = {
    creatureId: 'defender-1',
    name: 'Defender',
    currentHp: 100,
    maxHp: 100,
    stats: { str: 30, spd: 35, int: 40, sta: 50 },
    attacks: [],
    availableAttacks: [],
    personality: { traits: [], traitStrengths: {} },
    discipline: 50,
    statusEffects: [],
    isPlayer: false,
  };

  const mockAttack: AttackData = {
    id: 'attack-1',
    name: 'Tackle',
    element: 'normal',
    power: 50,
    accuracy: 90,
    riskLevel: 'low',
    statScaling: 'str',
    scalingFactor: 1.0,
    animation: 'tackle',
    sound: 'hit',
  };

  beforeEach(() => {
    attackResolver = new AttackResolver();
    vi.clearAllMocks();
  });

  describe('resolveAttack', () => {
    it('should calculate damage correctly with known random values', () => {
      const randomSequence = [0.5, 0.5, 0.01];
      const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => randomSequence.shift()!);

      const result = attackResolver.resolveAttack(mockAttacker, mockDefender, mockAttack);

      expect(result.isHit).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      randomSpy.mockRestore();
    });

    it('should return miss when accuracy check fails', () => {
      const randomSequence = [0.95, 0.5, 0.5];
      vi.spyOn(Math, 'random').mockImplementation(() => randomSequence.shift()!);

      const result = attackResolver.resolveAttack(mockAttacker, mockDefender, mockAttack);

      expect(result.isHit).toBe(false);
      expect(result.damage).toBe(0);
      vi.restoreAllMocks();
    });

    it('should apply critical hit multiplier when crit occurs', () => {
      const randomSequence = [0.5, 0.5, 0.01, 0.02];
      vi.spyOn(Math, 'random').mockImplementation(() => randomSequence.shift()!);

      const result = attackResolver.resolveAttack(mockAttacker, mockDefender, mockAttack);

      expect(result.isCrit).toBe(true);
      vi.restoreAllMocks();
    });

    it('should not apply critical hit when roll is above threshold', () => {
      const randomSequence = [0.5, 0.5, 0.1];
      vi.spyOn(Math, 'random').mockImplementation(() => randomSequence.shift()!);

      const result = attackResolver.resolveAttack(mockAttacker, mockDefender, mockAttack);

      expect(result.isCrit).toBe(false);
      vi.restoreAllMocks();
    });

    it('should apply recoil damage when attack has recoil effect', () => {
      const attackWithRecoil: AttackData = {
        ...mockAttack,
        specialEffect: {
          type: 'recoil',
          chance: 100,
          duration: 0,
          value: 10,
        },
      };

      const randomSequence = [0.5, 0.5, 0.01, 0.5];
      vi.spyOn(Math, 'random').mockImplementation(() => randomSequence.shift()!);

      const result = attackResolver.resolveAttack(mockAttacker, mockDefender, attackWithRecoil);

      expect(result.recoilDamage).toBeGreaterThan(0);
      expect(result.recoilDamage).toBeLessThanOrEqual(result.damage);
      vi.restoreAllMocks();
    });

    it('should apply status effects when effect chance succeeds', () => {
      const attackWithEffect: AttackData = {
        ...mockAttack,
        specialEffect: {
          type: 'burn',
          chance: 100,
          duration: 3,
          value: 10,
        },
      };

      const randomSequence = [0.5, 0.5, 0.01, 0.5];
      vi.spyOn(Math, 'random').mockImplementation(() => randomSequence.shift()!);

      const result = attackResolver.resolveAttack(mockAttacker, mockDefender, attackWithEffect);

      expect(result.effectsApplied).toContain('burn');
      vi.restoreAllMocks();
    });

    it('should return zero damage and no effects on miss', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);

      const result = attackResolver.resolveAttack(mockAttacker, mockDefender, mockAttack);

      expect(result.isHit).toBe(false);
      expect(result.damage).toBe(0);
      expect(result.isCrit).toBe(false);
      expect(result.effectsApplied).toEqual([]);
      expect(result.recoilDamage).toBe(0);
      vi.restoreAllMocks();
    });

    it('should scale damage based on attacker stat', () => {
      const highStatAttacker: CombatCreature = {
        ...mockAttacker,
        stats: { ...mockAttacker.stats, str: 100 },
      };

      const randomSequence = [0.5, 0.5, 0.5];
      vi.spyOn(Math, 'random').mockImplementation(() => randomSequence.shift()!);

      const resultWithHighStat = attackResolver.resolveAttack(highStatAttacker, mockDefender, mockAttack);

      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const resultWithLowStat = attackResolver.resolveAttack(mockAttacker, mockDefender, mockAttack);

      expect(resultWithHighStat.damage).toBeGreaterThan(resultWithLowStat.damage);
      vi.restoreAllMocks();
    });

    it('should factor defense stat into damage calculation', () => {
      const highDefenseDefender: CombatCreature = {
        ...mockDefender,
        stats: { ...mockDefender.stats, sta: 100 },
      };

      const randomSequence = [0.5, 0.5, 0.5];
      vi.spyOn(Math, 'random').mockImplementation(() => randomSequence.shift()!);

      const resultVsHighDefense = attackResolver.resolveAttack(mockAttacker, highDefenseDefender, mockAttack);

      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const resultVsLowDefense = attackResolver.resolveAttack(mockAttacker, mockDefender, mockAttack);

      expect(resultVsLowDefense.damage).toBeGreaterThan(resultVsHighDefense.damage);
      vi.restoreAllMocks();
    });
  });

  describe('getEffectiveness', () => {
    it('should return 1.0 for neutral effectiveness (MVP)', () => {
      const effectiveness = attackResolver.getEffectiveness('normal', mockDefender);
      expect(effectiveness).toBe(1.0);
    });
  });
});
