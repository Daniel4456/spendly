import { Transaction, Budget } from '../types';

export function getSampleTransactions(userId: string): Omit<Transaction, 'id'>[] {
  const today = new Date();
  
  const formatDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(today.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return [
    {
      userId,
      type: 'income',
      title: 'Monthly Salary',
      amount: 450000,
      category: 'Salary',
      date: formatDate(1),
      description: 'Main tech salary payment',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'Apartment Rent',
      amount: 120000,
      category: 'Rent',
      date: formatDate(2),
      description: 'Monthly apartment lease',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'Supermarket Groceries',
      amount: 32500,
      category: 'Food',
      date: formatDate(3),
      description: 'Weekly grocery shopping at Shoprite',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'income',
      title: 'UI Design Freelance Project',
      amount: 85000,
      category: 'Freelance',
      date: formatDate(5),
      description: 'Mobile app design deliverables',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'Electricity & Internet Bill',
      amount: 24000,
      category: 'Bills',
      date: formatDate(6),
      description: 'Fiber optics & power bill',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'Fuel & Car Maintenance',
      amount: 18500,
      category: 'Transport',
      date: formatDate(8),
      description: 'Vehicle refueling and oil check',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'Dining with Friends',
      amount: 14200,
      category: 'Food',
      date: formatDate(10),
      description: 'Weekend dinner at Cactus',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'Cinema & Streaming Subscription',
      amount: 8500,
      category: 'Entertainment',
      date: formatDate(12),
      description: 'Movie tickets and Netflix subscription',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'Gym Membership & Pharmacy',
      amount: 16000,
      category: 'Health',
      date: formatDate(15),
      description: 'Monthly fitness pass and multivitamins',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'Online Course Subscription',
      amount: 12500,
      category: 'Education',
      date: formatDate(18),
      description: 'Frontend architectural patterns masterclass',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'income',
      title: 'Investment Dividend',
      amount: 35000,
      category: 'Investment',
      date: formatDate(22),
      description: 'Quarterly mutual fund return',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      type: 'expense',
      title: 'New Wireless Headphones',
      amount: 28000,
      category: 'Shopping',
      date: formatDate(25),
      description: 'Noise-cancelling work headphones',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getSampleBudgets(userId: string): Omit<Budget, 'id'>[] {
  return [
    {
      userId,
      category: 'Food',
      monthlyLimit: 60000,
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      category: 'Transport',
      monthlyLimit: 30000,
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      category: 'Bills',
      monthlyLimit: 35000,
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      category: 'Entertainment',
      monthlyLimit: 20000,
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      category: 'Shopping',
      monthlyLimit: 35000,
      createdAt: new Date().toISOString(),
    },
  ];
}
