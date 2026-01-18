
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES, FLAGS, ACCOUNT_TYPES } from '../constants';
import { Button } from './Button';
import { Currency, AccountType } from '../types';
import { getCurrencySymbol } from '../services/financeService';
import { Wallet, Target, Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { settings, updateSettings, addAccount, addGoal, addDebt } = useFinance();
  const t = TRANSLATIONS[settings.language];
  
  // State
  const [step, setStep] = useState(0); // 0: Name, 1: Currency, 2: First Entity
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD'); 
  
  // Step 3 State
  const [entityType, setEntityType] = useState<'account' | 'goal' | 'debt'>('account');
  const [entityName, setEntityName] = useState('');
  const [amount, setAmount] = useState('');
  
  // Specific Entity State
  const [accountType, setAccountType] = useState<AccountType>('cash');
  const [debtType, setDebtType] = useState<'owes_me' | 'i_owe'>('owes_me');

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (step === 0 && name.trim()) {
        updateSettings({ name: name.trim() }); // Partial update
        setStep(1);
    } else if (step === 1) {
        updateSettings({ currency });
        setStep(2);
    }
  };

  const finishOnboarding = () => {
      updateSettings({ hasOnboarded: true });
  };

  const handleCreateAndFinish = (e: React.FormEvent) => {
      e.preventDefault();
      if (!entityName.trim()) return;
      const numAmount = parseFloat(amount) || 0;
      const id = Date.now().toString();

      if (entityType === 'account') {
          addAccount({
              id, name: entityName, type: accountType, balance: numAmount, currency, icon: 'Wallet'
          });
      } else if (entityType === 'goal') {
          addGoal({
              id, name: entityName, targetAmount: numAmount, currentAmount: 0, currency, isCompleted: false, icon: 'Target'
          });
      } else if (entityType === 'debt') {
          addDebt({
              id, personName: entityName, amount: numAmount, currency, type: debtType, icon: 'Users' 
          });
      }
      finishOnboarding();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-black transition-colors">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up relative">
        
        {/* STEP 1: NAME */}
        {step === 0 && (
          <div className="space-y-8 animate-fade-in">
             <div className="text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto mb-6 shadow-xl shadow-blue-500/30 flex items-center justify-center">
                    <span className="text-4xl text-white">C</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                    {t.welcome_title}
                </h1>
            </div>
            <form onSubmit={handleNext} className="space-y-6">
                <div className="relative">
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.name_placeholder}
                    className="w-full px-5 py-4 text-lg bg-white dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white placeholder-gray-400"
                    autoFocus
                    />
                </div>
                <Button 
                    variant="primary" 
                    size="lg" 
                    type="submit" 
                    disabled={!name.trim()}
                    className="w-full"
                >
                    {t.continue}
                </Button>
            </form>
          </div>
        )}

        {/* STEP 2: CURRENCY */}
        {step === 1 && (
            <div className="space-y-6 animate-fade-in h-full flex flex-col">
                <div className="text-center shrink-0">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                        {t.select_currency_title}
                    </h1>
                </div>
                
                {/* Scrollable List with padding for floating button */}
                <div className="grid grid-cols-1 gap-3 pb-32">
                    {SUPPORTED_CURRENCIES.map(c => (
                        <button
                          key={c}
                          onClick={() => setCurrency(c)}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                              currency === c 
                              ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-md ring-1 ring-blue-500' 
                              : 'border-transparent bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    {FLAGS[c]}
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-lg text-gray-900 dark:text-white">{c}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {c === 'USD' ? 'US Dollar' : c === 'EUR' ? 'Euro' : c === 'COP' ? 'Peso Colombiano' : c === 'MXN' ? 'Peso Mexicano' : 'Currency'}
                                    </span>
                                </div>
                            </div>
                            <span className={`text-xl font-medium ${currency === c ? 'text-blue-600' : 'text-gray-400'}`}>
                                {getCurrencySymbol(c)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Floating Button */}
                <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20">
                    <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={handleNext}
                        className="w-full shadow-2xl"
                    >
                        {t.continue}
                    </Button>
                </div>
            </div>
        )}

        {/* STEP 3: FIRST RECORD */}
        {step === 2 && (
            <div className="space-y-6 animate-fade-in pb-10">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                        {t.setup_first_title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {t.setup_subtitle}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm space-y-4">
                     {/* Entity Tabs */}
                     <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                        {(['account', 'goal', 'debt'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setEntityType(type)}
                                className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                                    entityType === type 
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-500'
                                }`}
                            >
                                {type === 'account' && <Wallet size={16} />}
                                {type === 'goal' && <Target size={16} />}
                                {type === 'debt' && <Users size={16} />}
                                <span className="hidden sm:inline ml-1">
                                    {type === 'debt' ? t.debt : (type === 'goal' ? t.goal : t.account)}
                                </span>
                            </button>
                        ))}
                     </div>

                     <form onSubmit={handleCreateAndFinish} className="space-y-5">
                        {/* DEBT TYPE SELECTOR */}
                        {entityType === 'debt' && (
                             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4">
                                <button
                                    type="button"
                                    onClick={() => setDebtType('owes_me')}
                                    className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                        debtType === 'owes_me' 
                                        ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' 
                                        : 'text-gray-400'
                                    }`}
                                >
                                    <ArrowDownLeft size={14} />
                                    {t.owe_me}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDebtType('i_owe')}
                                    className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                        debtType === 'i_owe' 
                                        ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' 
                                        : 'text-gray-400'
                                    }`}
                                >
                                    <ArrowUpRight size={14} />
                                    {t.i_owe}
                                </button>
                             </div>
                        )}

                        <div>
                             <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                {entityType === 'debt' ? t.debt_person : t.concept}
                             </label>
                             <input 
                                type="text"
                                value={entityName}
                                onChange={(e) => setEntityName(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg"
                                placeholder="..."
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                {entityType === 'goal' ? t.target : t.amount}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{getCurrencySymbol(currency)}</span>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-10 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {entityType === 'account' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">{t.type}</label>
                                <select 
                                    value={accountType}
                                    onChange={(e) => setAccountType(e.target.value as AccountType)}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white text-base"
                                >
                                    {ACCOUNT_TYPES.map(at => (
                                        <option key={at} value={at}>
                                            {t[`type_${at}` as keyof typeof t] || at}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <Button 
                            variant="primary" 
                            size="lg" 
                            type="submit" 
                            disabled={!entityName.trim()}
                            className="w-full mt-4"
                        >
                            {t.create_finish}
                        </Button>
                     </form>
                </div>
                
                <div className="text-center">
                    <button 
                        onClick={finishOnboarding}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors p-2"
                    >
                        {t.setup_skip}
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
