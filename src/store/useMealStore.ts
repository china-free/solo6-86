import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dish, DayMeals, MealType } from '@/types';
import type { SyncEvent, MealDishAddedPayload, MealDishRemovedPayload, MealDishServingsUpdatedPayload, MealDayClearedPayload, MealWeekClearedPayload, MealTemplateAppliedPayload, MealCurrentDateChangedPayload } from '@/types/sync';
import { getWeekKey, getWeekDates, formatDateKey, generateId } from '@/utils/date';
import { useCollabStore } from './useCollabStore';

interface MealState {
  currentDate: Date;
  weekKey: string;
  days: Record<string, DayMeals>;
  isRemoteUpdate: boolean;
  setCurrentDate: (date: Date, broadcast?: boolean) => void;
  addDish: (dateKey: string, mealType: MealType, dish: Dish, broadcast?: boolean) => void;
  removeDish: (dateKey: string, mealType: MealType, dishId: string, broadcast?: boolean) => void;
  updateDishServings: (dateKey: string, mealType: MealType, dishId: string, servings: number, broadcast?: boolean) => void;
  clearDay: (dateKey: string, broadcast?: boolean) => void;
  clearWeek: (broadcast?: boolean) => void;
  applyTemplate: (meals: Record<string, DayMeals>, broadcast?: boolean) => void;
  syncFromRemote: (currentDate: Date, weekKey: string, days: Record<string, DayMeals>) => void;
  initSyncListeners: () => void;
}

const createEmptyDayMeals = (): DayMeals => ({
  breakfast: [],
  lunch: [],
  dinner: [],
});

const initializeWeek = (baseDate: Date): Record<string, DayMeals> => {
  const days: Record<string, DayMeals> = {};
  const weekDates = getWeekDates(baseDate);
  weekDates.forEach((date) => {
    days[formatDateKey(date)] = createEmptyDayMeals();
  });
  return days;
};

