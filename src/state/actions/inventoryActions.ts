import type { InventoryState, InventoryItem, EquipmentSlots } from '../../data/types/ItemTypes';

type StoreSet = (updater: (state: InventoryState) => void) => void;

export const createInventoryActions = (set: StoreSet, _get: () => InventoryState) => ({
  addItem: (item: InventoryItem) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.itemId === item.itemId);
      let newItems: InventoryItem[];
      if (existingItem && existingItem.quantity !== undefined) {
        newItems = state.items.map((i) =>
          i.itemId === item.itemId
            ? { ...i, quantity: (i.quantity ?? 0) + item.quantity }
            : i
        );
      } else {
        newItems = [...state.items, item];
      }
      return {
        ...state,
        items: newItems,
      };
    }),

  removeItem: (itemId: string, quantity: number = 1) =>
    set((state) => {
      const itemIndex = state.items.findIndex((i) => i.itemId === itemId);
      if (itemIndex === -1) return state;

      const item = state.items[itemIndex];
      let newItems: InventoryItem[];
      if ((item.quantity ?? 0) <= quantity) {
        newItems = state.items.filter((_, i) => i !== itemIndex);
      } else {
        newItems = state.items.map((i, iIdx) =>
          iIdx === itemIndex ? { ...i, quantity: (i.quantity ?? 0) - quantity } : i
        );
      }
      return {
        ...state,
        items: newItems,
      };
    }),

  equipItem: (itemId: string, slot: keyof EquipmentSlots) =>
    set((state) => {
      const item = state.items.find((i) => i.itemId === itemId);
      const newItems = item
        ? state.items.map((i) =>
            i.itemId === itemId ? { ...i, equipped: true } : i
          )
        : state.items;
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [slot]: {
            itemId,
            durability: 100,
            maxDurability: 100,
          },
        },
        items: newItems,
      };
    }),

  unequipItem: (slot: keyof EquipmentSlots) =>
    set((state) => {
      const equipped = state.equipment[slot];
      if (!equipped) return state;
      const item = state.items.find((i) => i.itemId === equipped.itemId);
      const newItems = item
        ? state.items.map((i) =>
            i.itemId === equipped.itemId ? { ...i, equipped: false } : i
          )
        : state.items;
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [slot]: undefined,
        },
        items: newItems,
      };
    }),

  setMaxCapacity: (capacity: number) =>
    set((state) => ({
      ...state,
      capacity,
    })),
});

export type InventoryActions = ReturnType<typeof createInventoryActions>;
