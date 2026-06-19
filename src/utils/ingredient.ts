import type { Dish, DayMeals, ShoppingItem, IngredientCategory } from '@/types';

const UNIT_CONVERSIONS: Record<string, { to: string; factor: number }[]> = {
  克: [{ to: '千克', factor: 1000 }],
  千克: [{ to: '克', factor: 0.001 }],
  毫升: [{ to: '升', factor: 1000 }],
  升: [{ to: '毫升', factor: 0.001 }],
};

export const calculateShoppingList = (
  days: Record<string, DayMeals>
): ShoppingItem[] => {
  const ingredientMap = new Map<string, {
    name: string;
    category: IngredientCategory;
    totalAmount: number;
    unit: string;
  }>();

  Object.values(days).forEach((dayMeals) => {
    const allDishes = [
      ...dayMeals.breakfast,
      ...dayMeals.lunch,
      ...dayMeals.dinner,
    ];

    allDishes.forEach((dish) => {
      dish.ingredients.forEach((ing) => {
        const key = `${ing.id}-${ing.unit}`;
        const existing = ingredientMap.get(key);

        if (existing) {
          existing.totalAmount += ing.amount * dish.servings;
        } else {
          ingredientMap.set(key, {
            name: ing.name,
            category: ing.category,
            totalAmount: ing.amount * dish.servings,
            unit: ing.unit,
          });
        }
      });
    });
  });

  const shoppingItems: ShoppingItem[] = Array.from(ingredientMap.entries()).map(
    ([key, value]) => ({
      ingredientId: key.split('-')[0],
      name: value.name,
      category: value.category,
      totalAmount: Math.round(value.totalAmount * 10) / 10,
      unit: value.unit,
      checked: false,
      adjusted: false,
    })
  );

  const categoryOrder: IngredientCategory[] = [
    'vegetable',
    'meat',
    'seafood',
    'dairy',
    'fruit',
    'staple',
    'seasoning',
    'other',
  ];

  shoppingItems.sort((a, b) => {
    const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (categoryDiff !== 0) return categoryDiff;
    return a.name.localeCompare(b.name, 'zh-CN');
  });

  return shoppingItems;
};

export const groupByCategory = (items: ShoppingItem[]): Record<IngredientCategory, ShoppingItem[]> => {
  const grouped: Partial<Record<IngredientCategory, ShoppingItem[]>> = {};

  items.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category]!.push(item);
  });

  return grouped as Record<IngredientCategory, ShoppingItem[]>;
};

export const formatAmount = (amount: number, unit: string): string => {
  if (Number.isInteger(amount)) {
    return `${amount}${unit}`;
  }
  return `${amount.toFixed(1)}${unit}`;
};

export const getDishIngredientsSummary = (dishes: Dish[]): string => {
  if (dishes.length === 0) return '暂无菜品';
  return dishes.map((d) => d.name).join('、');
};

export const getTotalItemsCount = (items: ShoppingItem[]): number => {
  return items.length;
};

export const getUncheckedCount = (items: ShoppingItem[]): number => {
  return items.filter((item) => !item.checked).length;
};

export const getCheckedCount = (items: ShoppingItem[]): number => {
  return items.filter((item) => item.checked).length;
};
