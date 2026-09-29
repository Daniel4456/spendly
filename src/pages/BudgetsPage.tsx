import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Budget } from '../types';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';
import { Plus, PieChart } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { budgets, categoryExpenses, loading, upsertBudget, removeBudget } = useTransactions();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const currency = profile?.currency || 'NGN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  // Overall budget metrics
  const totalBudgeted = budgets.reduce((acc, b) => acc + (Number(b.monthlyLimit) || 0), 0);
  const totalSpentInBudgetedCategories = budgets.reduce(
    (acc, b) => acc + (categoryExpenses[b.category] || 0),
    0
  );
  const overallPercentage =
    totalBudgeted > 0 ? (totalSpentInBudgetedCategories / totalBudgeted) * 100 : 0;

  const handleSaveBudget = async (category: string, monthlyLimit: number, budgetId?: string) => {
    await upsertBudget(category, monthlyLimit, budgetId);
    showToast(budgetId ? 'Budget updated successfully.' : 'Budget created successfully.', 'success');
  };

  const handleConfirmDelete = async () => {
    if (!deletingBudget) return;
    await removeBudget(deletingBudget.id);
    showToast('Budget removed.', 'info');
  };

  const handleAddDefaultBudgets = async () => {
    const defaults = [
      { category: 'Food', limit: 60000 },
      { category: 'Transport', limit: 30000 },
      { category: 'Bills', limit: 40000 },
      { category: 'Entertainment', limit: 20000 },
    ];
    for (const d of defaults) {
      await upsertBudget(d.category, d.limit);
    }
    showToast('Default category budgets created!', 'success');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
            Monthly Budgets
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary light:text-slate-500 mt-0.5">
            Set spending limits to keep your finances balanced
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Budget
        </Button>
      </div>

      {/* Overall Budget Status Banner */}
      {budgets.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-card-dark to-card-elevated dark:from-card-dark dark:to-card-elevated light:from-white light:to-slate-50 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-text-secondary dark:text-text-secondary light:text-slate-500 tracking-wider">
              Total Budget Utilization
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900">
                {formatCurrency(totalSpentInBudgetedCategories, currency)}
              </span>
              <span className="text-sm font-medium text-text-secondary">
                of {formatCurrency(totalBudgeted, currency)}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Across {budgets.length} active categor{budgets.length === 1 ? 'y' : 'ies'} this month
            </p>
          </div>

          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-secondary">Used</span>
              <span
                className={
                  overallPercentage > 100
                    ? 'text-financial-expense'
                    : overallPercentage > 80
                    ? 'text-financial-warning'
                    : 'text-financial-income'
                }
              >
                {overallPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 dark:bg-white/10 light:bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage > 100
                    ? 'bg-financial-expense'
                    : overallPercentage > 80
                    ? 'bg-financial-warning'
                    : 'bg-financial-income'
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No category budgets created yet"
          description="Setting a monthly spending limit helps you track progress and prevents overspending."
          actionLabel="Create Budget"
          onAction={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          secondaryActionLabel="Set Recommended Budgets"
          onSecondaryAction={handleAddDefaultBudgets}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              spent={categoryExpenses[b.category] || 0}
              onEdit={(item) => setEditingBudget(item)}
              onDelete={(item) => setDeletingBudget(item)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen || Boolean(editingBudget)}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        initialBudget={editingBudget}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingBudget)}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleConfirmDelete}
        title="Remove category budget?"
        message={`Are you sure you want to delete your budget for ${deletingBudget?.category}? This will not delete your past transactions.`}
      />
    </div>
  );
};
