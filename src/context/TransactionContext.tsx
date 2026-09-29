import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Transaction, Budget } from '../types';
import { useAuth } from './AuthContext';
import {
  fetchUserTransactions,
  addUserTransaction,
  updateUserTransaction,
  deleteUserTransaction,
  fetchUserBudgets,
  saveUserBudget,
  deleteUserBudget,
} from '../firebase/firestore';
import { getSampleTransactions, getSampleBudgets } from '../utils/demoData';

interface TransactionContextType {
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  savings: number;
  savingsRate: number;
  trendPercentage: number;
  hasTransactions: boolean;
  categoryExpenses: Record<string, number>;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<Transaction>;
  editTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  upsertBudget: (category: string, monthlyLimit: number, budgetId?: string) => Promise<Budget>;
  removeBudget: (id: string) => Promise<void>;
  seedDemoData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [txList, budgetList] = await Promise.all([
        fetchUserTransactions(user.uid),
        fetchUserBudgets(user.uid),
      ]);
      setTransactions(txList);
      setBudgets(budgetList);
    } catch (err: any) {
      console.error('Failed to load transaction data:', err);
      setError('We could not load your transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Financial Calculations
  const { totalIncome, totalExpenses, totalBalance, savings, savingsRate, categoryExpenses, trendPercentage } =
    useMemo(() => {
      let incomeSum = 0;
      let expenseSum = 0;
      const catMap: Record<string, number> = {};

      const now = new Date();
      const current30DaysAgo = new Date();
      current30DaysAgo.setDate(now.getDate() - 30);
      const prior60DaysAgo = new Date();
      prior60DaysAgo.setDate(now.getDate() - 60);

      const current30Str = current30DaysAgo.toISOString().split('T')[0];
      const prior60Str = prior60DaysAgo.toISOString().split('T')[0];

      let recentExpenses = 0;
      let priorExpenses = 0;

      transactions.forEach((tx) => {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') {
          incomeSum += amt;
        } else {
          expenseSum += amt;
          catMap[tx.category] = (catMap[tx.category] || 0) + amt;

          if (tx.date >= current30Str) {
            recentExpenses += amt;
          } else if (tx.date >= prior60Str && tx.date < current30Str) {
            priorExpenses += amt;
          }
        }
      });

      const bal = incomeSum - expenseSum;
      const sv = incomeSum - expenseSum;
      const svRate = incomeSum > 0 ? (sv / incomeSum) * 100 : 0;

      // Real dynamic trend calculation comparing this period vs prior period
      let trend = 0;
      if (priorExpenses > 0) {
        trend = ((recentExpenses - priorExpenses) / priorExpenses) * 100;
      }

      return {
        totalIncome: incomeSum,
        totalExpenses: expenseSum,
        totalBalance: bal,
        savings: sv,
        savingsRate: svRate,
        categoryExpenses: catMap,
        trendPercentage: trend,
      };
    }, [transactions]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    const newTx = await addUserTransaction({
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    });
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const editTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) throw new Error('User not authenticated');
    await updateUserTransaction(id, user.uid, updates);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const removeTransaction = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    await deleteUserTransaction(id, user.uid);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const upsertBudget = async (category: string, monthlyLimit: number, budgetId?: string) => {
    if (!user) throw new Error('User not authenticated');
    const saved = await saveUserBudget(user.uid, category, monthlyLimit, budgetId);
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.id === saved.id || b.category === category);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    return saved;
  };

  const removeBudget = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    await deleteUserBudget(id, user.uid);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const seedDemoData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const samples = getSampleTransactions(user.uid);
      const budgetSamples = getSampleBudgets(user.uid);

      for (const sample of samples) {
        await addUserTransaction(sample);
      }
      for (const b of budgetSamples) {
        await saveUserBudget(user.uid, b.category, b.monthlyLimit);
      }
      await loadData();
    } catch (err) {
      console.error('Failed to seed demo data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        budgets,
        loading,
        error,
        totalIncome,
        totalExpenses,
        totalBalance,
        savings,
        savingsRate,
        trendPercentage,
        hasTransactions: transactions.length > 0,
        categoryExpenses,
        addTransaction,
        editTransaction,
        removeTransaction,
        upsertBudget,
        removeBudget,
        seedDemoData,
        refreshData: loadData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export function useTransactions(): TransactionContextType {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
