import { describe, it, expect, beforeEach } from 'vitest';
import { NeedsEngine } from '@/systems/needs/NeedsEngine';
import type { CreatureState, Needs } from '@/data/types/CreatureTypes';
import type { ItemData } from '@/data/types/ItemTypes';

describe('NeedsEngine', () => {
  let mockState: CreatureState;
  let needsEngine: NeedsEngine;

  const createMockState = (): CreatureState => ({
    id: 'test-creature-1',
    name: 'TestCreature',
    stage: 'child',
    speciesId: 'SPARKLESPHERE',
    stats: { str: 50, spd: 40, int: 60, sta: 45 },
    needs: { hunger: 80, energy: 70, mood: 90, discipline: 60 },
    personality: {
      traits: ['brave'],
      traitStrengths: { brave: 0.8 },
    },
    evolution: {
      currentFormId: 'SPARKLESPHERE',
      evolutionHistory: [],
      nextEvolutionAt: null,
      evolutionCandidates: [],
    },
    statusEffects: [],
    history: [],
    careMistakes: 0,
    fatigue: 0,
    stageStartTime: Date.now(),
    battlesWon: 0,
    battlesLost: 0,
  });

  beforeEach(() => {
    mockState = createMockState();
    needsEngine = new NeedsEngine(
      () => mockState,
      (updater) => updater(mockState),
    );
  });

  describe('tick', () => {
    it('should apply decay to all needs correctly', () => {
      const initialNeeds = { ...mockState.needs };
      needsEngine.tick(60, false);

      expect(mockState.needs.hunger).toBeLessThan(initialNeeds.hunger);
      expect(mockState.needs.energy).toBeLessThan(initialNeeds.energy);
      expect(mockState.needs.mood).toBeLessThan(initialNeeds.mood);
      expect(mockState.needs.discipline).toBeLessThan(initialNeeds.discipline);
    });

    it('should apply increased energy decay during night', () => {
      needsEngine.tick(60, false);
      const energyDecayDay = mockState.needs.energy;

      mockState = createMockState();
      needsEngine = new NeedsEngine(
        () => mockState,
        (updater) => updater(mockState),
      );
      needsEngine.tick(60, true);

      expect(mockState.needs.energy).toBeLessThan(energyDecayDay);
    });

    it('should clamp needs between 0 and MAX_NEED_VALUE', () => {
      mockState.needs = { hunger: 5, energy: 5, mood: 5, discipline: 5 };
      needsEngine.tick(600, false);

      expect(mockState.needs.hunger).toBeGreaterThanOrEqual(0);
      expect(mockState.needs.hunger).toBeLessThanOrEqual(100);
      expect(mockState.needs.energy).toBeGreaterThanOrEqual(0);
      expect(mockState.needs.energy).toBeLessThanOrEqual(100);
      expect(mockState.needs.mood).toBeGreaterThanOrEqual(0);
      expect(mockState.needs.mood).toBeLessThanOrEqual(100);
      expect(mockState.needs.discipline).toBeGreaterThanOrEqual(0);
      expect(mockState.needs.discipline).toBeLessThanOrEqual(100);
    });

    it('should increase fatigue when energy is below 30', () => {
      mockState.needs.energy = 25;
      const initialFatigue = mockState.fatigue;
      needsEngine.tick(60, false);

      expect(mockState.fatigue).toBeGreaterThan(initialFatigue);
    });

    it('should decrease fatigue when energy is above 70', () => {
      mockState.needs.energy = 80;
      mockState.fatigue = 50;
      const initialFatigue = mockState.fatigue;
      needsEngine.tick(60, false);

      expect(mockState.fatigue).toBeLessThan(initialFatigue);
    });
  });

  describe('checkCareMistakes', () => {
    it('should record mistake when hunger drops to 0', () => {
      const previousNeeds: Needs = { hunger: 10, energy: 50, mood: 50, discipline: 50 };
      const currentNeeds: Needs = { hunger: 0, energy: 50, mood: 50, discipline: 50 };

      const mistakes = needsEngine.checkCareMistakes(previousNeeds, currentNeeds, 60);

      expect(mistakes).toContain('Creature became hungry');
    });

    it('should record mistake when energy drops to 0', () => {
      const previousNeeds: Needs = { hunger: 50, energy: 10, mood: 50, discipline: 50 };
      const currentNeeds: Needs = { hunger: 50, energy: 0, mood: 50, discipline: 50 };

      const mistakes = needsEngine.checkCareMistakes(previousNeeds, currentNeeds, 60);

      expect(mistakes).toContain('Creature became exhausted');
    });

    it('should record mistake when mood drops to 0 after 30+ minutes', () => {
      const previousNeeds: Needs = { hunger: 50, energy: 50, mood: 10, discipline: 50 };
      const currentNeeds: Needs = { hunger: 50, energy: 50, mood: 0, discipline: 50 };

      const mistakes = needsEngine.checkCareMistakes(previousNeeds, currentNeeds, 60);

      expect(mistakes).toContain('Creature became depressed');
    });

    it('should not record mood mistake if delta is less than 30 minutes', () => {
      const previousNeeds: Needs = { hunger: 50, energy: 50, mood: 10, discipline: 50 };
      const currentNeeds: Needs = { hunger: 50, energy: 50, mood: 0, discipline: 50 };

      const mistakes = needsEngine.checkCareMistakes(previousNeeds, currentNeeds, 20);

      expect(mistakes).not.toContain('Creature became depressed');
    });

    it('should return empty array when no thresholds crossed', () => {
      const previousNeeds: Needs = { hunger: 50, energy: 50, mood: 50, discipline: 50 };
      const currentNeeds: Needs = { hunger: 45, energy: 45, mood: 45, discipline: 45 };

      const mistakes = needsEngine.checkCareMistakes(previousNeeds, currentNeeds, 60);

      expect(mistakes).toEqual([]);
    });
  });

  describe('feed', () => {
    it('should increase hunger with valid food item', () => {
      const foodItem: ItemData = {
        id: 'apple',
        name: 'Apple',
        description: 'A tasty apple',
        type: 'food',
        rarity: 'common',
        value: 10,
        stackable: true,
        maxStack: 99,
        consumable: true,
        effects: [
          { type: 'heal', target: 'self', needType: 'hunger', value: 25 },
        ],
        sprite: 'apple.png',
      };

      const initialHunger = mockState.needs.hunger;
      const result = needsEngine.feed(foodItem);

      expect(result.success).toBe(true);
      expect(mockState.needs.hunger).toBeGreaterThan(initialHunger);
      expect(result.hungerRestored).toBe(25);
    });

    it('should reject non-food items', () => {
      const nonFoodItem: ItemData = {
        id: 'potion',
        name: 'Potion',
        description: 'A healing potion',
        type: 'consumable',
        rarity: 'common',
        value: 20,
        stackable: true,
        maxStack: 50,
        consumable: true,
        effects: [],
        sprite: 'potion.png',
      };

      const result = needsEngine.feed(nonFoodItem);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Item is not food');
    });

    it('should apply mood boost if food has mood effect', () => {
      const foodItem: ItemData = {
        id: 'cake',
        name: 'Cake',
        description: 'A delicious cake',
        type: 'food',
        rarity: 'uncommon',
        value: 50,
        stackable: true,
        maxStack: 10,
        consumable: true,
        effects: [
          { type: 'heal', target: 'self', needType: 'hunger', value: 20 },
          { type: 'boost', target: 'self', needType: 'mood', value: 15 },
        ],
        sprite: 'cake.png',
      };

      const initialMood = mockState.needs.mood;
      needsEngine.feed(foodItem);

      expect(mockState.needs.mood).toBeGreaterThan(initialMood);
    });

    it('should clamp hunger to MAX_NEED_VALUE', () => {
      const foodItem: ItemData = {
        id: 'feast',
        name: 'Feast',
        description: 'A grand feast',
        type: 'food',
        rarity: 'epic',
        value: 100,
        stackable: false,
        maxStack: 1,
        consumable: true,
        effects: [
          { type: 'heal', target: 'self', needType: 'hunger', value: 50 },
        ],
        sprite: 'feast.png',
      };

      mockState.needs.hunger = 80;
      needsEngine.feed(foodItem);

      expect(mockState.needs.hunger).toBeLessThanOrEqual(100);
    });
  });

  describe('sleep', () => {
    it('should restore energy based on hours slept', () => {
      mockState.needs.energy = 30;
      const initialEnergy = mockState.needs.energy;
      const result = needsEngine.sleep(6);

      expect(result.success).toBe(true);
      expect(mockState.needs.energy).toBeGreaterThan(initialEnergy);
      expect(result.energyRestored).toBe(60);
    });

    it('should return quality based on hours slept', () => {
      const goodSleep = needsEngine.sleep(8);
      expect(goodSleep.quality).toBe('good');

      const fairSleep = needsEngine.sleep(5);
      expect(fairSleep.quality).toBe('fair');

      const poorSleep = needsEngine.sleep(3);
      expect(poorSleep.quality).toBe('poor');
    });

    it('should reduce fatigue when sleeping', () => {
      mockState.fatigue = 50;
      needsEngine.sleep(6);

      expect(mockState.fatigue).toBeLessThan(50);
    });

    it('should clamp energy to MAX_NEED_VALUE', () => {
      mockState.needs.energy = 90;
      needsEngine.sleep(8);

      expect(mockState.needs.energy).toBeLessThanOrEqual(100);
    });
  });

  describe('play', () => {
    it('should increase mood when playing', () => {
      const initialMood = mockState.needs.mood;
      const result = needsEngine.play();

      expect(result.success).toBe(true);
      expect(mockState.needs.mood).toBeGreaterThan(initialMood);
      expect(result.moodGain).toBe(10);
    });

    it('should cost energy when playing', () => {
      const initialEnergy = mockState.needs.energy;
      needsEngine.play();

      expect(mockState.needs.energy).toBeLessThan(initialEnergy);
    });

    it('should fail if not enough energy', () => {
      mockState.needs.energy = 1;
      const result = needsEngine.play();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Not enough energy');
    });
  });

  describe('scold', () => {
    it('should increase discipline when scolding', () => {
      const initialDiscipline = mockState.needs.discipline;
      const result = needsEngine.scold();

      expect(result.success).toBe(true);
      expect(mockState.needs.discipline).toBeGreaterThan(initialDiscipline);
      expect(result.disciplineGain).toBe(5);
    });

    it('should decrease mood when scolding', () => {
      const initialMood = mockState.needs.mood;
      needsEngine.scold();

      expect(mockState.needs.mood).toBeLessThan(initialMood);
    });

    it('should clamp discipline to MAX_NEED_VALUE', () => {
      mockState.needs.discipline = 98;
      needsEngine.scold();

      expect(mockState.needs.discipline).toBeLessThanOrEqual(100);
    });
  });
});
