import React from 'react';
import { Transaction } from '../../types';
import { getCategoryMeta } from '../../utils/categories';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const { profile } = useAuth();
  const currency = profile?.currency || 'NGN';

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 bg-card-dark dark:bg-card-dark light:bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-spendlyBorder-dark/80 dark:border-spendlyBorder-dark/80 light:border-slate-100 text-[11px] uppercase tracking-wider text-text-secondary bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-50/70">
              <th className="py-3.5 px-4 font-semibold">Transaction</th>
              <th className="py-3.5 px-4 font-semibold">Category</th>
              <th className="py-3.5 px-4 font-semibold">Date</th>
              <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
              <th className="py-3.5 px-4 font-semibold text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-spendlyBorder-dark/40 dark:divide-spendlyBorder-dark/40 light:divide-slate-100 text-xs">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const meta = getCategoryMeta(tx.category);
              const Icon = meta.icon;

              return (
                <tr
                  key={tx.id}
                  className="hover:bg-white/[0.02] dark:hover:bg-white/[0.02] light:hover:bg-slate-50 transition-colors group"
                >
                  {/* Transaction Title & Description */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: meta.bgColor,
                          borderColor: `${meta.color}30`,
                          color: meta.color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="max-w-xs">
                        <p className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900 truncate">
                          {tx.title}
                        </p>
                        {tx.description && (
                          <p className="text-[11px] text-text-secondary dark:text-text-secondary light:text-slate-500 truncate mt-0.5">
                            {tx.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category Pill */}
                  <td className="py-3.5 px-4">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                      style={{
                        backgroundColor: meta.bgColor,
                        borderColor: `${meta.color}40`,
                        color: meta.color,
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-text-secondary dark:text-text-secondary light:text-slate-600">
                    {formatDate(tx.date)}
                  </td>

                  {/* Amount with +/- indicator */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-bold text-sm ${
                        isIncome ? 'text-financial-income' : 'text-financial-expense'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </td>

                  {/* Edit and Delete Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                        aria-label={`Edit ${tx.title}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tx)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-financial-expense hover:bg-financial-expense/10 transition-colors"
                        aria-label={`Delete ${tx.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
