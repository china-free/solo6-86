import { useState, useMemo } from 'react';
import { Search, Plus, X } from 'lucide-react';
import type { Dish } from '@/types';
import { DISH_LIBRARY, DISH_CATEGORIES } from '@/data/dishes';

interface DishSelectorProps {
  onSelect: (dish: Dish) => void;
  onClose: () => void;
}

const DishSelector = ({ onSelect, onClose }: DishSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredDishes = useMemo(() => {
    return DISH_LIBRARY.filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        activeCategory === '全部' || dish.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="flex flex-col h-full max-h-[60vh]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400"
          />
          <input
            type="text"
            placeholder="搜索菜品或食材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-primary-700 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300"
          />
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl hover:bg-cream-100 text-primary-500 transition-colors btn-press"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {DISH_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-primary-600 text-white shadow-card'
                : 'bg-cream-100 text-primary-600 hover:bg-cream-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {filteredDishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-primary-400">
            <span className="text-4xl mb-2">🔍</span>
            <p>没有找到相关菜品</p>
          </div>
        ) : (
          filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="group flex items-center justify-between p-3 bg-white rounded-2xl border border-cream-100 hover:border-primary-200 hover:shadow-card transition-all cursor-pointer"
              onClick={() => onSelect(dish)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{dish.emoji}</span>
                <div>
                  <p className="font-medium text-primary-700">{dish.name}</p>
                  <p className="text-xs text-primary-500">
                    {dish.category} · {dish.ingredients.length}种食材 · {dish.servings}人份
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-xl bg-primary-50 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity btn-press">
                <Plus size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DishSelector;
