

import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS } from '../constants';
import { formatCurrency, convertCurrency, formatSmartDate, getCurrencySymbol, formatNumber, calculateDebtDetails, calculateAccountDetails, fitText } from '../services/financeService';
import { Plus, Wallet, Target, CreditCard, TrendingUp, TrendingDown, Bell, X, Users, ArrowRightLeft, Pencil, Activity } from 'lucide-react';
import { Account, Goal, Debt, Transaction } from '../types';
import { ManageEntityModal } from './ManageEntityModal';
import { AddRecordModal } from './AddRecordModal';
import { IconMap } from './icons';

type DashboardTab = 'balance' | 'goals' | 'debts';

interface DashboardProps {
    onAddRecord: () => void;
    onViewHistory: (accountId?: string, viewMode?: 'list' | 'chart') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddRecord, onViewHistory }) => {
  const { settings, accounts, transactions, goals, debts, alerts, dismissAlert, isPrivacyEnabled } = useFinance();
  const [activeTab, setActiveTab] = useState<DashboardTab>('balance');
  
  // Management Modal State
  const [manageType, setManageType] = useState<'account' | 'goal' | 'debt' | null>(null);
  const [editingItem, setEditingItem] = useState<Account | Goal | Debt | undefined>(undefined);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const t = TRANSLATIONS[settings.language];

  // Helper for masking
  const displayAmount = (amount: number, currency: any) => {
      if (isPrivacyEnabled) return '••••••';
      return formatCurrency(amount, currency, settings.language);
  };

  const displayCompactAmount = (amount: number, currency: any) => {
      if (isPrivacyEnabled) return '••••••';
      const symbol = getCurrencySymbol(currency);
      const numberPart = formatNumber(amount, settings.language);
      return `${symbol} ${numberPart}`;
  };

  // Calculations
  const totalBalance = accounts.reduce((sum, acc) => {
    const details = calculateAccountDetails(acc);
    return sum + convertCurrency(details.total, acc.currency, settings.currency);
  }, 0);

  const totalDebtIOwe = debts
    .filter(d => d.type === 'i_owe')
    .reduce((sum, d) => sum + convertCurrency(calculateDebtDetails(d).total, d.currency, settings.currency), 0);

  const totalDebtOwedToMe = debts
    .filter(d => d.type === 'owes_me')
    .reduce((sum, d) => sum + convertCurrency(calculateDebtDetails(d).total, d.currency, settings.currency), 0);

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // SMART MECHANISM: Spending Pace Calculation
  const pacingData = useMemo(() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const currentDay = now.getDate();
      
      const monthlyTx = transactions.filter(tx => new Date(tx.date) >= startOfMonth && tx.type !== 'transfer');
      
      const income = monthlyTx.filter(t => t.type === 'income').reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, settings.currency), 0);
      const expenses = monthlyTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, settings.currency), 0);

      const expenseRatio = income > 0 ? (expenses / income) : 0;
      const timeRatio = currentDay / daysInMonth;
      
      // Status
      let status: 'safe' | 'warning' | 'neutral' = 'neutral';
      if (income > 0) {
          if (expenseRatio > timeRatio + 0.1) status = 'warning'; // Spending faster than time passing
          else if (expenseRatio < timeRatio) status = 'safe';
      }

      return { income, expenses, status, percent: Math.round(expenseRatio * 100) };
  }, [transactions, settings.currency]);

  const openManageModal = (type: 'account' | 'goal' | 'debt', item?: any) => {
      setManageType(type);
      setEditingItem(item);
  };

  const closeManageModal = () => {
      setManageType(null);
      setEditingItem(undefined);
  };

  const formattedTotalBalance = displayAmount(totalBalance, settings.currency);
  const balanceTextSize = fitText(formattedTotalBalance, 'text-4xl');

  return (
    <div className="px-6 pb-24 space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
          <div className="space-y-2 animate-fade-in-down">
              {alerts.map(alert => (
                  <div key={alert.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl flex items-start gap-3 relative">
                      <div className="text-yellow-600 dark:text-yellow-400 mt-1"><Bell size={18} fill="currentColor" /></div>
                      <div className="flex-1">
                          <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">{t[alert.messageKey as keyof typeof t]}</p>
                          {alert.data && <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">{alert.data}</p>}
                      </div>
                      <button onClick={() => dismissAlert(alert.id)} className="p-1 hover:bg-black/5 rounded-full text-yellow-800 dark:text-yellow-200"><X size={14} /></button>
                  </div>
              ))}
          </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl flex relative font-medium text-sm">
        {(['balance', 'goals', 'debts'] as DashboardTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl transition-all duration-300 z-10 ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {tab === 'balance' && t.tab_balance}
            {tab === 'goals' && t.tab_goals}
            {tab === 'debts' && t.tab_debts}
          </button>
        ))}
      </div>

      <div className="min-h-[60vh]">
        {activeTab === 'balance' && (
          <div className="space-y-8 animate-fade-in">
            {/* Balance Card */}
            <button 
                onClick={() => onViewHistory(undefined, 'chart')}
                className="w-full text-left bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 transition-transform active:scale-98 relative overflow-hidden"
            >
              <div className="relative z-10">
                  <span className="opacity-80 text-sm font-medium">{t.total_balance}</span>
                  <h2 className={`${balanceTextSize} font-bold mt-2 truncate transition-all duration-300`}>
                    {formattedTotalBalance}
                  </h2>
                  <div className="mt-4 flex gap-3">
                     <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-xs font-medium">
                        {accounts.length} {t.my_accounts}
                     </div>
                  </div>
              </div>
              {/* Decorative shapes */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>
            </button>

            {/* Pacing Pill */}
            {pacingData.income > 0 && (
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                    pacingData.status === 'warning' ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20' : 
                    pacingData.status === 'safe' ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20' :
                    'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                             pacingData.status === 'warning' ? 'bg-orange-100 text-orange-600' : 
                             pacingData.status === 'safe' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                        }`}>
                            <Activity size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">{t.spending_pace}</p>
                            <p className="text-sm font-semibold dark:text-white">
                                {pacingData.status === 'warning' ? t.warning_pace : pacingData.status === 'safe' ? t.safe_pace : 'Normal'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                         <span className="text-xl font-bold dark:text-white">{pacingData.percent}%</span>
                         <p className="text-[10px] text-gray-400">of income spent</p>
                    </div>
                </div>
            )}

            {/* Accounts List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.my_accounts}</h3>
                 <button onClick={() => openManageModal('account')} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1">
                    <Plus size={14} /> {t.add_account}
                 </button>
              </div>
              <div className="space-y-3">
                {accounts.map(acc => {
                  const Icon = acc.icon && IconMap[acc.icon] ? IconMap[acc.icon] : (acc.type === 'cash' ? Wallet : CreditCard);
                  const details = calculateAccountDetails(acc);
                  const hasInterest = details.interest > 0;
                  return (
                  <div key={acc.id} className="w-full bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group">
                    <button onClick={() => onViewHistory(acc.id)} className="flex-1 flex items-center gap-3 min-w-0 text-left outline-none">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0"><Icon size={20} /></div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white truncate text-base">{acc.name}</p>
                            <p className="text-xs text-gray-500 capitalize truncate">{t[`type_${acc.type}` as keyof typeof t] || acc.type} • {acc.currency}</p>
                            {hasInterest && <p className="text-[10px] text-blue-500 truncate mt-0.5">+{formatNumber(details.interest, settings.language)} {t.interest}</p>}
                        </div>
                    </button>
                    <div className="text-right flex flex-col items-end gap-1">
                        <span className={`font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap text-base sm:text-lg`}>{displayAmount(details.total, acc.currency)}</span>
                        <button onClick={(e) => { e.stopPropagation(); openManageModal('account', acc); }} className="p-1.5 text-gray-300 hover:text-blue-600 dark:text-gray-600 dark:hover:text-blue-400 transition-colors"><Pencil size={14} /></button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Movements */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.recent_activity}</h3>
              {recentTransactions.length === 0 ? <div className="text-center py-8 text-gray-400 italic">{t.no_transactions}</div> : (
                <div className="space-y-4">
                  {recentTransactions.map(tx => (
                    <button key={tx.id} onClick={() => setEditingTx(tx)} className="w-full flex items-center justify-between group text-left hover:opacity-70 transition-opacity">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                           tx.type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' : tx.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
                         }`}>{tx.type === 'expense' ? <TrendingDown size={18} /> : tx.type === 'income' ? <TrendingUp size={18} /> : <ArrowRightLeft size={18} />}</div>
                         <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{tx.title}</p>
                            <p className="text-xs text-gray-500">{formatSmartDate(tx.date, settings.language)}</p>
                         </div>
                      </div>
                      <span className={`font-bold ml-2 whitespace-nowrap ${tx.type === 'expense' ? 'text-red-500' : tx.type === 'income' ? 'text-green-500' : 'text-blue-500'}`}>
                         {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{displayAmount(tx.amount, tx.currency)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Goals & Debts Views (Simplified for brevity, logic remains from previous step) */}
        {activeTab === 'goals' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.your_goals}</h3>
                <button onClick={() => openManageModal('goal')} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"><Plus size={14} /> {t.add_goal}</button>
             </div>
             {goals.length === 0 ? <div className="text-center py-10 text-gray-400"><Target size={48} className="mx-auto mb-2 opacity-30" /><p>No active goals yet.</p></div> : goals.map(goal => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
                  const Icon = goal.icon && IconMap[goal.icon] ? IconMap[goal.icon] : Target;
                  return (
                    <button key={goal.id} onClick={() => openManageModal('goal', goal)} className="w-full text-left bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex justify-between mb-2 items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Icon size={18} /></div>
                            <span className="font-bold text-lg dark:text-white truncate max-w-[150px]">{goal.name}</span>
                        </div>
                        <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3"><div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div></div>
                      <div className="flex justify-between text-sm flex-wrap gap-1"><span className="text-gray-500">{t.missing} <span className="text-gray-900 dark:text-white font-medium">{displayAmount(remaining, goal.currency)}</span></span><span className="text-gray-400">{t.target}: {displayAmount(goal.targetAmount, goal.currency)}</span></div>
                    </button>
                  );
                })}
          </div>
        )}

        {activeTab === 'debts' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.tab_debts}</h3>
                 <button onClick={() => openManageModal('debt')} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"><Plus size={14} /> {t.add_debt}</button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20 overflow-hidden">
                   <p className="text-green-600 text-sm font-medium mb-1 truncate">{t.owe_me}</p>
                   <p className="text-2xl font-bold text-green-700 dark:text-green-500 truncate">{displayCompactAmount(totalDebtOwedToMe, settings.currency)}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20 overflow-hidden">
                   <p className="text-red-600 text-sm font-medium mb-1 truncate">{t.i_owe}</p>
                   <p className="text-2xl font-bold text-red-700 dark:text-red-500 truncate">{displayCompactAmount(totalDebtIOwe, settings.currency)}</p>
                </div>
             </div>
             <div className="space-y-4">
                {debts.map(debt => {
                  const Icon = debt.icon && IconMap[debt.icon] ? IconMap[debt.icon] : Users;
                  const details = calculateDebtDetails(debt);
                  return (
                  <button key={debt.id} onClick={() => openManageModal('debt', debt)} className="w-full text-left flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border-l-4 border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" style={{ borderLeftColor: debt.type === 'i_owe' ? '#EF4444' : '#22C55E'}}>
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 shrink-0"><Icon size={18} /></div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate">{debt.personName}</p>
                            <p className="text-xs text-gray-500 truncate">{debt.description || t.debt_person}</p>
                        </div>
                     </div>
                     <div className="text-right pl-2 shrink-0"><p className={`font-bold whitespace-nowrap ${debt.type === 'i_owe' ? 'text-red-500' : 'text-green-500'}`}>{displayAmount(details.total, debt.currency)}</p></div>
                  </button>
                  );
                })}
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-0 w-full px-6 flex justify-center z-50">
         <button onClick={onAddRecord} className="bg-gray-900 dark:bg-white dark:text-black text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <Plus size={24} strokeWidth={3} /> {t.new_record}
         </button>
      </div>

      {manageType && <ManageEntityModal type={manageType} initialData={editingItem} onClose={closeManageModal} />}
      {editingTx && <AddRecordModal onClose={() => setEditingTx(null)} initialData={editingTx} />}
    </div>
  );
};
