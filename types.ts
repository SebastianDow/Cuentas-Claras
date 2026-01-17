export type Language = 'es' | 'en' | 'fr' | 'pt';
export type Currency = 'USD' | 'EUR' | 'COP' | 'MXN' | 'GBP';
export type Theme = 'light' | 'dark' | 'system';

export type TransactionType = 'expense' | 'income' | 'transfer';
export type AccountType = 'cash' | 'savings' | 'checking' | 'credit_card' | 'investment';

export interface NotificationSettings {
  lowBalance: boolean;
  debtReminders: boolean;
  goalMilestones: boolean;
  lowBalanceThreshold: number;
}

export interface UserSettings {
  name: string;
  theme: Theme;
  currency: Currency;
  language: Language;
  hasOnboarded: boolean;
  notifications: NotificationSettings;
}

export interface Category {
  id: string;
  key: string; // Translation key
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  icon?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  category: string; // Category key
  accountId: string; // Source account
  toAccountId?: string; // For transfers
  date: string; // ISO String
  title: string;
  description?: string;
  isRecurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline?: string;
  isCompleted: boolean;
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  currency: Currency;
  type: 'owes_me' | 'i_owe';
  dueDate?: string;
  description?: string;
}

export interface ExchangeRates {
  [key: string]: number; // Base USD
}
