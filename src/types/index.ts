export type IngredientCategory =
  | 'vegetable'
  | 'meat'
  | 'seasoning'
  | 'staple'
  | 'fruit'
  | 'dairy'
  | 'seafood'
  | 'other';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  amount: number;
  unit: string;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  ingredients: Ingredient[];
  servings: number;
  emoji: string;
}

export interface DayMeals {
  breakfast: Dish[];
  lunch: Dish[];
  dinner: Dish[];
}

export interface MealPlan {
  weekKey: string;
  days: Record<string, DayMeals>;
}

export interface ShoppingItem {
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  totalAmount: number;
  unit: string;
  checked: boolean;
  adjusted: boolean;
}

export interface MealTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  meals: Record<string, DayMeals>;
  coverEmoji: string;
  createdAt: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isAdmin: boolean;
  isOnline: boolean;
  lastActive: number;
}

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  vegetable: '蔬菜',
  meat: '肉类',
  seasoning: '调料',
  staple: '主食',
  fruit: '水果',
  dairy: '乳制品',
  seafood: '海鲜',
  other: '其他',
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
};
