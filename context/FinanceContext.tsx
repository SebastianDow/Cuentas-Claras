import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSettings, Account, Transaction, Goal, Debt, Currency, Language, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import { convertCurrency } from '../services/financeService';

export interface Alert {
  id: string;
  type: 'low_balance' | 'debt_due' | 'goal_milestone';
  messageKey: string;
  data?: string;
}

interface FinanceContextProps {
  settings: UserSettings;
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  categories: Category[];
  alerts: Alert[];
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  
  addTransaction: (transaction: Transaction) => void;
  
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

  addDebt: (debt: Debt) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;

  dismissAlert: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  name: '',
  theme: 'system',
  currency: 'USD',
  language: 'es',
  hasOnboarded: false,
  notifications: {
    lowBalance: true,
    debtReminders: true,
    goalMilestones: true,
    lowBalanceThreshold: 100,
  }
};

const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', name: 'Efectivo', type: 'cash', balance: 500, currency: 'USD' },
  { id: '2', name: 'Banco', type: 'checking', balance: 1200, currency: 'USD' },
];

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('cc_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Ensure notification settings exist if upgrading from older version
  useEffect(() => {
    if (!settings.notifications) {
        setSettings(prev => ({
            ...prev,
            notifications: DEFAULT_SETTINGS.notifications
        }));
    }
  }, [settings]);

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('cc_accounts');
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cc_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('cc_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('cc_debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Persistence
  useEffect(() => localStorage.setItem('cc_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('cc_accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('cc_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('cc_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('cc_debts', JSON.stringify(debts)), [debts]);

  // Theme Handling
  useEffect(() => {
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Notification Logic
  useEffect(() => {
    if (!settings.notifications) return;
    
    const newAlerts: Alert[] = [];

    // Low Balance Check
    if (settings.notifications.lowBalance) {
        const totalBalance = accounts.reduce((sum, acc) => 
            sum + convertCurrency(acc.balance, acc.currency, settings.currency), 0
        );
        if (totalBalance < settings.notifications.lowBalanceThreshold) {
            newAlerts.push({ id: 'low_balance', type: 'low_balance', messageKey: 'alert_low_balance' });
        }
    }

    // Debt Due Check (Mock check for dates within 3 days)
    if (settings.notifications.debtReminders) {
        debts.forEach(d => {
            if (d.type === 'i_owe' && d.dueDate) {
                // Simplified date check logic for demo
                const due = new Date(d.dueDate);
                const now = new Date();
                const diffTime = due.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 3) {
                    newAlerts.push({ id: `debt_${d.id}`, type: 'debt_due', messageKey: 'alert_debt_due', data: d.personName });
                }
            }
        });
    }

    // Goal Milestones
    if (settings.notifications.goalMilestones) {
        goals.forEach(g => {
            if (g.targetAmount > 0) {
                const percentage = (g.currentAmount / g.targetAmount);
                if (percentage >= 1 && !g.isCompleted) {
                    newAlerts.push({ id: `goal_${g.id}`, type: 'goal_milestone', messageKey: 'alert_goal_milestone', data: g.name });
                }
            }
        });
    }

    setAlerts(newAlerts);
  }, [settings, accounts, debts, goals]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // --- Account Methods ---
  const addAccount = (account: Account) => {
    setAccounts(prev => [...prev, account]);
  };

  const updateAccount = (account: Account) => {
    setAccounts(prev => prev.map(a => a.id === account.id ? account : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // --- Transaction Methods ---
  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    
    // Check if the transaction is targeted at a Goal (for Income)
    const isGoal = goals.some(g => g.id === transaction.accountId);

    if (isGoal) {
        // Update Goal
        setGoals(prev => prev.map(g => {
            if (g.id === transaction.accountId) {
                return { ...g, currentAmount: g.currentAmount + transaction.amount };
            }
            return g;
        }));
    } else {
        // Update Account
        setAccounts(prev => prev.map(acc => {
          if (acc.id === transaction.accountId) {
            const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
            return { ...acc, balance: acc.balance + amount };
          }
          return acc;
        }));
    }
  };

  // --- Goal Methods ---
  const addGoal = (goal: Goal) => setGoals(prev => [...prev, goal]);
  
  const updateGoal = (goal: Goal) => {
      setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  };
  
  const deleteGoal = (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id));
  };

  // --- Debt Methods ---
  const addDebt = (debt: Debt) => setDebts(prev => [...prev, debt]);
  
  const updateDebt = (debt: Debt) => {
      setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
  };

  const deleteDebt = (id: string) => {
      setDebts(prev => prev.filter(d => d.id !== id));
  };

  const dismissAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <FinanceContext.Provider value={{
      settings, accounts, transactions, goals, debts, categories, alerts,
      updateSettings, 
      addAccount, updateAccount, deleteAccount, 
      addTransaction, 
      addGoal, updateGoal, deleteGoal,
      addDebt, updateDebt, deleteDebt,
      dismissAlert
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
