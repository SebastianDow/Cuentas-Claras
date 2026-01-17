

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { UserSettings, Account, Transaction, Goal, Debt, Currency, Language, Category, RecurringRule } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import { convertCurrency, calculateNextDate } from '../services/financeService';
import { v4 as uuidv4 } from 'uuid'; 

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export interface Alert {
  id: string;
  type: 'low_balance' | 'debt_due' | 'goal_milestone' | 'recurring_processed';
  messageKey: string;
  data?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'success' | 'error' | 'info';
}

interface FinanceContextProps {
  settings: UserSettings;
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  categories: Category[];
  recurringRules: RecurringRule[]; 
  alerts: Alert[];
  isPrivacyEnabled: boolean;
  toast: ToastMessage | null; // Toast State

  togglePrivacyMode: () => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;

  updateSettings: (newSettings: Partial<UserSettings>) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  
  addTransaction: (transaction: Transaction, recurringOptions?: Omit<RecurringRule, 'id' | 'template' | 'nextDueDate' | 'active'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  deleteRecurringRule: (id: string) => void;
  
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

  addDebt: (debt: Debt) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;

  dismissAlert: (id: string) => void;
  showToast: (msg: string, actionLabel?: string, onAction?: () => void) => void;
  hideToast: () => void;
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

// Helper to detect language
const detectBrowserLanguage = (): Language => {
    if (typeof navigator === 'undefined') return 'es';
    const lang = navigator.language.split('-')[0];
    if (lang === 'en' || lang === 'fr' || lang === 'pt') return lang as Language;
    return 'es'; 
};

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

const DEFAULT_ACCOUNTS: Account[] = [];

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('cc_settings');
    if (saved) {
        return JSON.parse(saved);
    } else {
        return { ...DEFAULT_SETTINGS, language: detectBrowserLanguage() };
    }
  });

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

  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>(() => {
    const saved = localStorage.getItem('cc_recurring_rules');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persistence
  useEffect(() => localStorage.setItem('cc_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('cc_accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('cc_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('cc_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('cc_debts', JSON.stringify(debts)), [debts]);
  useEffect(() => localStorage.setItem('cc_recurring_rules', JSON.stringify(recurringRules)), [recurringRules]);

  // Theme Handling
  useEffect(() => {
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Toast Helpers
  const showToast = (message: string, actionLabel?: string, onAction?: () => void) => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast({ id: Date.now().toString(), message, actionLabel, onAction });
      toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };
  
  const hideToast = () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast(null);
  };

  // Helper to handle balance updates (Apply or Revert)
  const processTransactionImpact = (transaction: Transaction, revert: boolean = false) => {
      const multiplier = revert ? -1 : 1;

      // 1. Handle Transfers
      if (transaction.type === 'transfer' && transaction.toAccountId) {
          setAccounts(prev => prev.map(acc => {
              if (acc.id === transaction.accountId) {
                  // Source: Subtract (or Add if reverting)
                  return { ...acc, balance: acc.balance - (transaction.amount * multiplier) };
              }
              if (acc.id === transaction.toAccountId) {
                  // Dest: Add (or Subtract if reverting)
                  const convertedAmount = transaction.currency === acc.currency 
                    ? transaction.amount 
                    : convertCurrency(transaction.amount, transaction.currency, acc.currency);
                  return { ...acc, balance: acc.balance + (convertedAmount * multiplier) };
              }
              return acc;
          }));
          return;
      }

      // 2. Handle Goals (Income to Goal)
      const isGoal = goals.some(g => g.id === transaction.accountId);
      if (isGoal) {
          setGoals(prev => prev.map(g => {
              if (g.id === transaction.accountId) {
                  const impact = transaction.type === 'income' ? transaction.amount : -transaction.amount;
                  return { ...g, currentAmount: g.currentAmount + (impact * multiplier) };
              }
              return g;
          }));
      } else {
          // 3. Handle Regular Accounts
          setAccounts(prev => prev.map(acc => {
            if (acc.id === transaction.accountId) {
              const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
              return { ...acc, balance: acc.balance + (amount * multiplier) };
            }
            return acc;
          }));
      }
  };

  // Recurring Transactions Logic
  useEffect(() => {
    const checkRecurring = () => {
      const today = new Date();
      let rulesUpdated = false;
      let newRules = [...recurringRules];
      let newAlertsToAdd: Alert[] = [];

      newRules = newRules.map(rule => {
        if (!rule.active) return rule;

        const dueDate = new Date(rule.nextDueDate);
        if (dueDate <= today) {
           rulesUpdated = true;
           const newTx: Transaction = {
             ...rule.template,
             id: generateId(),
             date: rule.nextDueDate,
             generatedFromRuleId: rule.id
           };
           processTransactionImpact(newTx);
           setTransactions(prev => [newTx, ...prev]);
           if (rule.notify) {
              newAlertsToAdd.push({
                  id: `rec_${newTx.id}`,
                  type: 'recurring_processed',
                  messageKey: 'alert_recurring_processed',
                  data: newTx.title
              });
           }
           return {
             ...rule,
             nextDueDate: calculateNextDate(rule.nextDueDate, rule.frequency)
           };
        }
        return rule;
      });

      if (rulesUpdated) {
        setRecurringRules(newRules);
        if (newAlertsToAdd.length > 0) {
            setAlerts(prev => [...newAlertsToAdd, ...prev]);
        }
      }
    };
    checkRecurring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringRules.length]); 

  // Notification Logic
  useEffect(() => {
    if (!settings.notifications) return;
    
    // Low Balance Check
    if (settings.notifications.lowBalance && accounts.length > 0 && transactions.length > 0) {
        const totalBalance = accounts.reduce((sum, acc) => 
            sum + convertCurrency(acc.balance, acc.currency, settings.currency), 0
        );
        const hasAlert = alerts.some(a => a.type === 'low_balance');
        if (totalBalance < settings.notifications.lowBalanceThreshold && !hasAlert) {
            setAlerts(prev => [...prev, { id: 'low_balance', type: 'low_balance', messageKey: 'alert_low_balance' }]);
        }
    }

    // Debt Due Check
    if (settings.notifications.debtReminders) {
        debts.forEach(d => {
            if (d.type === 'i_owe' && d.dueDate) {
                const due = new Date(d.dueDate);
                const now = new Date();
                const diffTime = due.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const alertId = `debt_${d.id}`;
                if (diffDays >= 0 && diffDays <= 3 && !alerts.some(a => a.id === alertId)) {
                    setAlerts(prev => [...prev, { id: alertId, type: 'debt_due', messageKey: 'alert_debt_due', data: d.personName }]);
                }
            }
        });
    }

    // Goal Milestones
    if (settings.notifications.goalMilestones) {
        goals.forEach(g => {
            if (g.targetAmount > 0) {
                const percentage = (g.currentAmount / g.targetAmount);
                const alertId = `goal_${g.id}`;
                if (percentage >= 1 && !g.isCompleted && !alerts.some(a => a.id === alertId)) {
                     setAlerts(prev => [...prev, { id: alertId, type: 'goal_milestone', messageKey: 'alert_goal_milestone', data: g.name }]);
                }
            }
        });
    }
  }, [settings, accounts, debts, goals, alerts, transactions.length]);

  // --- ACTIONS ---

  const togglePrivacyMode = () => setIsPrivacyEnabled(!isPrivacyEnabled);

  const exportData = () => {
    const data = {
        version: 1,
        timestamp: new Date().toISOString(),
        settings, accounts, transactions, goals, debts, recurringRules
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuentas_claras_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString: string): boolean => {
      try {
          const data = JSON.parse(jsonString);
          if (data.settings) setSettings(data.settings);
          if (data.accounts) setAccounts(data.accounts);
          if (data.transactions) setTransactions(data.transactions);
          if (data.goals) setGoals(data.goals);
          if (data.debts) setDebts(data.debts);
          if (data.recurringRules) setRecurringRules(data.recurringRules);
          return true;
      } catch (e) {
          console.error("Import failed", e);
          return false;
      }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addAccount = (account: Account) => setAccounts(prev => [...prev, account]);
  const updateAccount = (account: Account) => setAccounts(prev => prev.map(a => a.id === account.id ? account : a));
  
  // ROBUST DELETION: Cascading delete of transactions when account is deleted
  const deleteAccount = (id: string) => {
    // 1. Filter out transactions belonging to this account
    setTransactions(prev => prev.filter(tx => tx.accountId !== id && tx.toAccountId !== id));
    // 2. Filter out recurring rules linked to this account
    setRecurringRules(prev => prev.filter(rule => rule.template.accountId !== id && rule.template.toAccountId !== id));
    // 3. Delete the account
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addTransaction = (transaction: Transaction, recurringOptions?: Omit<RecurringRule, 'id' | 'template' | 'nextDueDate' | 'active'>) => {
    setTransactions(prev => [transaction, ...prev]);
    processTransactionImpact(transaction);

    if (transaction.isRecurring && recurringOptions) {
        const ruleId = generateId();
        const rule: RecurringRule = {
            id: ruleId,
            template: {
                amount: transaction.amount,
                currency: transaction.currency,
                type: transaction.type,
                category: transaction.category,
                accountId: transaction.accountId,
                toAccountId: transaction.toAccountId,
                title: transaction.title,
                description: transaction.description,
            },
            frequency: recurringOptions.frequency,
            notify: recurringOptions.notify,
            nextDueDate: calculateNextDate(transaction.date, recurringOptions.frequency),
            active: true
        };
        setRecurringRules(prev => [...prev, rule]);
    }
  };

  const updateTransaction = (transaction: Transaction) => {
      const oldTransaction = transactions.find(t => t.id === transaction.id);
      if (oldTransaction) {
          processTransactionImpact(oldTransaction, true); // Revert old
      }
      processTransactionImpact(transaction, false); // Apply new
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
  };

  // SMART UNDO LOGIC
  const deleteTransaction = (id: string) => {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
          // 1. Remove Logic
          processTransactionImpact(tx, true); // Revert Balance
          setTransactions(prev => prev.filter(t => t.id !== id));
          
          // 2. Show Toast with Undo Action
          const restore = () => {
              addTransaction(tx); // Re-add
              hideToast();
          };
          
          // Determine friendly message
          const msgMap: Record<string, string> = {
              'es': 'Transacción eliminada',
              'en': 'Transaction deleted',
              'fr': 'Transaction supprimée',
              'pt': 'Transação excluída'
          };
          const undoMap: Record<string, string> = {
              'es': 'Deshacer',
              'en': 'Undo',
              'fr': 'Annuler',
              'pt': 'Desfazer'
          };
          const lang = settings.language;
          showToast(msgMap[lang] || 'Deleted', undoMap[lang] || 'Undo', restore);
      }
  };

  const deleteRecurringRule = (id: string) => {
      setRecurringRules(prev => prev.filter(r => r.id !== id));
  };

  const addGoal = (goal: Goal) => setGoals(prev => [...prev, goal]);
  const updateGoal = (goal: Goal) => setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  const addDebt = (debt: Debt) => setDebts(prev => [...prev, debt]);
  const updateDebt = (debt: Debt) => setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
  const deleteDebt = (id: string) => setDebts(prev => prev.filter(d => d.id !== id));

  const dismissAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <FinanceContext.Provider value={{
      settings, accounts, transactions, goals, debts, categories, alerts, isPrivacyEnabled, recurringRules, toast,
      togglePrivacyMode, exportData, importData,
      updateSettings, 
      addAccount, updateAccount, deleteAccount, 
      addTransaction, updateTransaction, deleteTransaction, deleteRecurringRule,
      addGoal, updateGoal, deleteGoal,
      addDebt, updateDebt, deleteDebt,
      dismissAlert, showToast, hideToast
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
