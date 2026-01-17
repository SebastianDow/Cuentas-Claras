
import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES, CATEGORY_KEYWORDS } from '../constants';
import { Button } from './Button';
import { X, MoreHorizontal, Briefcase, Laptop, Gift, TrendingUp, Utensils, Car, Zap, Film, ShoppingBag, Heart, BookOpen, Home, Repeat, BellRing, ArrowRightLeft, Trash2, Wallet, Delete, Calculator } from 'lucide-react';
import { Currency, TransactionType, Frequency, Transaction } from '../types';
import { getCurrencySymbol, toLocalISOString, getRecurringFrequencyLabel, vibrate, evaluateMathExpression } from '../services/financeService';
import { IconMap } from './icons';

interface AddRecordModalProps {
    onClose: () => void;
    initialData?: Transaction;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({ onClose, initialData }) => {
  const { settings, accounts, goals, categories, transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const t = TRANSLATIONS[settings.language];

  // State
  const [txType, setTxType] = useState<TransactionType>('expense');
  // Amount is a string to support keypad input like "50+20"
  const [amountStr, setAmountStr] = useState('');
  const [isKeypadVisible, setIsKeypadVisible] = useState(!initialData); // Show keypad by default for new
  
  const [currency, setCurrency] = useState<Currency>(settings.currency);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Date State
  const [dateStr, setDateStr] = useState<string>(() => {
      if (initialData) return toLocalISOString(new Date(initialData.date));
      return toLocalISOString(new Date());
  });

  // Account Selections
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts.length > 1 ? accounts[1].id : '');
  
  const [selectedCategory, setSelectedCategory] = useState<string>('cat_other');

  // Recurring State
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [notifyRecurring, setNotifyRecurring] = useState(false);
  const [showRecurringSuggestion, setShowRecurringSuggestion] = useState(false);

  // Initialize Data for Edit Mode
  useEffect(() => {
      if (initialData) {
          setTxType(initialData.type);
          setAmountStr(initialData.amount.toString());
          setCurrency(initialData.currency);
          setTitle(initialData.title);
          setDescription(initialData.description || '');
          setAccountId(initialData.accountId);
          if (initialData.toAccountId) setToAccountId(initialData.toAccountId);
          setSelectedCategory(initialData.category);
          if (initialData.isRecurring) {
              setIsRecurring(true);
              if (initialData.frequency) setFrequency(initialData.frequency);
          }
      }
  }, [initialData]);

  // SMART MECHANISM 1: Predictive Category
  useEffect(() => {
      if (!initialData && title.length > 2) {
          const lowerTitle = title.toLowerCase();
          // Find matching category based on keywords
          for (const [catKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
              if (keywords.some(k => lowerTitle.includes(k))) {
                  // Only switch if the category type matches current txType
                  const catDef = categories.find(c => c.key === catKey);
                  if (catDef && catDef.type === txType) {
                      setSelectedCategory(catKey);
                  }
                  break;
              }
          }
      }
  }, [title, txType, categories, initialData]);

  // SMART MECHANISM 2: Recurring Suggestions
  useEffect(() => {
      if (!initialData && !isRecurring && title.length > 3) {
          // Check if user has similar previous transactions
          const similar = transactions.filter(tx => 
            tx.title.toLowerCase() === title.toLowerCase() && 
            Math.abs(tx.amount - parseFloat(amountStr)) < 5 // Approx amount
          );
          if (similar.length >= 2) {
             setShowRecurringSuggestion(true);
          } else {
             setShowRecurringSuggestion(false);
          }
      }
  }, [title, amountStr, transactions, initialData, isRecurring]);

  const handleKeypadPress = (val: string) => {
      vibrate(10); // Haptic
      if (val === 'C') {
          setAmountStr('');
      } else if (val === 'DEL') {
          setAmountStr(prev => prev.slice(0, -1));
      } else if (val === 'OK') {
          setIsKeypadVisible(false);
      } else {
          // Prevent multiple decimals
          if (val === '.' && amountStr.includes('.') && !amountStr.includes('+') && !amountStr.includes('-')) return;
          setAmountStr(prev => prev + val);
      }
  };

  const getComputedAmount = () => {
      if (!amountStr) return 0;
      return evaluateMathExpression(amountStr);
  };

  const availableCategories = categories.filter(c => c.type === txType);
  const availableAccounts = accounts;
  const availableGoals = goals; 

  // GUARD: No Accounts
  if (availableAccounts.length === 0) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-8 relative shadow-2xl text-center z-10 animate-fade-in-up">
                <Wallet size={32} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-bold dark:text-white mb-2">No accounts found</h2>
                <Button onClick={onClose} className="w-full">Close</Button>
            </div>
        </div>
      );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = getComputedAmount();
    if (!val || !title) return;
    
    if (txType === 'transfer' && accountId === toAccountId) {
        alert("Source and destination accounts cannot be the same");
        return;
    }

    const finalDate = new Date(dateStr).toISOString();

    const payload: Transaction = {
      id: initialData ? initialData.id : Date.now().toString(),
      amount: val,
      currency,
      type: txType,
      category: txType === 'transfer' ? 'transfer' : selectedCategory,
      accountId, 
      toAccountId: txType === 'transfer' ? toAccountId : undefined,
      title,
      description,
      date: finalDate, 
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
    };

    if (initialData) {
        updateTransaction(payload);
    } else {
        addTransaction(payload, isRecurring ? { frequency, notify: notifyRecurring } : undefined);
    }
    
    vibrate([10, 30]); // Success Haptic
    onClose();
  };

