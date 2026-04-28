import type { CreatureState, Needs, StatusEffect, LifeEvent } from '../../data/types/CreatureTypes';
import type { Stats, LifeStage, PersonalityId } from '../../data/types/CommonTypes';

type StoreSet = (updater: (state: CreatureState) => void) => void;

export const createCreatureActions = (set: StoreSet, _get: () => CreatureState) => ({
  setCreatureName: (name: string) =>
    set((state) => ({
      ...state,
      name,
    })),

  updateNeeds: (delta: Partial<Needs>) =>
    set((state) => ({
      ...state,
      needs: {
        ...state.needs,
        ...delta,
      },
    })),

  setNeed: (needType: keyof Needs, value: number) =>
    set((state) => ({
      ...state,
      needs: {
        ...state.needs,
        [needType]: Math.max(0, Math.min(100, value)),
      },
    })),

  addStatGain: (stat: keyof Stats, amount: number) =>
    set((state) => ({
      ...state,
      stats: {
        ...state.stats,
        [stat]: state.stats[stat] + amount,
      },
    })),

  addPersonalityTrait: (trait: PersonalityId) =>
    set((state) => ({
      ...state,
      personality: {
        ...state.personality,
        traits: state.personality.traits.includes(trait)
          ? state.personality.traits
          : [...state.personality.traits, trait],
        traitStrengths: {
          ...state.personality.traitStrengths,
          [trait]: (state.personality.traitStrengths[trait] || 0) + 1,
        },
      },
    })),

  recordCareMistake: () =>
    set((state) => ({
      ...state,
      careMistakes: state.careMistakes + 1,
    })),

  setStage: (stage: LifeStage) =>
    set((state) => ({
      ...state,
      stage,
      stageStartTime: Date.now(),
    })),

  setSpecies: (speciesId: string) =>
    set((state) => ({
      ...state,
      speciesId,
    })),

  addLifeEvent: (event: Omit<LifeEvent, 'timestamp'>) =>
    set((state) => ({
      ...state,
      history: [
        ...state.history,
        { ...event, timestamp: Date.now() },
      ],
    })),

  addStatusEffect: (effect: StatusEffect) =>
    set((state) => ({
      ...state,
      statusEffects: [...state.statusEffects, effect],
    })),

  removeStatusEffect: (effectId: string) =>
    set((state) => ({
      ...state,
      statusEffects: state.statusEffects.filter((e) => e.id !== effectId),
    })),

  clearExpiredStatusEffects: () =>
    set((state) => ({
      ...state,
      statusEffects: state.statusEffects.filter((e: StatusEffect) => e.remainingMinutes > 0),
    })),

  updateFatigue: (delta: number) =>
    set((state) => ({
      ...state,
      fatigue: Math.max(0, Math.min(100, state.fatigue + delta)),
    })),
});

export type CreatureActions = ReturnType<typeof createCreatureActions>;
