import type { Dish, DayMeals, MealType, ShoppingItem, IngredientCategory } from '@/types';

export type SyncEventType =
  | 'MEMBER_JOIN'
  | 'MEMBER_HEARTBEAT'
  | 'MEMBER_LEAVE'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE'
  | 'MEAL_DISH_ADDED'
  | 'MEAL_DISH_REMOVED'
  | 'MEAL_DISH_SERVINGS_UPDATED'
  | 'MEAL_DAY_CLEARED'
  | 'MEAL_WEEK_CLEARED'
  | 'MEAL_TEMPLATE_APPLIED'
  | 'MEAL_CURRENT_DATE_CHANGED'
  | 'SHOPPING_ITEM_TOGGLED'
  | 'SHOPPING_ITEM_AMOUNT_UPDATED'
  | 'SHOPPING_CHECKED_RESET'
  | 'SHOPPING_ADJUSTMENTS_RESET'
  | 'SHOPPING_REGENERATED'
  | 'SHOPPING_CLEARED'
  | 'SHOPPING_CATEGORY_CHANGED';

export interface SyncEvent {
  type: SyncEventType;
  eventId: string;
  memberId: string;
  timestamp: number;
  payload: unknown;
}

export interface MealDishAddedPayload {
  dateKey: string;
  mealType: MealType;
  dish: Dish;
}

export interface MealDishRemovedPayload {
  dateKey: string;
  mealType: MealType;
  dishId: string;
}

export interface MealDishServingsUpdatedPayload {
  dateKey: string;
  mealType: MealType;
  dishId: string;
  servings: number;
}

export interface MealDayClearedPayload {
  dateKey: string;
}

export interface MealWeekClearedPayload {
  weekKey: string;
}

export interface MealTemplateAppliedPayload {
  meals: Record<string, DayMeals>;
}

export interface MealCurrentDateChangedPayload {
  date: string;
  weekKey: string;
}

export interface ShoppingItemToggledPayload {
  ingredientId: string;
  checked: boolean;
}

export interface ShoppingItemAmountUpdatedPayload {
  ingredientId: string;
  amount: number;
}

export interface ShoppingRegeneratedPayload {
  items: ShoppingItem[];
}

export interface ShoppingCategoryChangedPayload {
  category: IngredientCategory | 'all';
}

export interface SyncRequestPayload {
  requestMemberId: string;
}

export interface SyncResponsePayload {
  memberId: string;
  mealState: {
    currentDate: string;
    weekKey: string;
    days: Record<string, DayMeals>;
  };
  shoppingState: {
    items: ShoppingItem[];
    activeCategory: IngredientCategory | 'all';
  };
}
