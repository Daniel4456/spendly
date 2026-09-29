import { TransactionType, CurrencyCode } from './index';

export type AiSender = 'user' | 'assistant';

export interface TransactionActionPayload {
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  date: string;
  description?: string;
}

export interface BudgetActionPayload {
  category: string;
  monthlyLimit: number;
}

export interface FinancialSummaryPayload {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  topCategory: string;
  topCategoryAmount: number;
}

export type ActionCardType = 'create_transaction' | 'upsert_budget' | 'financial_summary';

export interface ActionCard {
  type: ActionCardType;
  payload: TransactionActionPayload | BudgetActionPayload | FinancialSummaryPayload;
  status: 'pending' | 'applied' | 'cancelled';
  executedMessage?: string;
}

export interface ChatMessage {
  id: string;
  sender: AiSender;
  text: string;
  timestamp: string;
  actionCard?: ActionCard;
  isStreaming?: boolean;
}

export interface AiSettings {
  engine: 'local' | 'gemini';
  geminiApiKey?: string;
  geminiModel?: string; // 'gemini-1.5-flash' | 'gemini-2.0-flash'
  voiceEnabled: boolean;
}

export interface QuickPrompt {
  id: string;
  title: string;
  prompt: string;
  iconName: string;
  badge?: string;
}