const shouldBroadcast = (): boolean => {
  return useCollabStore.getState().isCollaborating;
};

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      currentDate: new Date(),
      weekKey: getWeekKey(new Date()),
      days: initializeWeek(new Date()),
      isRemoteUpdate: false,

      setCurrentDate: (date: Date, broadcast = true) => {
        const newWeekKey = getWeekKey(date);
        const { weekKey } = get();

        if (newWeekKey !== weekKey) {
          const existingDays = get().days;
          const newDays = initializeWeek(date);

          const mergedDays = { ...newDays };
          Object.keys(existingDays).forEach((key) => {
            if (mergedDays[key]) {
              mergedDays[key] = existingDays[key];
            }
          });

          set({
            currentDate: date,
            weekKey: newWeekKey,
            days: mergedDays,
          });
        } else {
          set({ currentDate: date });
        }

        if (broadcast && shouldBroadcast()) {
          const payload: MealCurrentDateChangedPayload = {
            date: date.toISOString(),
            weekKey: newWeekKey,
          };
          useCollabStore.getState().broadcastEvent('MEAL_CURRENT_DATE_CHANGED', payload);
        }
      },

      addDish: (dateKey: string, mealType: MealType, dish: Dish, broadcast = true) => {
        const newDish = { ...dish, id: `${dish.id}-${generateId()}` };

        set((state) => {
          const dayMeals = state.days[dateKey] || createEmptyDayMeals();
          return {
            days: {
              ...state.days,
              [dateKey]: {
                ...dayMeals,
                [mealType]: [...dayMeals[mealType], newDish],
              },
            },
          };
        });

        if (broadcast && shouldBroadcast()) {
          const payload: MealDishAddedPayload = {
            dateKey,
            mealType,
            dish: newDish,
          };
          useCollabStore.getState().broadcastEvent('MEAL_DISH_ADDED', payload);
        }
      },

      removeDish: (dateKey: string, mealType: MealType, dishId: string, broadcast = true) => {
        set((state) => {
          const dayMeals = state.days[dateKey];
          if (!dayMeals) return state;

          return {
            days: {
              ...state.days,
              [dateKey]: {
                ...dayMeals,
                [mealType]: dayMeals[mealType].filter((d) => d.id !== dishId),
              },
            },
          };
        });

        if (broadcast && shouldBroadcast()) {
          const payload: MealDishRemovedPayload = {
            dateKey,
            mealType,
            dishId,
          };
          useCollabStore.getState().broadcastEvent('MEAL_DISH_REMOVED', payload);
        }
      },

      updateDishServings: (dateKey: string, mealType: MealType, dishId: string, servings: number, broadcast = true) => {
        set((state) => {
          const dayMeals = state.days[dateKey];
          if (!dayMeals) return state;

          return {
            days: {
              ...state.days,
              [dateKey]: {
                ...dayMeals,
                [mealType]: dayMeals[mealType].map((d) =>
                  d.id === dishId ? { ...d, servings } : d
                ),
              },
            },
          };
        });

        if (broadcast && shouldBroadcast()) {
          const payload: MealDishServingsUpdatedPayload = {
            dateKey,
            mealType,
            dishId,
            servings,
          };
          useCollabStore.getState().broadcastEvent('MEAL_DISH_SERVINGS_UPDATED', payload);
        }
      },

      clearDay: (dateKey: string, broadcast = true) => {
        set((state) => ({
          days: {
            ...state.days,
            [dateKey]: createEmptyDayMeals(),
          },
        }));

        if (broadcast && shouldBroadcast()) {
          const payload: MealDayClearedPayload = { dateKey };
          useCollabStore.getState().broadcastEvent('MEAL_DAY_CLEARED', payload);
        }
      },

      clearWeek: (broadcast = true) => {
        const { currentDate, weekKey } = get();
        set({
          days: initializeWeek(currentDate),
        });

        if (broadcast && shouldBroadcast()) {
          const payload: MealWeekClearedPayload = { weekKey };
          useCollabStore.getState().broadcastEvent('MEAL_WEEK_CLEARED', payload);
        }
      },

      applyTemplate: (meals: Record<string, DayMeals>, broadcast = true) => {
        const { currentDate } = get();
        const weekDates = getWeekDates(currentDate);
        const templateDateKeys = Object.keys(meals).sort();
        const newDays: Record<string, DayMeals> = {};

        weekDates.forEach((date, index) => {
          const dateKey = formatDateKey(date);
          const templateKey = templateDateKeys[index];
          if (templateKey && meals[templateKey]) {
            newDays[dateKey] = {
              breakfast: meals[templateKey].breakfast.map((d) => ({
                ...d,
                id: `${d.id}-${generateId()}`,
              })),
              lunch: meals[templateKey].lunch.map((d) => ({
                ...d,
                id: `${d.id}-${generateId()}`,
              })),
              dinner: meals[templateKey].dinner.map((d) => ({
                ...d,
                id: `${d.id}-${generateId()}`,
              })),
            };
          } else {
            newDays[dateKey] = createEmptyDayMeals();
          }
        });

        set({ days: newDays });

        if (broadcast && shouldBroadcast()) {
          const payload: MealTemplateAppliedPayload = { meals: newDays };
          useCollabStore.getState().broadcastEvent('MEAL_TEMPLATE_APPLIED', payload);
        }
      },

      syncFromRemote: (currentDate: Date, weekKey: string, days: Record<string, DayMeals>) => {
        set({ isRemoteUpdate: true });
        set({ currentDate, weekKey, days });
        setTimeout(() => set({ isRemoteUpdate: false }), 100);
      },

      initSyncListeners: () => {
        const registerListener = useCollabStore.getState().registerListener;

        registerListener('MEAL_DISH_ADDED', (event: SyncEvent) => {
          const payload = event.payload as unknown as MealDishAddedPayload;
          get().addDish(payload.dateKey, payload.mealType, payload.dish, false);
        });

        registerListener('MEAL_DISH_REMOVED', (event: SyncEvent) => {
          const payload = event.payload as unknown as MealDishRemovedPayload;
          get().removeDish(payload.dateKey, payload.mealType, payload.dishId, false);
        });

        registerListener('MEAL_DISH_SERVINGS_UPDATED', (event: SyncEvent) => {
          const payload = event.payload as unknown as MealDishServingsUpdatedPayload;
          get().updateDishServings(payload.dateKey, payload.mealType, payload.dishId, payload.servings, false);
        });

        registerListener('MEAL_DAY_CLEARED', (event: SyncEvent) => {
          const payload = event.payload as unknown as MealDayClearedPayload;
          get().clearDay(payload.dateKey, false);
        });

        registerListener('MEAL_WEEK_CLEARED', (event: SyncEvent) => {
          const payload = event.payload as unknown as MealWeekClearedPayload;
          const { weekKey } = payload;
          if (weekKey === get().weekKey) {
            get().clearWeek(false);
          }
        });

        registerListener('MEAL_TEMPLATE_APPLIED', (event: SyncEvent) => {
          const payload = event.payload as unknown as MealTemplateAppliedPayload;
          set({ isRemoteUpdate: true });
          set({ days: payload.meals });
          setTimeout(() => set({ isRemoteUpdate: false }), 100);
        });

        registerListener('MEAL_CURRENT_DATE_CHANGED', (event: SyncEvent) => {
          const payload = event.payload as unknown as MealCurrentDateChangedPayload;
          get().setCurrentDate(new Date(payload.date), false);
        });
      },
    }),
    {
      name: 'meal-plan-storage',
      partialize: (state) => ({ days: state.days, weekKey: state.weekKey }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const today = new Date();
          const currentWeekKey = getWeekKey(today);
          if (state.weekKey !== currentWeekKey) {
            state.days = { ...state.days, ...initializeWeek(today) };
            state.weekKey = currentWeekKey;
          }
        }
      },
    }
  )
);
