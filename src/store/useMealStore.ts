import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dish, DayMeals, MealType } from '@/types';
import { getWeekKey, getWeekDates, formatDateKey, generateId } from '@/utils/date';

interface MealState {
  currentDate: Date;
  weekKey: string;
  days: Record<string, DayMeals>;
  setCurrentDate: (date: Date) => void;
  addDish: (dateKey: string, mealType: MealType, dish: Dish) => void;
  removeDish: (dateKey: string, mealType: MealType, dishId: string) => void;
  updateDishServings: (dateKey: string, mealType: MealType, dishId: string, servings: number) => void;
  clearDay: (dateKey: string) => void;
  clearWeek: () => void;
  applyTemplate: (meals: Record<string, DayMeals>) => void;
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

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      currentDate: new Date(),
      weekKey: getWeekKey(new Date()),
      days: initializeWeek(new Date()),

      setCurrentDate: (date: Date) => {
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
      },

      addDish: (dateKey: string, mealType: MealType, dish: Dish) => {
        set((state) => {
          const dayMeals = state.days[dateKey] || createEmptyDayMeals();
          const newDish = { ...dish, id: `${dish.id}-${generateId()}` };
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
      },

      removeDish: (dateKey: string, mealType: MealType, dishId: string) => {
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
      },

      updateDishServings: (dateKey: string, mealType: MealType, dishId: string, servings: number) => {
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
      },

      clearDay: (dateKey: string) => {
        set((state) => ({
          days: {
            ...state.days,
            [dateKey]: createEmptyDayMeals(),
          },
        }));
      },

      clearWeek: () => {
        const { currentDate } = get();
        set({
          days: initializeWeek(currentDate),
        });
      },

      applyTemplate: (meals: Record<string, DayMeals>) => {
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
