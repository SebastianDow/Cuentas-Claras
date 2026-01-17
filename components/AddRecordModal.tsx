import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES } from '../constants';
import { Button } from './Button';
import { X, MoreHorizontal, Briefcase, Laptop, Gift, TrendingUp, Utensils, Car, Zap, Film, ShoppingBag, Heart, BookOpen, Home } from 'lucide-react';
import { Currency, TransactionType } from '../types';
import { getCurrencySymbol } from '../services/financeService';

// Helper to map icon string to Component
const IconMap: { [key: string]: any } = {
  Briefcase, Laptop, Gift, TrendingUp, Utensils, Car, Zap, Film, ShoppingBag, Heart, BookOpen, Home, MoreHorizontal
};

export const AddRecordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { settings, accounts, goals, categories, addTransaction } = useFinance();
  const t = TRANSLATIONS[settings.language];

  // We are now only handling Transactions here. Goals and Debts are handled in ManageEntityModal.
  // But to keep legacy compatibility if user selects Goal/Debt from this view, we can redirect or simplify.
  // The user requirement says "Al oprimir el botón... se podrán añadir nuevos débitos/créditos".
  // The previous implementation mixed Structure Creation (New Goal) with Transaction Creation.
  // Given the new Dashboard buttons, we focus this modal on TRANSACTIONS (Records).

  const [txType, setTxType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(settings.currency);
  const [title, setTitle] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('cat_other');

  // Logic to allow selecting a GOAL as a destination for Income
  const availableAccounts = accounts;
  const availableGoals = goals; 

  const availableCategories = categories.filter(c => c.type === txType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || !title) return;

    addTransaction({
      id: Date.now().toString(),
      amount: val,
      currency,
      type: txType,
      category: selectedCategory,
      accountId, // This might be an Account ID or a Goal ID
      title,
      date: new Date().toISOString(),
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto transform transition-transform duration-300 translate-y-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">{t.new_record}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           
           {/* Transaction Type Sub-selector */}
           <div className="flex gap-3 justify-center mb-2">
                {(['expense', 'income'] as TransactionType[]).map(tt => (
                    <button 
                        key={tt}
                        type="button"
                        onClick={() => {
                            setTxType(tt);
                            // Reset category to first available if switching types
                            const first = categories.find(c => c.type === tt);
                            if (first) setSelectedCategory(first.key);
                            // If switching to expense, ensure we are not selecting a goal (optional safety, but accounts list handles display)
                            if (tt === 'expense' && goals.some(g => g.id === accountId)) {
                                setAccountId(accounts[0]?.id || '');
                            }
                        }}
                        className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            txType === tt 
                            ? (tt === 'expense' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                        }`}
                    >
                        {tt === 'expense' ? t.expense : t.income}
                    </button>
                ))}
           </div>

           {/* Amount Input */}
           <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-light">
                  {getCurrencySymbol(currency)}
              </span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-20 py-4 text-4xl font-bold bg-transparent border-b-2 border-gray-100 dark:border-gray-800 outline-none focus:border-blue-500 dark:text-white placeholder-gray-200"
                autoFocus
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm font-bold text-gray-700 dark:text-gray-300 outline-none"
                >
                    {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
           </div>

           {/* Title/Name */}
           <div>
             <label className="block text-xs font-medium text-gray-500 mb-1">{t.concept}</label>
             <input 
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
               placeholder="Starbucks..."
             />
           </div>

           {/* Category Grid */}
           <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t.category}</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {availableCategories.map(cat => {
                        const Icon = IconMap[cat.icon] || MoreHorizontal;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.key)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                                    selectedCategory === cat.key
                                    ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${cat.color} bg-opacity-20`}>
                                    <Icon size={16} />
                                </div>
                                <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate w-full text-center">
                                    {t[cat.key as keyof typeof t] || cat.key}
                                </span>
                            </button>
                        );
                    })}
                </div>
             </div>

           {/* Account Selector (Including Goals if Income) */}
           <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                    {txType === 'income' ? t.account + ' / ' + t.target : t.account}
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {availableAccounts.map(acc => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setAccountId(acc.id)}
                          className={`px-4 py-2 rounded-xl whitespace-nowrap border text-sm font-medium transition-colors ${
                              accountId === acc.id 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                            {acc.name}
                        </button>
                    ))}
                    
                    {/* Goals Section for Income */}
                    {txType === 'income' && availableGoals.length > 0 && (
                        <>
                            <div className="w-[1px] bg-gray-300 dark:bg-gray-700 mx-1"></div>
                            {availableGoals.map(goal => (
                                <button
                                key={goal.id}
                                type="button"
                                onClick={() => setAccountId(goal.id)}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap border text-sm font-medium transition-colors flex items-center gap-1 ${
                                    accountId === goal.id 
                                    ? 'bg-green-600 border-green-600 text-white' 
                                    : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                }`}
                                >
                                    <TrendingUp size={12} />
                                    {goal.name}
                                </button>
                            ))}
                        </>
                    )}
                </div>
             </div>

           <Button type="submit" variant="primary" size="lg" className="mt-4">
              {t.save}
           </Button>
        </form>
      </div>
    </div>
  );
};
