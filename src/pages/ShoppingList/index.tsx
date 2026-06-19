import { useEffect, useMemo } from 'react';
import { RefreshCw, CheckCircle2, Circle, ShoppingCart, Trash2 } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';
import { useMealStore } from '@/store/useMealStore';
import type { IngredientCategory } from '@/types';
import { INGREDIENT_CATEGORY_LABELS } from '@/types';
import IngredientItem from '@/components/IngredientItem';
import Button from '@/components/Button';
import { groupByCategory, getCheckedCount, getUncheckedCount } from '@/utils/ingredient';

const CATEGORIES: (IngredientCategory | 'all')[] = [
  'all',
  'vegetable',
  'meat',
  'seafood',
  'dairy',
  'fruit',
  'staple',
  'seasoning',
  'other',
];

const CATEGORY_ICONS: Record<IngredientCategory | 'all', string> = {
  all: '🛒',
  vegetable: '🥬',
  meat: '🥩',
  seafood: '🐟',
  dairy: '🥛',
  fruit: '🍎',
  staple: '🍚',
  seasoning: '🧂',
  other: '📦',
};

const ShoppingListPage = () => {
  const { items, activeCategory, setActiveCategory, toggleItem, updateAmount, resetChecked, regenerate } =
    useShoppingStore();
  const { days } = useMealStore();

  useEffect(() => {
    if (items.length === 0) {
      regenerate();
    }
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const groupedItems = useMemo(() => {
    return groupByCategory(filteredItems);
  }, [filteredItems]);

  const checkedCount = getCheckedCount(items);
  const uncheckedCount = getUncheckedCount(items);
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const categoriesWithItems = Object.keys(groupedItems).filter(
    (cat) => groupedItems[cat as IngredientCategory]?.length > 0
  ) as IngredientCategory[];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-primary-700 mb-1">
            购物清单
          </h2>
          <p className="text-primary-500 text-sm">
            勾选家中已有食材，待买的一目了然
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={regenerate}
            className="justify-center"
          >
            <RefreshCw size={16} />
            重新生成
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetChecked}
            className="justify-center"
          >
            <Circle size={16} />
            重置勾选
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl">
              <ShoppingCart className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-700">{totalCount}</p>
              <p className="text-sm text-primary-500">总食材数</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center">
              <CheckCircle2 className="text-accent-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-600">{checkedCount}</p>
              <p className="text-sm text-primary-500">已有食材</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-warm-50 flex items-center justify-center">
              <Circle className="text-warm-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-600">{uncheckedCount}</p>
              <p className="text-sm text-primary-500">待购买</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-600">采购进度</span>
          <span className="text-sm text-primary-500">
            {checkedCount} / {totalCount}
          </span>
        </div>
        <div className="w-full h-3 bg-cream-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {CATEGORIES.map((cat) => {
          const count = cat === 'all'
            ? items.length
            : items.filter((i) => i.category === cat).length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all btn-press ${
                isActive
                  ? 'bg-primary-600 text-white shadow-card'
                  : 'bg-white text-primary-600 border border-cream-200 hover:border-primary-300'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              <span>{cat === 'all' ? '全部' : INGREDIENT_CATEGORY_LABELS[cat]}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-cream-100 text-primary-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-card border border-cream-200">
          <div className="text-6xl mb-4 animate-float">🛒</div>
          <h3 className="font-display text-xl text-primary-700 mb-2">
            购物清单是空的
          </h3>
          <p className="text-primary-500 text-sm mb-6">
            先去菜单计划页面添加菜品吧
          </p>
          <Button onClick={regenerate}>
            <RefreshCw size={18} />
            生成清单
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesWithItems.map((category, catIndex) => (
            <div
              key={category}
              className="animate-slide-up"
              style={{
                animationDelay: `${catIndex * 0.05}s`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{CATEGORY_ICONS[category]}</span>
                <h3 className="font-display text-lg text-primary-700">
                  {INGREDIENT_CATEGORY_LABELS[category]}
                </h3>
                <span className="px-2 py-0.5 bg-cream-100 text-primary-500 text-xs rounded-full">
                  {groupedItems[category].length}种
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedItems[category].map((item, itemIndex) => (
                  <div
                    key={item.ingredientId}
                    style={{
                      animationDelay: `${catIndex * 0.05 + itemIndex * 0.03}s`,
                      animationFillMode: 'backwards',
                    }}
                    className="animate-slide-up"
                  >
                    <IngredientItem
                      item={item}
                      onToggle={toggleItem}
                      onAmountChange={updateAmount}
                      showControls
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-20"></div>
    </div>
  );
};

export default ShoppingListPage;
