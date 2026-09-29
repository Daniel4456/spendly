import React from 'react';
import { Transaction } from '../../types';
import { getCategoryMeta } from '../../utils/categories';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2 } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const { profile } = useAuth();
  const currency = profile?.currency || 'NGN';
  const isIncome = transaction.type === 'income';
  const meta = getCategoryMeta(transaction.category);
  const Icon = meta.icon;

  return (
    <div className="p-4 rounded-2xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm flex flex-col gap-3">
      {/* Top row: Icon, Title & Amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
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

          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary light:text-slate-900 truncate">
              {transaction.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-0.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="font-medium truncate">{transaction.category}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span
            className={`text-base font-bold tracking-tight block ${
              isIncome ? 'text-financial-income' : 'text-financial-expense'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount, currency)}
          </span>
          <span className="text-[11px] text-text-secondary dark:text-text-secondary light:text-slate-400">
            {formatDate(transaction.date)}
          </span>
        </div>
      </div>

      {/* Description if present */}
      {transaction.description && (
        <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-600 bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-50 p-2 rounded-lg italic">
          "{transaction.description}"
        </p>
      )}

      {/* Action buttons row */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-spendlyBorder-dark/40 dark:border-spendlyBorder-dark/40 light:border-slate-100">
        <button
          type="button"
          onClick={() => onEdit(transaction)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(transaction)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-financial-expense hover:bg-financial-expense/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
