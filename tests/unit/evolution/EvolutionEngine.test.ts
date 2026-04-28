import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvolutionEngine } from '@/systems/evolution/EvolutionEngine';
import { EvolutionTree } from '@/systems/evolution/EvolutionTree';
import type { CreatureState, EvolutionPath } from '@/data/types/CreatureTypes';

describe('EvolutionEngine', () => {
  let evolutionTree: EvolutionTree;
  let evolutionEngine: EvolutionEngine;

  const mockCreature: CreatureState = {
    id: 'test-creature-1',
    name: 'TestCreature',
    stage: 'child',
    speciesId: 'SPARKLESPHERE',
    stats: { str: 50, spd: 40, int: 60, sta: 45 },
    needs: { hunger: 80, energy: 70, mood: 90, discipline: 60 },
    personality: {
      traits: ['brave'],
      traitStrengths: { brave: 0.8, calm: 0.5 },
    },
    evolution: {
      currentFormId: 'SPARKLESPHERE',
      evolutionHistory: [],
      nextEvolutionAt: null,
      evolutionCandidates: [],
    },
    statusEffects: [],
    history: [],
    careMistakes: 2,
    fatigue: 10,
    stageStartTime: Date.now(),
    battlesWon: 5,
    battlesLost: 2,
  };

  const mockEvolutionPaths: EvolutionPath[] = [
    {
      targetCreatureId: 'VOLCANOSPHERE',
      conditions: [
        { type: 'statThreshold', key: 'str', operator: '>=', value: 40, weight: 0.3 },
        { type: 'personality', key: 'brave', operator: '==', value: 1, weight: 0.2 },
      ],
      weightBonus: 0.1,
    },
    {
      targetCreatureId: 'AQUASPHERE',
      conditions: [
        { type: 'statThreshold', key: 'int', operator: '>=', value: 50, weight: 0.3 },
        { type: 'careQuality', key: 'quality', operator: '>=', value: 0.7, weight: 0.2 },
      ],
      weightBonus: 0.15,
    },
    {
      targetCreatureId: 'STORMSPHERE',
      conditions: [
        { type: 'statThreshold', key: 'spd', operator: '>=', value: 50, weight: 0.25 },
        { type: 'battleRecord', key: 'winRate', operator: '>=', value: 0.6, weight: 0.2 },
      ],
      weightBonus: 0.05,
    },
  ];

  beforeEach(() => {
    evolutionTree = new EvolutionTree([]);
    vi.spyOn(evolutionTree, 'getPossibleEvolutions').mockReturnValue(mockEvolutionPaths);
    evolutionEngine = new EvolutionEngine(evolutionTree);
  });

  describe('calculateCandidates', () => {
    it('should return evolution candidates sorted by weight', () => {
      const candidates = evolutionEngine.calculateCandidates(mockCreature);

      expect(candidates.length).toBe(3);
      expect(candidates[0].totalWeight).toBeGreaterThanOrEqual(candidates[1].totalWeight);
      expect(candidates[1].totalWeight).toBeGreaterThanOrEqual(candidates[2].totalWeight);
    });

    it('should calculate weight based on matched conditions', () => {
      const candidates = evolutionEngine.calculateCandidates(mockCreature);

      const volcanoCandidate = candidates.find(c => c.creatureId === 'VOLCANOSPHERE');
      expect(volcanoCandidate).toBeDefined();
      expect(volcanoCandidate!.matchedConditions).toContain('statThreshold');
      expect(volcanoCandidate!.matchedConditions).toContain('personality');
    });

    it('should factor care quality into weight calculation', () => {
      const highQualityCreature = { ...mockCreature, careMistakes: 0 };
      const lowQualityCreature = { ...mockCreature, careMistakes: 9 };

      const highQualityCandidates = evolutionEngine.calculateCandidates(highQualityCreature);
      const lowQualityCandidates = evolutionEngine.calculateCandidates(lowQualityCreature);

      expect(highQualityCandidates[0].totalWeight).toBeGreaterThan(lowQualityCandidates[0].totalWeight);
    });

    it('should factor battle record into weight calculation', () => {
      const winningCreature: CreatureState = { ...mockCreature, battlesWon: 10, battlesLost: 0 };
      const losingCreature: CreatureState = { ...mockCreature, battlesWon: 0, battlesLost: 10 };

      const winningCandidates = evolutionEngine.calculateCandidates(winningCreature);
      const losingCandidates = evolutionEngine.calculateCandidates(losingCreature);

      expect(winningCandidates[0].totalWeight).toBeGreaterThan(losingCandidates[0].totalWeight);
    });

    it('should include isHidden flag for candidates with hidden conditions', () => {
      const hiddenPath: EvolutionPath = {
        targetCreatureId: 'SHADOWSPHERE',
        conditions: [
          { type: 'hidden', key: 'careMistake', operator: '==', value: 1, weight: 0.3 },
        ],
        weightBonus: 0.2,
      };

      vi.spyOn(evolutionTree, 'getPossibleEvolutions').mockReturnValue([hiddenPath]);

      const candidates = evolutionEngine.calculateCandidates(mockCreature);
      expect(candidates[0].isHidden).toBe(true);
    });

    it('should return empty array when no evolution paths available', () => {
      vi.spyOn(evolutionTree, 'getPossibleEvolutions').mockReturnValue([]);

      const candidates = evolutionEngine.calculateCandidates(mockCreature);
      expect(candidates).toEqual([]);
    });
  });

  describe('evaluateCondition', () => {
    it('should evaluate statThreshold conditions correctly', () => {
      const condition = { type: 'statThreshold' as const, key: 'str', operator: '>=', value: 40, weight: 0.3 };
      expect(evolutionEngine.evaluateCondition(condition, mockCreature)).toBe(true);

      const highThreshold = { type: 'statThreshold' as const, key: 'str', operator: '>=', value: 60, weight: 0.3 };
      expect(evolutionEngine.evaluateCondition(highThreshold, mockCreature)).toBe(false);
    });

    it('should evaluate careQuality conditions correctly', () => {
      const condition = { type: 'careQuality' as const, key: 'quality', operator: '>=', value: 0.7, weight: 0.2 };
      expect(evolutionEngine.evaluateCondition(condition, mockCreature)).toBe(true);

      const highThreshold = { type: 'careQuality' as const, key: 'quality', operator: '>=', value: 0.9, weight: 0.2 };
      expect(evolutionEngine.evaluateCondition(highThreshold, mockCreature)).toBe(false);
    });

    it('should evaluate personality conditions correctly', () => {
      const condition = { type: 'personality' as const, key: 'brave', operator: '==', value: 1, weight: 0.2 };
      expect(evolutionEngine.evaluateCondition(condition, mockCreature)).toBe(true);

      const missingTrait = { type: 'personality' as const, key: 'clever', operator: '==', value: 1, weight: 0.2 };
      expect(evolutionEngine.evaluateCondition(missingTrait, mockCreature)).toBe(false);
    });

    it('should evaluate battleRecord conditions correctly', () => {
      const condition = { type: 'battleRecord' as const, key: 'winRate', operator: '>=', value: 0.6, weight: 0.2 };
      expect(evolutionEngine.evaluateCondition(condition, mockCreature)).toBe(true);

      const highThreshold = { type: 'battleRecord' as const, key: 'winRate', operator: '>=', value: 0.8, weight: 0.2 };
      expect(evolutionEngine.evaluateCondition(highThreshold, mockCreature)).toBe(false);
    });
  });
});
