import React from 'react';
import { getGreeting } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useToast } from '../context/ToastContext';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { SummaryCards } from '../components/dashboard/SummaryCard';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { SkeletonCard, SkeletonChart } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { Sparkles, Database, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';

export const DashboardPage: React.FC = () => {
  const { profile, user, isFirebase } = useAuth();
  const { loading, error, refreshData, transactions, seedDemoData } = useTransactions();
  const { showToast } = useToast();

  const displayName = profile?.displayName || user?.displayName || 'there';
  const greeting = getGreeting(displayName);

  const handleSeedDemo = async () => {
    await seedDemoData();
    showToast('Sample financial data loaded successfully!', 'success');
  };

  const triggerAddTransactionModal = () => {
    const addBtn = document.querySelector('button[title="Add Transaction"]') as HTMLButtonElement;
    if (addBtn) {
      addBtn.click();
    } else {
      // Fallback: click mobile add button
      const mobileAddBtn = document.querySelector('button[aria-label="Add transaction"]') as HTMLButtonElement;
      if (mobileAddBtn) mobileAddBtn.click();
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-white/5 dark:bg-white/5 light:bg-slate-200 rounded-2xl w-72" />
        <SkeletonCard className="h-56" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart height="h-72" />
          <SkeletonChart height="h-72" />
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return <ErrorState message={error} onRetry={refreshData} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
            {greeting.greeting}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary light:text-slate-500 mt-1">
            {greeting.subtext}
          </p>
        </div>

        {transactions.length === 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeedDemo}
            leftIcon={<Sparkles className="w-4 h-4 text-accent-primary" />}
          >
            Load Sample Data
          </Button>
        )}
      </div>

      {/* First-Time User Welcome Banner (Section 48) */}
      {transactions.length === 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-primary/20 via-[#18233C] to-financial-income/10 dark:from-accent-primary/20 dark:via-[#18233C] dark:to-financial-income/10 light:from-indigo-50 light:via-white light:to-emerald-50 border border-accent-primary/30 p-6 sm:p-8 animate-slide-up shadow-glow-primary">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
              <Sparkles className="w-3.5 h-3.5" /> First-time User Experience
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
              Welcome to Spendly, {displayName}!
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary light:text-slate-600 leading-relaxed">
              “Take control of your money.” Let’s start tracking your finances by logging your first transaction, or explore the pre-built demo data.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={triggerAddTransactionModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Your First Transaction
              </Button>
              <Button
                variant="secondary"
                onClick={handleSeedDemo}
                leftIcon={<Sparkles className="w-4 h-4 text-accent-primary" />}
              >
                Load Sample Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Sync / Local storage info pill if not configured in .env */}
      {!isFirebase && (
        <div className="p-3.5 rounded-2xl bg-card-dark dark:bg-card-dark light:bg-amber-50 border border-financial-info/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-text-secondary dark:text-text-secondary light:text-slate-700">
            <Database className="w-4 h-4 text-financial-info shrink-0" />
            <span>
              Spendly is running in <strong>Local Storage Mode</strong>. To connect your cloud database, set your Firebase credentials in <code className="text-accent-primary bg-white/5 px-1 py-0.5 rounded">.env</code>.
            </span>
          </div>
        </div>
      )}

      {/* Large Premium Balance Card */}
      <BalanceCard />

      {/* Three Responsive Summary Cards */}
      <SummaryCards />

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        <div className="lg:col-span-7 min-w-0">
          <SpendingChart />
        </div>
        <div className="lg:col-span-5 min-w-0">
          <CategoryChart />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <RecentTransactions onAddTransaction={triggerAddTransactionModal} />
    </div>
  );
};
