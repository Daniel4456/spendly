import React from 'react';
import { Budget } from '../../types';
import { getCategoryMeta } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  spent,
  onEdit,
  onDelete,
}) => {
  const { profile } = useAuth();
  const currency = profile?.currency || 'NGN';

  const meta = getCategoryMeta(budget.category);
  const Icon = meta.icon;

  const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
  const isOverBudget = spent > budget.monthlyLimit;
  const isNearLimit = !isOverBudget && percentage >= 80;

  // Clamped bar width for UI display
  const progressWidth = Math.min(percentage, 100);

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-financial-expense';
    if (isNearLimit) return 'bg-financial-warning';
    return 'bg-financial-income';
  };

  return (
    <div className="rounded-2xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-5 shadow-sm transition-all duration-200 flex flex-col justify-between gap-4">
      {/* Top Header: Category and Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: meta.bgColor,
              borderColor: `${meta.color}30`,
              color: meta.color,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-text-primary light:text-slate-900">
              {budget.category}
            </h4>
            <span className="text-[11px] text-text-secondary dark:text-text-secondary light:text-slate-500">
              Monthly Budget
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="p-1.5 text-text-secondary hover:text-accent-primary hover:bg-white/5 rounded-lg transition-colors"
            aria-label={`Edit ${budget.category} budget`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget)}
            className="p-1.5 text-text-secondary hover:text-financial-expense hover:bg-financial-expense/10 rounded-lg transition-colors"
            aria-label={`Delete ${budget.category} budget`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Numbers */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900">
            {formatCurrency(spent, currency)}{' '}
            <span className="font-normal text-text-secondary">
              / {formatCurrency(budget.monthlyLimit, currency)}
            </span>
          </span>
          <span
            className={`font-bold ${
              isOverBudget
                ? 'text-financial-expense'
                : isNearLimit
                ? 'text-financial-warning'
                : 'text-text-secondary'
            }`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2 rounded-full bg-white/10 dark:bg-white/10 light:bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Status Warning / Safe Footer */}
      <div>
        {isOverBudget ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-financial-expense/10 border border-financial-expense/20 text-financial-expense text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Exceeded by {formatCurrency(spent - budget.monthlyLimit, currency)}</span>
          </div>
        ) : isNearLimit ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-financial-warning/10 border border-financial-warning/20 text-financial-warning text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Close to budget limit ({formatCurrency(budget.monthlyLimit - spent, currency)} left)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-financial-income font-medium px-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>On track ({formatCurrency(budget.monthlyLimit - spent, currency)} remaining)</span>
          </div>
        )}
      </div>
    </div>
  );
};
