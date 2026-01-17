import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES } from '../constants';
import { Button } from './Button';
import { X, Wallet, Target, Users } from 'lucide-react';
import { Currency, Account, Goal, Debt, AccountType } from '../types';
import { getCurrencySymbol } from '../services/financeService';

type EntityType = 'account' | 'goal' | 'debt';

interface ManageEntityModalProps {
  type: EntityType;
  initialData?: Account | Goal | Debt;
  onClose: () => void;
}

export const ManageEntityModal: React.FC<ManageEntityModalProps> = ({ type, initialData, onClose }) => {
  const { settings, addAccount, updateAccount, addGoal, updateGoal, addDebt, updateDebt, deleteAccount, deleteGoal, deleteDebt } = useFinance();
  const t = TRANSLATIONS[settings.language];

  // Common State
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<Currency>(settings.currency);
  
  // Account State
  const [accountType, setAccountType] = useState<AccountType>('cash');
  const [balance, setBalance] = useState('');

  // Goal State
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');

  // Debt State
  const [debtType, setDebtType] = useState<'owes_me' | 'i_owe'>('owes_me');
  const [debtAmount, setDebtAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setCurrency(initialData.currency);
      
      if (type === 'account') {
        const d = initialData as Account;
        setName(d.name);
        setAccountType(d.type);
        setBalance(d.balance.toString());
      } else if (type === 'goal') {
        const d = initialData as Goal;
        setName(d.name);
        setTargetAmount(d.targetAmount.toString());
        setCurrentSaved(d.currentAmount.toString());
      } else if (type === 'debt') {
        const d = initialData as Debt;
        setName(d.personName);
        setDebtAmount(d.amount.toString());
        setDebtType(d.type);
        setDueDate(d.dueDate || '');
        setDescription(d.description || '');
      }
    }
  }, [initialData, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (type === 'account') {
      const payload: Account = {
        id: initialData?.id || Date.now().toString(),
        name,
        type: accountType,
        balance: parseFloat(balance) || 0,
        currency
      };
      initialData ? updateAccount(payload) : addAccount(payload);
    } else if (type === 'goal') {
      const payload: Goal = {
        id: initialData?.id || Date.now().toString(),
        name,
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentSaved) || 0,
        currency,
        isCompleted: (parseFloat(currentSaved) || 0) >= (parseFloat(targetAmount) || 1)
      };
      initialData ? updateGoal(payload) : addGoal(payload);
    } else if (type === 'debt') {
      const payload: Debt = {
        id: initialData?.id || Date.now().toString(),
        personName: name,
        amount: parseFloat(debtAmount) || 0,
        currency,
        type: debtType,
        dueDate: dueDate || undefined,
        description
      };
      initialData ? updateDebt(payload) : addDebt(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!initialData) return;
    if (type === 'account') deleteAccount(initialData.id);
    if (type === 'goal') deleteGoal(initialData.id);
    if (type === 'debt') deleteDebt(initialData.id);
    onClose();
  };

  const getTitle = () => {
    if (type === 'account') return initialData ? t.edit_account : t.add_account;
    if (type === 'goal') return initialData ? t.edit_goal : t.add_goal;
    return initialData ? t.edit_debt : t.add_debt;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            {type === 'account' && <Wallet className="text-blue-500" size={24} />}
            {type === 'goal' && <Target className="text-blue-500" size={24} />}
            {type === 'debt' && <Users className="text-blue-500" size={24} />}
            {getTitle()}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
                {type === 'debt' ? t.debt_person : (type === 'goal' ? t.goal_name : t.account)}
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              placeholder="..."
              autoFocus
            />
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t.currency}</label>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
               {SUPPORTED_CURRENCIES.map(c => (
                   <button
                     key={c}
                     type="button"
                     onClick={() => setCurrency(c)}
                     className={`px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${
                         currency === c
                         ? 'bg-blue-600 border-blue-600 text-white'
                         : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                     }`}
                   >
                       {c}
                   </button>
               ))}
            </div>
          </div>

          {/* ACCOUNT SPECIFIC */}
          {type === 'account' && (
            <>
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">{t.type}</label>
                   <select 
                     value={accountType}
                     onChange={(e) => setAccountType(e.target.value as AccountType)}
                     className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white"
                   >
                       <option value="cash">Cash</option>
                       <option value="checking">Checking</option>
                       <option value="savings">Savings</option>
                       <option value="credit_card">Credit Card</option>
                       <option value="investment">Investment</option>
                   </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.initial_balance}</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySymbol(currency)}</span>
                        <input 
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="w-full pl-8 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </>
          )}

          {/* GOAL SPECIFIC */}
          {type === 'goal' && (
             <>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.target}</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySymbol(currency)}</span>
                        <input 
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            className="w-full pl-8 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.current_saved}</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySymbol(currency)}</span>
                        <input 
                            type="number"
                            value={currentSaved}
                            onChange={(e) => setCurrentSaved(e.target.value)}
                            className="w-full pl-8 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="0.00"
                        />
                    </div>
                </div>
             </>
          )}

          {/* DEBT SPECIFIC */}
          {type === 'debt' && (
             <>
                 <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2">
                        <input type="radio" checked={debtType === 'owes_me'} onChange={() => setDebtType('owes_me')} />
                        <span className="text-sm dark:text-white">{t.owe_me}</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" checked={debtType === 'i_owe'} onChange={() => setDebtType('i_owe')} />
                        <span className="text-sm dark:text-white">{t.i_owe}</span>
                    </label>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.amount}</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySymbol(currency)}</span>
                        <input 
                            type="number"
                            value={debtAmount}
                            onChange={(e) => setDebtAmount(e.target.value)}
                            className="w-full pl-8 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="0.00"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.date}</label>
                    <input 
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.description}</label>
                    <input 
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder="..."
                    />
                 </div>
             </>
          )}

          <div className="flex gap-3 mt-6">
              {initialData && (
                  <Button type="button" variant="secondary" onClick={handleDelete} className="flex-1 text-red-500 hover:text-red-600">
                      {t.delete}
                  </Button>
              )}
              <Button type="submit" variant="primary" size="lg" className="flex-[2]">
                  {t.save}
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
