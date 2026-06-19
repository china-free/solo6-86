import { Plus, Minus, Check } from 'lucide-react';
import type { ShoppingItem } from '@/types';
import { formatAmount } from '@/utils/ingredient';

interface IngredientItemProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onAmountChange?: (id: string, amount: number) => void;
  showControls?: boolean;
}

const IngredientItem = ({ item, onToggle, onAmountChange, showControls = false }: IngredientItemProps) => {
  const handleIncrease = () => {
    if (onAmountChange) {
      onAmountChange(item.ingredientId, Math.round((item.totalAmount + item.totalAmount * 0.1) * 10) / 10);
    }
  };

  const handleDecrease = () => {
    if (onAmountChange && item.totalAmount > 0) {
      onAmountChange(item.ingredientId, Math.round((item.totalAmount - item.totalAmount * 0.1) * 10) / 10);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
        item.checked
          ? 'bg-cream-50 opacity-60'
          : 'bg-white shadow-card hover:shadow-soft'
      }`}
    >
      <button
        onClick={() => onToggle(item.ingredientId)}
        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 btn-press ${
          item.checked
            ? 'bg-primary-500 border-primary-500 text-white'
            : 'border-cream-300 hover:border-primary-400'
        }`}
      >
        {item.checked && (
          <Check size={14} strokeWidth={3} className="animate-bounce-in" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`font-medium transition-all duration-200 ${
            item.checked
              ? 'text-cream-500 line-through'
              : 'text-primary-700'
          }`}
        >
          {item.name}
        </p>
        <p
          className={`text-sm transition-all duration-200 ${
            item.checked
              ? 'text-cream-400'
              : 'text-primary-500'
          }`}
        >
          {formatAmount(item.totalAmount, item.unit)}
          {item.adjusted && (
            <span className="ml-2 text-xs text-warm-600">已调整</span>
          )}
        </p>
      </div>

      {showControls && (
        <div className="flex items-center gap-1">
          <button
            onClick={handleDecrease}
            disabled={item.totalAmount <= 0}
            className="p-1.5 rounded-lg bg-cream-100 text-primary-600 hover:bg-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-press"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={handleIncrease}
            className="p-1.5 rounded-lg bg-cream-100 text-primary-600 hover:bg-cream-200 transition-colors btn-press"
          >
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default IngredientItem;
