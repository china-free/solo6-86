import { useState } from 'react';
import { Plus, Trash2, Eye, Copy, BookmarkPlus } from 'lucide-react';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useMealStore } from '@/store/useMealStore';
import { useShoppingStore } from '@/store/useShoppingStore';
import type { DayMeals, MealTemplate } from '@/types';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { useNavigate } from 'react-router-dom';

const TEMPLATE_CATEGORIES = ['全部', '家常', '健康', '减脂', '素食', '快手'];

const EMOJI_OPTIONS = ['🍱', '🥗', '🍜', '🍝', '🥘', '🍲', '🥣', '🍳', '🥪', '🌯'];

const TemplatesPage = () => {
  const { templates, addTemplate, removeTemplate, getTemplate } = useTemplateStore();
  const { days, applyTemplate } = useMealStore();
  const { regenerate } = useShoppingStore();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('全部');

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('家常');
  const [newTemplateEmoji, setNewTemplateEmoji] = useState('🍱');

  const filteredTemplates = templates.filter(
    (t) => activeCategory === '全部' || t.category === activeCategory
  );

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;
    addTemplate(
      newTemplateName,
      newTemplateDesc,
      newTemplateCategory,
      days,
      newTemplateEmoji
    );
    setShowCreateModal(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setNewTemplateCategory('家常');
    setNewTemplateEmoji('🍱');
  };

  const handleApplyTemplate = (template: MealTemplate) => {
    applyTemplate(template.meals);
    regenerate();
    navigate('/');
  };

  const handlePreviewTemplate = (template: MealTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      removeTemplate(templateToDelete);
    }
    setShowDeleteConfirm(false);
    setTemplateToDelete(null);
  };

  const getTotalDishes = (meals: Record<string, DayMeals>): number => {
    return Object.values(meals).reduce(
      (acc, day) => acc + day.breakfast.length + day.lunch.length + day.dinner.length,
      0
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-primary-700 mb-1">
            菜单模板
          </h2>
          <p className="text-primary-500 text-sm">
            保存常用菜单，一键应用到本周
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          保存为模板
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {TEMPLATE_CATEGORIES.map((cat) => {
          const count = cat === '全部'
            ? templates.length
            : templates.filter((t) => t.category === cat).length;
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
              {cat}
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

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-card border border-cream-200">
          <div className="text-6xl mb-4 animate-float">📚</div>
          <h3 className="font-display text-xl text-primary-700 mb-2">
            还没有模板
          </h3>
          <p className="text-primary-500 text-sm mb-6">
            规划好一周菜单后，保存为模板下次直接用
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <BookmarkPlus size={18} />
            创建第一个模板
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="group bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden card-hover animate-slide-up"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="h-32 bg-gradient-to-br from-primary-50 to-cream-100 flex items-center justify-center relative">
                <span className="text-5xl">{template.coverEmoji}</span>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-primary-600 rounded-full">
                  {template.category}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-display text-lg text-primary-700 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-primary-500 mb-3 line-clamp-2 h-10">
                  {template.description || '暂无描述'}
                </p>

                <div className="flex items-center gap-4 text-xs text-primary-500 mb-4">
                  <span className="flex items-center gap-1">
                    <span>🍽️</span>
                    {getTotalDishes(template.meals)}道菜
                  </span>
                  <span className="flex items-center gap-1">
                    <span>📅</span>
                    {Object.keys(template.meals).length}天
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    fullWidth
                    onClick={() => handlePreviewTemplate(template)}
                    className="justify-center"
                  >
                    <Eye size={16} />
                    预览
                  </Button>
                  <Button
                    size="sm"
                    fullWidth
                    onClick={() => handleApplyTemplate(template)}
                    className="justify-center"
                  >
                    <Copy size={16} />
                    应用
                  </Button>
                </div>

                <button
                  onClick={() => handleDeleteClick(template.id)}
                  className="mt-2 w-full py-1.5 text-xs text-accent-500 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="保存为模板"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              选择图标
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewTemplateEmoji(emoji)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all btn-press ${
                    newTemplateEmoji === emoji
                      ? 'bg-primary-100 border-2 border-primary-400'
                      : 'bg-cream-50 border border-cream-200 hover:border-primary-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              模板名称
            </label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="例如：家常周、减脂周"
              className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-primary-700 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              分类
            </label>
            <select
              value={newTemplateCategory}
              onChange={(e) => setNewTemplateCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300"
            >
              {TEMPLATE_CATEGORIES.filter((c) => c !== '全部').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              描述（可选）
            </label>
            <textarea
              value={newTemplateDesc}
              onChange={(e) => setNewTemplateDesc(e.target.value)}
              placeholder="简单描述这个模板的特点..."
              rows={3}
              className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-primary-700 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowCreateModal(false)}
              className="justify-center"
            >
              取消
            </Button>
            <Button
              fullWidth
              onClick={handleCreateTemplate}
              disabled={!newTemplateName.trim()}
              className="justify-center"
            >
              <BookmarkPlus size={18} />
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedTemplate(null);
        }}
        title={selectedTemplate?.name || '模板预览'}
        size="lg"
      >
        {selectedTemplate && (
          <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-cream-200">
              <span className="text-4xl">{selectedTemplate.coverEmoji}</span>
              <div>
                <p className="text-sm text-primary-500">
                  {selectedTemplate.category}
                </p>
                <p className="text-sm text-primary-600">
                  {selectedTemplate.description || '暂无描述'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
                <div
                  key={day}
                  className="text-center py-2 bg-cream-50 rounded-xl text-sm font-medium text-primary-600"
                >
                  周{day}
                </div>
              ))}
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                <div key={mealType} className="grid grid-cols-7 gap-2">
                  {Object.values(selectedTemplate.meals)
                    .slice(0, 7)
                    .map((dayMeals, dayIndex) => {
                      const meals = dayMeals[mealType as keyof typeof dayMeals];
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-[60px] p-2 bg-white border border-cream-100 rounded-xl"
                        >
                          {meals.length > 0 ? (
                            <div className="space-y-1">
                              {meals.map((dish) => (
                                <div
                                  key={dish.id}
                                  className="text-xs text-primary-600 truncate"
                                  title={dish.name}
                                >
                                  {dish.emoji} {dish.name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-cream-400 text-xs">
                              -
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-6 mt-4 border-t border-cream-200">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedTemplate(null);
                }}
                className="justify-center"
              >
                关闭
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  handleApplyTemplate(selectedTemplate);
                  setShowPreviewModal(false);
                  setSelectedTemplate(null);
                }}
                className="justify-center"
              >
                <Copy size={18} />
                应用到本周
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setTemplateToDelete(null);
        }}
        title="确认删除"
        size="sm"
      >
        <p className="text-primary-600 mb-6">
          确定要删除这个模板吗？删除后无法恢复。
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setShowDeleteConfirm(false);
              setTemplateToDelete(null);
            }}
            className="justify-center"
          >
            取消
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleConfirmDelete}
            className="justify-center"
          >
            <Trash2 size={18} />
            删除
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TemplatesPage;
