import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MealTemplate, DayMeals } from '@/types';
import { generateId } from '@/utils/date';

interface TemplateState {
  templates: MealTemplate[];
  addTemplate: (name: string, description: string, category: string, meals: Record<string, DayMeals>, coverEmoji: string) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<MealTemplate>) => void;
  getTemplate: (id: string) => MealTemplate | undefined;
}

const DEFAULT_TEMPLATES: MealTemplate[] = [
  {
    id: 'template-default-1',
    name: '家常周',
    description: '经典家常菜品，营养均衡，适合日常家庭用餐',
    category: '家常',
    coverEmoji: '🍚',
    createdAt: Date.now(),
    meals: {},
  },
  {
    id: 'template-default-2',
    name: '减脂周',
    description: '低卡高蛋白，减脂增肌好帮手',
    category: '健康',
    coverEmoji: '🥗',
    createdAt: Date.now(),
    meals: {},
  },
];

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,

      addTemplate: (name, description, category, meals, coverEmoji) => {
        const newTemplate: MealTemplate = {
          id: generateId(),
          name,
          description,
          category,
          meals,
          coverEmoji,
          createdAt: Date.now(),
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      removeTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id);
      },
    }),
    {
      name: 'meal-templates-storage',
    }
  )
);
