import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useToast } from '../context/ToastContext';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionCard } from '../components/transactions/TransactionCard';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonRow } from '../components/common/LoadingSkeleton';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Search, Plus, Download, SlidersHorizontal } from 'lucide-react';

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export const TransactionsPage: React.FC = () => {
  const { transactions, loading, editTransaction, removeTransaction, addTransaction } =
    useTransactions();
  const { showToast } = useToast();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const allCategories = useMemo(() => {
    return Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));
  }, []);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t: Transaction) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchDesc) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        return true;
      })
      .sort((a: Transaction, b: Transaction) => {
        if (sortOption === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortOption === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortOption === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortOption === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, sortOption]);

  const handleSaveTransaction = async (data: any) => {
    if (editingTransaction) {
      await editTransaction(editingTransaction.id, data);
      showToast('Transaction updated successfully.', 'success');
    } else {
      await addTransaction(data);
      showToast('Transaction added successfully.', 'success');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;
    await removeTransaction(deletingTransaction.id);
    showToast('Transaction deleted successfully.', 'success');
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export.', 'info');
      return;
    }

    const headers = ['Title', 'Type', 'Category', 'Amount', 'Date', 'Description'];
    const rows = filteredTransactions.map((t: Transaction) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount,
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spendly_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary light:text-slate-500 mt-0.5">
            Manage, search, and audit your financial records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
            disabled={filteredTransactions.length === 0}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="w-full sm:flex-1">
            <Input
              placeholder="Search by title, category, or notes..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Mobile Filter Toggle */}
          <div className="w-full sm:w-auto flex sm:hidden justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              className="w-full"
            >
              {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Desktop Filter Controls */}
          <div className="hidden sm:flex items-center gap-3 w-auto shrink-0">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-xl bg-card-dark dark:bg-card-dark light:bg-white text-text-primary dark:text-text-primary light:text-slate-900 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-xs py-2.5 px-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent-primary cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl bg-card-dark dark:bg-card-dark light:bg-white text-text-primary dark:text-text-primary light:text-slate-900 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-xs py-2.5 px-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent-primary cursor-pointer max-w-[150px]"
            >
              <option value="all">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="rounded-xl bg-card-dark dark:bg-card-dark light:bg-white text-text-primary dark:text-text-primary light:text-slate-900 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-xs py-2.5 px-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent-primary cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Mobile Filters Collapsible Panel */}
        {showFiltersMobile && (
          <div className="grid grid-cols-1 gap-2 pt-3 border-t border-spendlyBorder-dark/40 dark:border-spendlyBorder-dark/40 light:border-slate-100 sm:hidden">
            <Select
              label="Transaction Type"
              value={typeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'expense', label: 'Expenses Only' },
                { value: 'income', label: 'Income Only' },
              ]}
            />

            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...allCategories.map((c) => ({ value: c, label: c })),
              ]}
            />

            <Select
              label="Sort Order"
              value={sortOption}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOption(e.target.value as SortOption)}
              options={[
                { value: 'date_desc', label: 'Newest First' },
                { value: 'date_asc', label: 'Oldest First' },
                { value: 'amount_desc', label: 'Highest Amount' },
                { value: 'amount_asc', label: 'Lowest Amount' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Transactions Display */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          title={transactions.length === 0 ? 'No transactions logged yet' : 'No matching transactions'}
          description={
            transactions.length === 0
              ? 'Start by creating your first income or expense transaction to see it listed here.'
              : 'Try adjusting your search keywords or filter criteria.'
          }
          actionLabel="Add Transaction"
          onAction={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          secondaryActionLabel={transactions.length > 0 ? 'Clear Filters' : undefined}
          onSecondaryAction={() => {
            setSearchQuery('');
            setTypeFilter('all');
            setCategoryFilter('all');
          }}
        />
      ) : (
        <>
          {/* Desktop & Tablet Table (Hidden on small mobile) */}
          <div className="hidden sm:block">
            <TransactionTable
              transactions={filteredTransactions}
              onEdit={(tx: Transaction) => setEditingTransaction(tx)}
              onDelete={(tx: Transaction) => setDeletingTransaction(tx)}
            />
          </div>

          {/* Mobile Cards View (Visible on small mobile < 640px) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredTransactions.map((tx: Transaction) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onEdit={(item: Transaction) => setEditingTransaction(item)}
                onDelete={(item: Transaction) => setDeletingTransaction(item)}
              />
            ))}
          </div>

          <div className="text-right text-xs text-text-secondary pr-2">
            Showing {filteredTransactions.length} of {transactions.length} transaction
            {transactions.length === 1 ? '' : 's'}
          </div>
        </>
      )}

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen || Boolean(editingTransaction)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this transaction?"
        message={`Are you sure you want to permanently delete "${deletingTransaction?.title}"? This cannot be undone.`}
      />
    </div>
  );
};
