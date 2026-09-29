import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';

export const BalanceCard: React.FC = () => {
  const { profile } = useAuth();
  const { totalBalance, totalIncome, totalExpenses, trendPercentage } = useTransactions();
  const currency = profile?.currency || 'NGN';

  const isTrendPositive = trendPercentage <= 0; // Less expenses or positive is good in financial contexts

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#151D32] via-[#18233C] to-[#121A2E] dark:from-[#151D32] dark:via-[#18233C] dark:to-[#121A2E] light:from-white light:via-slate-50 light:to-slate-100 border border-spendlyBorder-dark/80 dark:border-spendlyBorder-dark/80 light:border-slate-200 p-6 sm:p-8 shadow-card-dark dark:shadow-card-dark light:shadow-card-light transition-all duration-300">
      {/* Subtle background decorative shapes */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-financial-income/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between gap-6">
        {/* Card Header & Dynamic Trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-primary/15 border border-accent-primary/30 flex items-center justify-center text-accent-primary shadow-glow-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-text-secondary dark:text-text-secondary light:text-slate-500">
                Total Balance
              </span>
              <p className="text-[11px] text-text-secondary/70">Net Available Funds</p>
            </div>
          </div>

          {/* Dynamic 30-day expense change badge */}
          {trendPercentage !== 0 && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isTrendPositive
                  ? 'bg-financial-income-bg text-financial-income border-financial-income/30'
                  : 'bg-financial-expense-bg text-financial-expense border-financial-expense/30'
              }`}
            >
              {isTrendPositive ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              <span>{formatPercentage(Math.abs(trendPercentage))} vs prior month</span>
            </div>
          )}
        </div>

        {/* Big Balance Amount */}
        <div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
              totalBalance >= 0
                ? 'text-text-primary dark:text-text-primary light:text-slate-900'
                : 'text-financial-expense'
            }`}
          >
            {formatCurrency(totalBalance, currency)}
          </h2>
        </div>

        {/* Income & Expense Breakdown Sub-Bar */}
        <div className="pt-4 border-t border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-financial-income-bg flex items-center justify-center text-financial-income shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-medium text-text-secondary dark:text-text-secondary light:text-slate-500">
                Total Income
              </p>
              <p className="text-sm sm:text-base font-bold text-financial-income truncate">
                {formatCurrency(totalIncome, currency)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-financial-expense-bg flex items-center justify-center text-financial-expense shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-medium text-text-secondary dark:text-text-secondary light:text-slate-500">
                Total Expenses
              </p>
              <p className="text-sm sm:text-base font-bold text-financial-expense truncate">
                {formatCurrency(totalExpenses, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
