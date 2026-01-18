
import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES, ACCOUNT_TYPES } from '../constants';
import { Button } from './Button';
import { X, Wallet, Target, Users, ArrowDownLeft, ArrowUpRight, Percent, ChevronDown, ChevronUp } from 'lucide-react';
import { Currency, Account, Goal, Debt, AccountType, InterestFrequency } from '../types';
import { getCurrencySymbol, toLocalDateString, dateFromInput } from '../services/financeService';
import { IconMap, ENTITY_ICONS } from './icons';

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
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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
  
  // Shared Interest Logic State (For Debt and Accounts)
  const [enableInterest, setEnableInterest] = useState(false);
  const [interestRate, setInterestRate] = useState('');
  const [interestFrequency, setInterestFrequency] = useState<InterestFrequency>('monthly');
  const [startDate, setStartDate] = useState(() => toLocalDateString(new Date()));

  const getDefaultIcon = (t: EntityType) => {
    if (t === 'account') return 'Wallet';
    if (t === 'goal') return 'Target';
    return 'Users';
  };

  useEffect(() => {
    if (initialData) {
      setCurrency(initialData.currency);
      setSelectedIcon(initialData.icon || getDefaultIcon(type));
      
      if (type === 'account') {
        const d = initialData as Account;
        setName(d.name);
        setAccountType(d.type);
        setBalance(d.balance.toString());
        if (d.enableInterest) {
            setShowAdvanced(true);
            setEnableInterest(true);
            setInterestRate(d.interestRate?.toString() || '');
            setInterestFrequency(d.interestFrequency || 'monthly');
            setStartDate(d.startDate ? toLocalDateString(new Date(d.startDate)) : toLocalDateString(new Date()));
        }
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
        if (d.enableInterest) {
            setShowAdvanced(true);
            setEnableInterest(true);
            setInterestRate(d.interestRate?.toString() || '');
            setInterestFrequency(d.interestFrequency || 'monthly');
            setStartDate(d.startDate ? toLocalDateString(new Date(d.startDate)) : toLocalDateString(new Date()));
        }
      }
    } else {
        setSelectedIcon(getDefaultIcon(type));
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
        currency,
        icon: selectedIcon,
        enableInterest: accountType !== 'cash' ? enableInterest : false,
        interestRate: enableInterest ? parseFloat(interestRate) : undefined,
        interestFrequency: enableInterest ? interestFrequency : undefined,
        startDate: enableInterest ? dateFromInput(startDate) : undefined
      };
      initialData ? updateAccount(payload) : addAccount(payload);
    } else if (type === 'goal') {
      const payload: Goal = {
        id: initialData?.id || Date.now().toString(),
        name,
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentSaved) || 0,
        currency,
        isCompleted: (parseFloat(currentSaved) || 0) >= (parseFloat(targetAmount) || 1),
        icon: selectedIcon
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
        description,
        icon: selectedIcon,
        enableInterest,
        interestRate: enableInterest ? parseFloat(interestRate) : undefined,
        interestFrequency: enableInterest ? interestFrequency : undefined,
        startDate: enableInterest ? dateFromInput(startDate) : undefined
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

  // Reusable Component for Interest Settings
  const InterestSection = () => (
     <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4 animate-fade-in">
         <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                     <Percent size={18} />
                 </div>
                 <span className="text-base font-bold text-gray-700 dark:text-gray-200">{t.enable_interest}</span>
             </div>
             <button 
                type="button"
                onClick={() => setEnableInterest(!enableInterest)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${enableInterest ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
             >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${enableInterest ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
         </div>

         {enableInterest && (
             <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-sm font-semibold text-gray-500 mb-2">{t.interest_rate}</label>
                         <input 
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl text-lg outline-none border border-gray-200 dark:border-gray-700 dark:text-white"
                            placeholder="5"
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-semibold text-gray-500 mb-2">{t.compounding}</label>
                         <select 
                            value={interestFrequency}
                            onChange={(e) => setInterestFrequency(e.target.value as InterestFrequency)}
                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl text-base outline-none border border-gray-200 dark:border-gray-700 dark:text-white"
                         >
                             <option value="daily">{t.int_daily}</option>
                             <option value="weekly">{t.int_weekly}</option>
                             <option value="monthly">{t.int_monthly}</option>
                             <option value="yearly">{t.int_yearly}</option>
                         </select>
                     </div>
                 </div>
                 <div>
                     <label className="block text-sm font-semibold text-gray-500 mb-2">{t.start_date}</label>
                     <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl text-lg outline-none border border-gray-200 dark:border-gray-700 dark:text-white"
                     />
                 </div>
             </div>
         )}
     </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            {type === 'account' && <Wallet className="text-blue-500" size={28} />}
            {type === 'goal' && <Target className="text-blue-500" size={28} />}
            {type === 'debt' && <Users className="text-blue-500" size={28} />}
            {getTitle()}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* DEBT TYPE SELECTOR */}
          {type === 'debt' && (
             <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl mb-4">
                <button
                    type="button"
                    onClick={() => setDebtType('owes_me')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        debtType === 'owes_me' 
                        ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' 
                        : 'text-gray-400'
                    }`}
                >
                    <ArrowDownLeft size={18} />
                    {t.owe_me}
                </button>
                <button
                    type="button"
                    onClick={() => setDebtType('i_owe')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        debtType === 'i_owe' 
                        ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' 
                        : 'text-gray-400'
                    }`}
                >
                    <ArrowUpRight size={18} />
                    {t.i_owe}
                </button>
             </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
                {type === 'debt' ? t.debt_person : (type === 'goal' ? t.goal_name : t.account)}
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg"
              placeholder="..."
              autoFocus
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">{t.icon_label}</label>
            <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto p-1 custom-scrollbar">
                {ENTITY_ICONS.map(iconKey => {
                const Icon = IconMap[iconKey];
                return (
                    <button
                        key={iconKey}
                        type="button"
                        onClick={() => setSelectedIcon(iconKey)}
                        className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
                        selectedIcon === iconKey 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 ring-2 ring-blue-500'
                        : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Icon size={24} />
                    </button>
                )
                })}
            </div>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">{t.currency}</label>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
               {SUPPORTED_CURRENCIES.map(c => (
                   <button
                     key={c}
                     type="button"
                     onClick={() => setCurrency(c)}
                     className={`px-4 py-3 rounded-xl text-base font-bold border transition-colors ${
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
                   <label className="block text-sm font-semibold text-gray-500 mb-2">{t.type}</label>
                   <select 
                     value={accountType}
                     onChange={(e) => setAccountType(e.target.value as AccountType)}
                     className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white text-lg"
                   >
                       {ACCOUNT_TYPES.map(at => (
                           <option key={at} value={at}>
                               {t[`type_${at}` as keyof typeof t] || at}
                           </option>
                       ))}
                   </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2">{t.initial_balance}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">{getCurrencySymbol(currency)}</span>
                        <input 
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="w-full pl-10 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg font-bold"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Account Interest Section (Not for Cash) */}
                {accountType !== 'cash' && (
                    <div className="mt-4">
                        <button 
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 hover:text-blue-600 transition-colors"
                        >
                            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {t.advanced_options}
                        </button>
                        
                        {showAdvanced && <InterestSection />}
                    </div>
                )}
            </>
          )}

          {/* GOAL SPECIFIC */}
          {type === 'goal' && (
             <>
                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2">{t.target}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">{getCurrencySymbol(currency)}</span>
                        <input 
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            className="w-full pl-10 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg font-bold"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2">{t.current_saved}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">{getCurrencySymbol(currency)}</span>
                        <input 
                            type="number"
                            value={currentSaved}
                            onChange={(e) => setCurrentSaved(e.target.value)}
                            className="w-full pl-10 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg font-bold"
                            placeholder="0.00"
                        />
                    </div>
                </div>
             </>
          )}

          {/* DEBT SPECIFIC */}
          {type === 'debt' && (
             <>
                 <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2">{t.capital}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">{getCurrencySymbol(currency)}</span>
                        <input 
                            type="number"
                            value={debtAmount}
                            onChange={(e) => setDebtAmount(e.target.value)}
                            className="w-full pl-10 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg font-bold"
                            placeholder="0.00"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2">{t.date}</label>
                    <input 
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg"
                    />
                 </div>

                 {/* Advanced Toggle for Debt */}
                 <div className="mt-4">
                     <button 
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 hover:text-blue-600 transition-colors"
                     >
                        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {t.advanced_options}
                     </button>
                     
                     {/* Show section if user toggled advanced OR if interest was already enabled (editing) */}
                     {(showAdvanced || enableInterest) && <InterestSection />}
                 </div>

                 <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2">{t.description}</label>
                    <input 
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg"
                        placeholder="..."
                    />
                 </div>
             </>
          )}

          <div className="flex gap-4 mt-8">
              {initialData && (
                  <Button type="button" variant="secondary" onClick={handleDelete} className="flex-1 text-red-500 hover:text-red-600 text-lg py-4">
                      {t.delete}
                  </Button>
              )}
              <Button type="submit" variant="primary" size="lg" className="flex-[2] text-lg py-4 font-bold">
                  {t.save}
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
