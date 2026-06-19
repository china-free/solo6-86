import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShoppingItem, IngredientCategory } from '@/types';
import { calculateShoppingList } from '@/utils/ingredient';
import { useMealStore } from './useMealStore';

interface ShoppingState {
  items: ShoppingItem[];
  activeCategory: IngredientCategory | 'all';
  setActiveCategory: (category: IngredientCategory | 'all') => void;
  toggleItem: (ingredientId: string) => void;
  updateAmount: (ingredientId: string, amount: number) => void;
  resetChecked: () => void;
  resetAdjustments: () => void;
  clearAll: () => void;
  regenerate: () => void;
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],
      activeCategory: 'all',

      setActiveCategory: (category) => {
        set({ activeCategory: category });
      },

      toggleItem: (ingredientId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, checked: !item.checked }
              : item
          ),
        }));
      },

      updateAmount: (ingredientId, amount) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, totalAmount: amount, adjusted: true }
              : item
          ),
        }));
      },

      resetChecked: () => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, checked: false })),
        }));
      },

      clearAll: () => {
        set({ items: [] });
      },

      regenerate: () => {
        const { days } = useMealStore.getState();
        const newItems = calculateShoppingList(days);
        const checkedMap = new Map<string, boolean>();

        get().items.forEach((item) => {
          checkedMap.set(item.ingredientId, item.checked);
        });

        const mergedItems = newItems.map((item) => {
          const checked = checkedMap.get(item.ingredientId) ?? false;
          return { ...item, checked };
        });

        set({ items: mergedItems });
      },

      resetAdjustments: () => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, adjusted: false })),
        }));
      },
    }),
    {
      name: 'shopping-list-storage',
      partialize: (state) => ({
        items: state.items,
        activeCategory: state.activeCategory,
      }),
    }
  )
);
