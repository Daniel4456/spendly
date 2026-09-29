import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Transaction, TransactionType } from '../../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/categories';
import { getTodayDateString } from '../../utils/dateUtils';
import { validateTransactionInput } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import { CURRENCIES } from '../../utils/formatters';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    title: string;
    amount: number;
    category: string;
    date: string;
    description?: string;
  }) => Promise<void>;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { profile } = useAuth();
  const currencySymbol = CURRENCIES[profile?.currency || 'NGN']?.symbol || '₦';

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form when opening or editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(getTodayDateString());
      setDescription('');
    }
    setValidationError(null);
  }, [initialData, isOpen]);

  // Adjust default category when type toggles
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  };

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = validateTransactionInput({
      title,
      amount,
      category,
      date,
    });

    if (!validation.isValid) {
      setValidationError(validation.error || 'Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        type,
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        date,
        description: description.trim() ? description.trim() : undefined,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Add Transaction'}
      description="Track your money by logging this financial activity."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle Selector: Expense vs Income */}
        <div className="flex rounded-xl bg-background-dark/80 dark:bg-background-dark/80 light:bg-slate-100 p-1 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              type === 'expense'
                ? 'bg-financial-expense text-white shadow-glow-expense'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              type === 'income'
                ? 'bg-financial-income text-white shadow-glow-income'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        {/* Amount Input */}
        <Input
          label={`Amount (${currencySymbol}) *`}
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        {/* Title Input */}
        <Input
          label="Title *"
          type="text"
          placeholder={type === 'expense' ? 'e.g. Lunch with team, Groceries' : 'e.g. Monthly Salary, Freelance project'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={currentCategories.map((c) => ({ value: c, label: c }))}
            required
          />

          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Optional Description */}
        <div className="text-left">
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary light:text-slate-700 mb-1.5">
            Optional Description
          </label>
          <textarea
            rows={2}
            className="w-full rounded-xl bg-card-dark dark:bg-card-dark light:bg-white text-text-primary dark:text-text-primary light:text-slate-900 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary placeholder:text-text-secondary/50 resize-none transition-all duration-200"
            placeholder="Add any extra notes or details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 rounded-xl bg-financial-expense/10 border border-financial-expense/30 text-financial-expense text-xs">
            {validationError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
