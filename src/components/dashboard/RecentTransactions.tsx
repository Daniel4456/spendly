import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { getCategoryMeta } from '../../utils/categories';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';

interface RecentTransactionsProps {
  onAddTransaction: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onAddTransaction }) => {
  const { transactions } = useTransactions();
  const { profile } = useAuth();
  const currency = profile?.currency || 'NGN';

  const recentList = transactions.slice(0, 6);

  return (
    <div className="rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-5 sm:p-6 shadow-sm">
      {/* Header with Title and 'View All' */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary dark:text-text-primary light:text-slate-900">
            Recent Transactions
          </h3>
          <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-0.5">
            Your most recent financial movements
          </p>
        </div>

        {transactions.length > 0 && (
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary hover:text-accent-primary-hover transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Transaction List or Empty State */}
      {transactions.length === 0 ? (
        <EmptyState
          title="Your financial journey starts here."
          description="Add your first transaction to begin tracking your money and budgeting with Spendly."
          actionLabel="Add Transaction"
          onAction={onAddTransaction}
        />
      ) : (
        <div className="divide-y divide-spendlyBorder-dark/40 dark:divide-spendlyBorder-dark/40 light:divide-slate-100">
          {recentList.map((tx) => {
            const isIncome = tx.type === 'income';
            const meta = getCategoryMeta(tx.category);
            const Icon = meta.icon;

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] dark:hover:bg-white/[0.02] light:hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
              >
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
                    <p className="text-sm font-semibold text-text-primary dark:text-text-primary light:text-slate-900 truncate">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-0.5">
                      <span className="font-medium">{tx.category}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <span
                    className={`text-sm sm:text-base font-bold flex items-center gap-0.5 ${
                      isIncome ? 'text-financial-income' : 'text-financial-expense'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
