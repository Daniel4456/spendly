import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Budget } from '../../types';
import { EXPENSE_CATEGORIES } from '../../utils/categories';
import { useAuth } from '../../context/AuthContext';
import { CURRENCIES } from '../../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: string, monthlyLimit: number, budgetId?: string) => Promise<void>;
  initialBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBudget,
}) => {
  const { profile } = useAuth();
  const currencySymbol = CURRENCIES[profile?.currency || 'NGN']?.symbol || '₦';

  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBudget) {
      setCategory(initialBudget.category);
      setMonthlyLimit(String(initialBudget.monthlyLimit));
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
      setMonthlyLimit('');
    }
    setError(null);
  }, [initialBudget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const limitNum = parseFloat(monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Please enter a valid monthly budget amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await onSave(category, limitNum, initialBudget?.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBudget ? 'Edit Category Budget' : 'Create Category Budget'}
      description="Set a monthly spending limit to maintain financial discipline."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Category *"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          disabled={Boolean(initialBudget)} // when editing, category is fixed
          required
        />

        <Input
          label={`Monthly Budget Limit (${currencySymbol}) *`}
          type="number"
          step="1"
          min="1"
          placeholder="e.g. 50000"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          required
        />

        {error && (
          <div className="p-3 rounded-xl bg-financial-expense/10 border border-financial-expense/30 text-financial-expense text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} size="sm">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} size="sm">
            {initialBudget ? 'Update Budget' : 'Save Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
