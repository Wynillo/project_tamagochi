import type { InventoryItem } from '../data/types/ItemTypes';
import type { GameState } from './useGameStore';

export const selectCreatureNeeds = (state: GameState) => state.creature.needs;

export const selectCurrentRegion = (state: GameState) => state.world.currentRegion;

export const selectTimePhase = (state: GameState) => state.time.phase;

export const selectInventoryItems = (state: GameState) => {
  const items: Record<string, number> = {};
  state.inventory.items.forEach((item: InventoryItem) => {
    items[item.itemId] = item.quantity ?? 0;
  });
  return items;
};

export const selectCanTrain = (state: GameState): boolean => {
  const { energy } = state.creature.needs;
  const { fatigue } = state.creature;
  const energyPercent = (energy / 100) * 100;
  return energyPercent > 10 && fatigue < 90;
};

export const selectCanBattle = (state: GameState): boolean => {
  const { energy } = state.creature.needs;
  const energyPercent = (energy / 100) * 100;
  const isSleeping = energy < 20;
  return energyPercent > 20 && !isSleeping;
};

export const selectCreatureHealthPercentage = (state: GameState): number => {
  const { sta } = state.creature.stats;
  const maxHealth = sta * 10;
  const currentHealth = state.creature.needs.energy;
  return (currentHealth / maxHealth) * 100;
};
