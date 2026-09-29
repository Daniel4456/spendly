export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Rent'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investment'
  | 'Gift'
  | 'Other';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  date: string; // ISO Date YYYY-MM-DD
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  createdAt: string;
  updatedAt?: string;
}

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'KES' | 'GHS' | 'ZAR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToNgn: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  currency: CurrencyCode;
  themePreference: 'dark' | 'light' | 'system';
  budgetAlerts: boolean;
  monthlySummaries: boolean;
  createdAt: string;
  avatarColor?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

export type TimeRangeFilter = '7d' | '30d' | '3m' | '1y';
