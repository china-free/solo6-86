import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShoppingItem, IngredientCategory } from '@/types';
import type { SyncEvent, ShoppingItemToggledPayload, ShoppingItemAmountUpdatedPayload, ShoppingRegeneratedPayload, ShoppingCategoryChangedPayload } from '@/types/sync';
import { calculateShoppingList } from '@/utils/ingredient';
import { useMealStore } from './useMealStore';
import { useCollabStore } from './useCollabStore';

interface ShoppingState {
  items: ShoppingItem[];
  activeCategory: IngredientCategory | 'all';
  isRemoteUpdate: boolean;
  setActiveCategory: (category: IngredientCategory | 'all', broadcast?: boolean) => void;
  toggleItem: (ingredientId: string, broadcast?: boolean) => void;
  updateAmount: (ingredientId: string, amount: number, broadcast?: boolean) => void;
  resetChecked: (broadcast?: boolean) => void;
  resetAdjustments: (broadcast?: boolean) => void;
  clearAll: (broadcast?: boolean) => void;
  regenerate: (broadcast?: boolean) => void;
  syncFromRemote: (items: ShoppingItem[], activeCategory: IngredientCategory | 'all') => void;
  initSyncListeners: () => void;
}

const shouldBroadcast = (): boolean => {
  return useCollabStore.getState().isCollaborating;
};

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],
      activeCategory: 'all',
      isRemoteUpdate: false,

      setActiveCategory: (category, broadcast = true) => {
        set({ activeCategory: category });

        if (broadcast && shouldBroadcast()) {
          const payload: ShoppingCategoryChangedPayload = { category };
          useCollabStore.getState().broadcastEvent('SHOPPING_CATEGORY_CHANGED', payload);
        }
      },

      toggleItem: (ingredientId, broadcast = true) => {
        let newChecked = false;
        set((state) => ({
          items: state.items.map((item) => {
            if (item.ingredientId === ingredientId) {
              newChecked = !item.checked;
              return { ...item, checked: newChecked };
            }
            return item;
          }),
        }));

        if (broadcast && shouldBroadcast()) {
          const payload: ShoppingItemToggledPayload = { ingredientId, checked: newChecked };
          useCollabStore.getState().broadcastEvent('SHOPPING_ITEM_TOGGLED', payload);
        }
      },

      updateAmount: (ingredientId, amount, broadcast = true) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, totalAmount: amount, adjusted: true }
              : item
          ),
        }));

        if (broadcast && shouldBroadcast()) {
          const payload: ShoppingItemAmountUpdatedPayload = { ingredientId, amount };
          useCollabStore.getState().broadcastEvent('SHOPPING_ITEM_AMOUNT_UPDATED', payload);
        }
      },

      resetChecked: (broadcast = true) => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, checked: false })),
        }));

        if (broadcast && shouldBroadcast()) {
          useCollabStore.getState().broadcastEvent('SHOPPING_CHECKED_RESET', {});
        }
      },

      clearAll: (broadcast = true) => {
        set({ items: [] });

        if (broadcast && shouldBroadcast()) {
          useCollabStore.getState().broadcastEvent('SHOPPING_CLEARED', {});
        }
      },

      regenerate: (broadcast = true) => {
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

        if (broadcast && shouldBroadcast()) {
          const payload: ShoppingRegeneratedPayload = { items: mergedItems };
          useCollabStore.getState().broadcastEvent('SHOPPING_REGENERATED', payload);
        }
      },

      resetAdjustments: (broadcast = true) => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, adjusted: false })),
        }));

        if (broadcast && shouldBroadcast()) {
          useCollabStore.getState().broadcastEvent('SHOPPING_ADJUSTMENTS_RESET', {});
        }
      },

      syncFromRemote: (items, activeCategory) => {
        set({ isRemoteUpdate: true });
        set({ items, activeCategory });
        setTimeout(() => set({ isRemoteUpdate: false }), 100);
      },

      initSyncListeners: () => {
        const registerListener = useCollabStore.getState().registerListener;

        registerListener('SHOPPING_ITEM_TOGGLED', (event: SyncEvent) => {
          const payload = event.payload as unknown as ShoppingItemToggledPayload;
          set((state) => ({
            items: state.items.map((item) =>
              item.ingredientId === payload.ingredientId
                ? { ...item, checked: payload.checked }
                : item
            ),
          }));
        });

        registerListener('SHOPPING_ITEM_AMOUNT_UPDATED', (event: SyncEvent) => {
          const payload = event.payload as unknown as ShoppingItemAmountUpdatedPayload;
          get().updateAmount(payload.ingredientId, payload.amount, false);
        });

        registerListener('SHOPPING_CHECKED_RESET', () => {
          get().resetChecked(false);
        });

        registerListener('SHOPPING_ADJUSTMENTS_RESET', () => {
          get().resetAdjustments(false);
        });

        registerListener('SHOPPING_REGENERATED', (event: SyncEvent) => {
          const payload = event.payload as unknown as ShoppingRegeneratedPayload;
          set({ isRemoteUpdate: true });
          set({ items: payload.items });
          setTimeout(() => set({ isRemoteUpdate: false }), 100);
        });

        registerListener('SHOPPING_CLEARED', () => {
          get().clearAll(false);
        });

        registerListener('SHOPPING_CATEGORY_CHANGED', (event: SyncEvent) => {
          const payload = event.payload as unknown as ShoppingCategoryChangedPayload;
          get().setActiveCategory(payload.category, false);
        });
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
