import React from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, LucideIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';

interface StatCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'savings';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon: Icon, variant, subtitle }) => {
  const { profile } = useAuth();
  const currency = profile?.currency || 'NGN';

  const isSavings = variant === 'savings';
  const isPositiveSavings = isSavings && amount >= 0;

  const getVariantStyles = () => {
    switch (variant) {
      case 'income':
        return {
          iconBg: 'bg-financial-income-bg text-financial-income',
          amountColor: 'text-financial-income',
          borderHover: 'hover:border-financial-income/40',
        };
      case 'expense':
        return {
          iconBg: 'bg-financial-expense-bg text-financial-expense',
          amountColor: 'text-financial-expense',
          borderHover: 'hover:border-financial-expense/40',
        };
      case 'savings':
        return {
          iconBg: isPositiveSavings
            ? 'bg-accent-primary/15 text-accent-primary'
            : 'bg-financial-expense-bg text-financial-expense',
          amountColor: isPositiveSavings ? 'text-accent-primary' : 'text-financial-expense',
          borderHover: isPositiveSavings
            ? 'hover:border-accent-primary/40'
            : 'hover:border-financial-expense/40',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`rounded-2xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${styles.borderHover}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-secondary dark:text-text-secondary light:text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className={`text-xl sm:text-2xl font-bold tracking-tight truncate ${styles.amountColor}`}>
          {formatCurrency(amount, currency)}
        </div>
        {subtitle && (
          <p className="text-[11px] text-text-secondary dark:text-text-secondary light:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export const SummaryCards: React.FC = () => {
  const { totalIncome, totalExpenses, savings, savingsRate } = useTransactions();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Income"
        amount={totalIncome}
        icon={ArrowDownLeft}
        variant="income"
        subtitle="All incoming funds"
      />
      <StatCard
        title="Expenses"
        amount={totalExpenses}
        icon={ArrowUpRight}
        variant="expense"
        subtitle="Total cash outflow"
      />
      <StatCard
        title="Savings"
        amount={savings}
        icon={PiggyBank}
        variant="savings"
        subtitle={savings >= 0 ? `${savingsRate.toFixed(1)}% savings rate` : 'Over budget'}
      />
    </div>
  );
};
