import { Plus, X } from 'lucide-react';
import type { Dish, MealType } from '@/types';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types';

interface MealCardProps {
  mealType: MealType;
  dishes: Dish[];
  onAddClick: () => void;
  onRemoveDish: (dishId: string) => void;
  onDishClick?: (dish: Dish) => void;
}

const MealCard = ({ mealType, dishes, onAddClick, onRemoveDish, onDishClick }: MealCardProps) => {
  const mealIcon = MEAL_TYPE_ICONS[mealType];
  const mealLabel = MEAL_TYPE_LABELS[mealType];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card hover:shadow-soft transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mealIcon}</span>
          <span className="font-medium text-primary-700">{mealLabel}</span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors btn-press"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-2 min-h-[60px]">
        {dishes.length === 0 ? (
          <button
            onClick={onAddClick}
            className="w-full py-3 border-2 border-dashed border-cream-300 rounded-xl text-cream-500 text-sm hover:border-primary-300 hover:text-primary-400 transition-colors"
          >
            添加菜品
          </button>
        ) : (
          dishes.map((dish) => (
            <div
              key={dish.id}
              className="group flex items-center justify-between p-2.5 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors cursor-pointer"
              onClick={() => onDishClick?.(dish)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{dish.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary-700 truncate">
                    {dish.name}
                  </p>
                  <p className="text-xs text-primary-500">
                    {dish.servings}人份
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveDish(dish.id);
                }}
                className="p-1 rounded-lg text-primary-400 opacity-0 group-hover:opacity-100 hover:text-accent-500 hover:bg-accent-50 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MealCard;
