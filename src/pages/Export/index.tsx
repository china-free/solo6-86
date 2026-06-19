import { useState, useRef } from 'react';
import { Download, Printer, FileText, Settings, Check, ListChecks, Grid3X3 } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';
import { generateShoppingListPDF, printShoppingList } from '@/utils/pdf';
import type { IngredientCategory } from '@/types';
import { INGREDIENT_CATEGORY_LABELS } from '@/types';
import Button from '@/components/Button';
import { groupByCategory, formatAmount } from '@/utils/ingredient';

type LayoutType = 'list' | 'grid';
type ShowMode = 'all' | 'unchecked' | 'checked';

const ExportPage = () => {
  const { items } = useShoppingStore();
  const printRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<LayoutType>('list');
  const [showMode, setShowMode] = useState<ShowMode>('unchecked');
  const [showCategories, setShowCategories] = useState(true);
  const [title, setTitle] = useState('购物清单');
  const [includeDate, setIncludeDate] = useState(true);

  const displayItems = items.filter((item) => {
    if (showMode === 'all') return true;
    if (showMode === 'unchecked') return !item.checked;
    return item.checked;
  });

  const groupedItems = groupByCategory(displayItems);
  const categories = Object.keys(groupedItems) as IngredientCategory[];

  const handleExportPDF = () => {
    generateShoppingListPDF(
      showMode === 'unchecked' ? items.filter((i) => !i.checked) : items,
      title,
      includeDate ? new Date().toLocaleDateString('zh-CN') : undefined
    );
  };

  const handlePrint = () => {
    printShoppingList(
      showMode === 'unchecked' ? items.filter((i) => !i.checked) : items
    );
  };

  const totalItems = displayItems.length;
  const uncheckedCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-primary-700 mb-1">
            导出打印
          </h2>
          <p className="text-primary-500 text-sm">
            预览并导出你的购物清单
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={18} />
            打印
          </Button>
          <Button onClick={handleExportPDF}>
            <Download size={18} />
            导出PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={18} className="text-primary-600" />
              <h3 className="font-display text-lg text-primary-700">导出设置</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  清单标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-sm text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  显示内容
                </label>
                <div className="space-y-1">
                  {[
                    { value: 'unchecked', label: '仅待购', count: uncheckedCount },
                    { value: 'checked', label: '仅已有', count: checkedCount },
                    { value: 'all', label: '全部', count: items.length },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setShowMode(option.value as ShowMode)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                        showMode === option.value
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'bg-cream-50 text-primary-600 hover:bg-cream-100'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  布局样式
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLayout('list')}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                      layout === 'list'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-cream-50 text-primary-500 hover:bg-cream-100'
                    }`}
                  >
                    <ListChecks size={20} />
                    <span className="text-xs">列表</span>
                  </button>
                  <button
                    onClick={() => setLayout('grid')}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                      layout === 'grid'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-cream-50 text-primary-500 hover:bg-cream-100'
                    }`}
                  >
                    <Grid3X3 size={20} />
                    <span className="text-xs">分类</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">显示分类</span>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showCategories ? 'bg-primary-500' : 'bg-cream-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      showCategories ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  ></span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">显示日期</span>
                <button
                  onClick={() => setIncludeDate(!includeDate)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    includeDate ? 'bg-primary-500' : 'bg-cream-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      includeDate ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white shadow-soft-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} />
              <span className="font-medium">统计信息</span>
            </div>
            <div className="text-3xl font-bold mb-1">{totalItems}</div>
            <p className="text-white/80 text-sm">项将被导出</p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-cream-200/50 rounded-2xl p-6">
            <p className="text-sm text-primary-500 mb-3 text-center">打印预览</p>

            <div
              ref={printRef}
              className="bg-white rounded-lg shadow-lg mx-auto max-w-md p-8 min-h-[500px]"
              style={{ aspectRatio: '210 / 297' }}
            >
              <div className="mb-4">
                <h1 className="font-display text-2xl text-primary-700 mb-1">
                  🛒 {title}
                </h1>
                {includeDate && (
                  <p className="text-sm text-primary-500">
                    {new Date().toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </p>
                )}
              </div>

              <div className="border-t border-cream-200 pt-2 mb-4">
                <p className="text-xs text-primary-500">
                  共 {totalItems} 项
                </p>
              </div>

              {displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-primary-400">
                  <span className="text-4xl mb-2">📋</span>
                  <p className="text-sm">没有可显示的食材</p>
                </div>
              ) : showCategories && layout === 'grid' ? (
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryItems = groupedItems[category];
                    if (!categoryItems || categoryItems.length === 0) return null;

                    return (
                      <div key={category}>
                        <h3 className="text-sm font-medium text-primary-600 mb-2 pb-1 border-b border-cream-100">
                          {INGREDIENT_CATEGORY_LABELS[category]}
                          <span className="text-xs text-primary-400 ml-1">
                            ({categoryItems.length})
                          </span>
                        </h3>
                        <div className="space-y-1">
                          {categoryItems.map((item) => (
                            <div
                              key={item.ingredientId}
                              className="flex items-center justify-between py-1"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3.5 h-3.5 rounded border ${
                                    item.checked
                                      ? 'bg-primary-500 border-primary-500'
                                      : 'border-cream-300'
                                  }`}
                                >
                                  {item.checked && <Check size={10} className="text-white m-0.5" />}
                                </div>
                                <span
                                  className={`text-sm ${
                                    item.checked
                                      ? 'text-cream-500 line-through'
                                      : 'text-primary-700'
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </div>
                              <span
                                className={`text-xs ${
                                  item.checked ? 'text-cream-400' : 'text-primary-500'
                                }`}
                              >
                                {formatAmount(item.totalAmount, item.unit)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {displayItems.map((item) => (
                    <div
                      key={item.ingredientId}
                      className="flex items-center justify-between py-1.5 border-b border-cream-50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border ${
                            item.checked
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-cream-300'
                          }`}
                        >
                          {item.checked && <Check size={12} className="text-white m-0.5" />}
                        </div>
                        <span
                          className={`text-sm ${
                            item.checked
                              ? 'text-cream-500 line-through'
                              : 'text-primary-700'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs ${
                          item.checked ? 'text-cream-400' : 'text-primary-500'
                        }`}
                      >
                        {formatAmount(item.totalAmount, item.unit)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="absolute bottom-8 left-8 right-8">
                <div className="border-t border-cream-100 pt-2 text-center">
                  <p className="text-xs text-primary-400">家庭菜单计划 · 购物清单</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
