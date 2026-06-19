import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Trash2, RotateCcw } from 'lucide-react';
import { useMealStore } from '@/store/useMealStore';
import { useShoppingStore } from '@/store/useShoppingStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import {
  getWeekDates,
  getWeekRangeText,
  formatDateKey,
  formatDateDisplay,
  formatWeekdayShort,
  isToday,
  nextWeek,
  prevWeek,
} from '@/utils/date';
import type { Dish, MealType } from '@/types';
import { MEAL_TYPE_LABELS } from '@/types';
import MealCard from '@/components/MealCard';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import DishSelector from '@/components/DishSelector';
import { calculateShoppingList } from '@/utils/ingredient';

const MealPlanPage = () => {
  const { currentDate, days, setCurrentDate, addDish, removeDish, clearWeek } =
    useMealStore();
  const { templates } = useTemplateStore();
  const { regenerate } = useShoppingStore();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [showDishSelector, setShowDishSelector] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const weekDates = getWeekDates(currentDate);
  const weekRangeText = getWeekRangeText(currentDate);

  const handlePrevWeek = () => {
    setCurrentDate(prevWeek(currentDate));
  };

  const handleNextWeek = () => {
    setCurrentDate(nextWeek(currentDate));
  };

  const handleAddDish = (dateKey: string, mealType: MealType) => {
    setSelectedDay(dateKey);
    setSelectedMeal(mealType);
    setShowDishSelector(true);
  };

  const handleSelectDish = (dish: Dish) => {
    if (selectedDay && selectedMeal) {
      addDish(selectedDay, selectedMeal, dish);
      regenerate();
      setShowDishSelector(false);
      setSelectedDay(null);
      setSelectedMeal(null);
    }
  };

  const handleRemoveDish = (dateKey: string, mealType: MealType, dishId: string) => {
    removeDish(dateKey, mealType, dishId);
    regenerate();
  };

  const handleClearWeek = () => {
    clearWeek();
    regenerate();
    setShowClearConfirm(false);
  };

  const handleGenerateList = () => {
    regenerate();
  };

  const totalDishes = Object.values(days).reduce(
    (acc, day) => acc + day.breakfast.length + day.lunch.length + day.dinner.length,
    0
  );

  const totalIngredients = calculateShoppingList(days).length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-primary-700 mb-1">
            本周菜单
          </h2>
          <p className="text-primary-500 text-sm">
            规划一周饮食，让生活更有滋味
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-card">
            <button
              onClick={handlePrevWeek}
              className="p-2 rounded-lg text-primary-600 hover:bg-cream-100 transition-colors btn-press"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-1.5 font-medium text-primary-700 min-w-[160px] text-center">
              {weekRangeText}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-2 rounded-lg text-primary-600 hover:bg-cream-100 transition-colors btn-press"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white shadow-soft-lg">
          <div className="text-3xl mb-2">🍽️</div>
          <p className="text-3xl font-bold">{totalDishes}</p>
          <p className="text-white/80 text-sm">道菜品</p>
        </div>
        <div className="bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl p-5 text-white shadow-soft-lg">
          <div className="text-3xl mb-2">🥬</div>
          <p className="text-3xl font-bold">{totalIngredients}</p>
          <p className="text-white/80 text-sm">种食材</p>
        </div>
        <div className="bg-gradient-to-br from-warm-400 to-warm-600 rounded-2xl p-5 text-white shadow-soft-lg">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-3xl font-bold">{templates.length}</p>
          <p className="text-white/80 text-sm">个模板</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200">
          <p className="text-primary-500 text-sm mb-3">快捷操作</p>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              fullWidth
              onClick={handleGenerateList}
              className="justify-center"
            >
              <Sparkles size={16} />
              生成购物清单
            </Button>
            <Button
              size="sm"
              variant="ghost"
              fullWidth
              onClick={() => setShowClearConfirm(true)}
              className="justify-center text-accent-500 hover:text-accent-600 hover:bg-accent-50"
            >
              <RotateCcw size={16} />
              清空本周
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayMeals = days[dateKey] || {
            breakfast: [],
            lunch: [],
            dinner: [],
          };
          const today = isToday(date);

          return (
            <div
              key={dateKey}
              className={`rounded-3xl p-4 transition-all animate-slide-up animate-stagger-${
                index + 1
              } ${
                today
                  ? 'bg-primary-50 border-2 border-primary-300 shadow-soft'
                  : 'bg-white border border-cream-200 shadow-card'
              }`}
              style={{ animationFillMode: 'backwards' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      today ? 'text-primary-600' : 'text-primary-500'
                    }`}
                  >
                    {formatWeekdayShort(date)}
                  </p>
                  <p
                    className={`font-display text-xl ${
                      today ? 'text-primary-700' : 'text-primary-700'
                    }`}
                  >
                    {formatDateDisplay(date)}
                  </p>
                </div>
                {today && (
                  <span className="px-2.5 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                    今天
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(
                  (mealType) => (
                    <MealCard
                      key={mealType}
                      mealType={mealType}
                      dishes={dayMeals[mealType]}
                      onAddClick={() => handleAddDish(dateKey, mealType)}
                      onRemoveDish={(dishId) =>
                        handleRemoveDish(dateKey, mealType, dishId)
                      }
                    />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={showDishSelector}
        onClose={() => {
          setShowDishSelector(false);
          setSelectedDay(null);
          setSelectedMeal(null);
        }}
        title={`添加${selectedMeal ? MEAL_TYPE_LABELS[selectedMeal] : ''}菜品`}
        size="lg"
      >
        <DishSelector
          onSelect={handleSelectDish}
          onClose={() => {
            setShowDishSelector(false);
            setSelectedDay(null);
            setSelectedMeal(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="确认清空"
        size="sm"
      >
        <p className="text-primary-600 mb-6">
          确定要清空本周所有菜单吗？此操作不可撤销。
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowClearConfirm(false)}
            className="justify-center"
          >
            取消
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleClearWeek}
            className="justify-center"
          >
            <Trash2 size={18} />
            确认清空
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MealPlanPage;