  const handleDelete = () => {
      // Direct delete without native confirm, using Undo Toast instead
      if (initialData) {
          deleteTransaction(initialData.id);
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto transform transition-transform duration-300 translate-y-0 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-bold dark:text-white">{initialData ? t.new_record.replace('Nuevo', 'Editar') : t.new_record}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
           
           {/* Transaction Type Sub-selector */}
           <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0">
                {(['expense', 'income', 'transfer'] as TransactionType[]).map(tt => (
                    <button 
                        key={tt}
                        type="button"
                        onClick={() => {
                            setTxType(tt);
                            if (tt !== 'transfer') {
                                const first = categories.find(c => c.type === tt);
                                if (first) setSelectedCategory(first.key);
                            }
                            if (tt === 'expense' && goals.some(g => g.id === accountId)) {
                                setAccountId(accounts[0]?.id || '');
                            }
                        }}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            txType === tt 
                            ? (tt === 'expense' ? 'bg-white text-red-600 shadow-sm' : tt === 'income' ? 'bg-white text-green-600 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                    >
                        {tt === 'expense' ? t.expense : (tt === 'income' ? t.income : t.transfer)}
                    </button>
                ))}
           </div>

           {/* Amount Display & Keypad Trigger */}
           <div className="relative shrink-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-light">
                  {getCurrencySymbol(currency)}
              </span>
              <button
                type="button"
                onClick={() => setIsKeypadVisible(true)}
                className="w-full pl-10 pr-20 py-4 text-4xl font-bold bg-transparent border-b-2 border-gray-100 dark:border-gray-800 outline-none text-left dark:text-white truncate"
              >
                  {amountStr || '0.00'}
              </button>
              
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

           {/* SMART KEYPAD (Collapsible) */}
           {isKeypadVisible && (
               <div className="grid grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl animate-fade-in shrink-0">
                   {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','.','+'].map(k => (
                       <button
                         key={k}
                         type="button"
                         onClick={() => handleKeypadPress(k)}
                         className={`h-12 rounded-xl text-xl font-bold shadow-sm active:scale-95 transition-transform ${
                             ['/','*','-','+'].includes(k) 
                             ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                             : k === 'C' 
                               ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                               : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                         }`}
                       >
                           {k}
                       </button>
                   ))}
                   <button type="button" onClick={() => handleKeypadPress('DEL')} className="h-12 rounded-xl bg-gray-200 dark:bg-gray-600 flex items-center justify-center col-span-2">
                       <Delete size={20} />
                   </button>
                   <button type="button" onClick={() => handleKeypadPress('OK')} className="h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center col-span-2 font-bold">
                       OK
                   </button>
               </div>
           )}

           {/* Title/Name */}
           <div className="shrink-0">
             <label className="block text-xs font-medium text-gray-500 mb-1">{t.concept}</label>
             <input 
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
               placeholder={txType === 'transfer' ? "Saving money..." : "Uber, Starbucks, Netflix..."}
             />
           </div>

           {/* ACCOUNT & CATEGORY SECTION (Scrollable if needed) */}
           <div className="space-y-5">
                {/* Transfer UI or Normal UI */}
                {txType === 'transfer' ? (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white outline-none">
                                {availableAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({getCurrencySymbol(acc.currency)}{acc.balance})</option>)}
                            </select>
                        </div>
                        <div className="flex justify-center -my-2 z-10"><ArrowRightLeft size={16} className="text-gray-500" /></div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                            <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white outline-none">
                                {availableAccounts.filter(a => a.id !== accountId).map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{txType === 'income' ? t.account + ' / ' + t.target : t.account}</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            {availableAccounts.map(acc => (
                                <button key={acc.id} type="button" onClick={() => setAccountId(acc.id)} className={`px-4 py-2 rounded-xl whitespace-nowrap border text-sm font-medium transition-colors ${accountId === acc.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                    {acc.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories */}
                {txType !== 'transfer' && (
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
                )}
           </div>

           {/* Suggestion Toast (Embedded) */}
           {showRecurringSuggestion && !isRecurring && (
               <div 
                 onClick={() => { setIsRecurring(true); setFrequency('monthly'); setShowRecurringSuggestion(false); }}
                 className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex items-center gap-3 cursor-pointer border border-blue-100 dark:border-blue-800 animate-fade-in"
               >
                   <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full text-blue-600 dark:text-blue-300">
                       <Repeat size={14} />
                   </div>
                   <span className="text-xs text-blue-700 dark:text-blue-200 font-medium">
                       {t.recurring_suggestion} <b>{t.is_recurring}</b>
                   </span>
               </div>
           )}
            
            <div className="flex gap-3">
                 <div className="flex-[3]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.description}</label>
                    <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={1}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                    placeholder="..."
                    />
                 </div>
                 <div className="flex-[2]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.date}</label>
                    <input 
                        type="datetime-local"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-xs min-w-0"
                    />
                 </div>
            </div>

           {/* Recurring Toggle Section */}
           {!initialData && (
               <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Repeat size={16} className="text-gray-500" />
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.is_recurring}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${isRecurring ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                  </div>
                  
                  {isRecurring && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-fade-in">
                          <div>
                            <select 
                               value={frequency}
                               onChange={(e) => setFrequency(e.target.value as Frequency)}
                               className="w-full p-2 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white outline-none border border-gray-200 dark:border-gray-700 mb-2"
                            >
                               <option value="daily">{t.freq_daily}</option>
                               <option value="weekly">{t.freq_weekly}</option>
                               <option value="monthly">{t.freq_monthly}</option>
                               <option value="yearly">{t.freq_yearly}</option>
                            </select>
                            <p className="text-xs text-blue-500 font-medium italic">
                                {getRecurringFrequencyLabel(frequency, new Date(dateStr).toISOString(), settings.language)}
                            </p>
                          </div>
                      </div>
                  )}
               </div>
           )}

           <div className="flex gap-3 pt-2 mt-auto">
               {initialData && (
                   <Button type="button" variant="secondary" onClick={handleDelete} className="flex-1 text-red-500 hover:text-red-600 flex items-center justify-center gap-2">
                       <Trash2 size={18} /> {t.delete}
                   </Button>
               )}
               <Button type="submit" variant="primary" size="lg" className={initialData ? "flex-[2]" : "w-full"}>
                  {t.save}
               </Button>
           </div>
        </form>
      </div>
    </div>
  );
};
