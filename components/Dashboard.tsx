import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS } from '../constants';
import { formatCurrency, convertCurrency, formatDate } from '../services/financeService';
import { Plus, Wallet, Target, CreditCard, TrendingUp, TrendingDown, ArrowRight, Bell, X, Edit2 } from 'lucide-react';
import { Account, Goal, Debt } from '../types';
import { ManageEntityModal } from './ManageEntityModal';

type DashboardTab = 'balance' | 'goals' | 'debts';

export const Dashboard: React.FC<{ onAddRecord: () => void }> = ({ onAddRecord }) => {
  const { settings, accounts, transactions, goals, debts, alerts, dismissAlert } = useFinance();
  const [activeTab, setActiveTab] = useState<DashboardTab>('balance');
  
  // Management Modal State
  const [manageType, setManageType] = useState<'account' | 'goal' | 'debt' | null>(null);
  const [editingItem, setEditingItem] = useState<Account | Goal | Debt | undefined>(undefined);

  const t = TRANSLATIONS[settings.language];

  // Calculations
  const totalBalance = accounts.reduce((sum, acc) => {
    return sum + convertCurrency(acc.balance, acc.currency, settings.currency);
  }, 0);

  const totalDebtIOwe = debts
    .filter(d => d.type === 'i_owe')
    .reduce((sum, d) => sum + convertCurrency(d.amount, d.currency, settings.currency), 0);

  const totalDebtOwedToMe = debts
    .filter(d => d.type === 'owes_me')
    .reduce((sum, d) => sum + convertCurrency(d.amount, d.currency, settings.currency), 0);

  const recentTransactions = transactions.slice(0, 5);

  const openManageModal = (type: 'account' | 'goal' | 'debt', item?: any) => {
      setManageType(type);
      setEditingItem(item);
  };

  const closeManageModal = () => {
      setManageType(null);
      setEditingItem(undefined);
  };

  return (
    <div className="px-6 pb-24 space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
          <div className="space-y-2 animate-fade-in-down">
              {alerts.map(alert => (
                  <div key={alert.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl flex items-start gap-3 relative">
                      <div className="text-yellow-600 dark:text-yellow-400 mt-1">
                          <Bell size={18} fill="currentColor" />
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                             {t[alert.messageKey as keyof typeof t]}
                          </p>
                          {alert.data && <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">{alert.data}</p>}
                      </div>
                      <button 
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 hover:bg-black/5 rounded-full text-yellow-800 dark:text-yellow-200"
                      >
                          <X size={14} />
                      </button>
                  </div>
              ))}
          </div>
      )}

      {/* Custom Segmented Control */}
      <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl flex relative font-medium text-sm">
        {(['balance', 'goals', 'debts'] as DashboardTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl transition-all duration-300 z-10 ${
              activeTab === tab 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'balance' && t.tab_balance}
            {tab === 'goals' && t.tab_goals}
            {tab === 'debts' && t.tab_debts}
          </button>
        ))}
      </div>

      <div className="min-h-[60vh]">
        {/* BALANCE VIEW */}
        {activeTab === 'balance' && (
          <div className="space-y-8 animate-fade-in">
            {/* Big Total */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
              <span className="opacity-80 text-sm font-medium">{t.total_balance}</span>
              <h2 className="text-4xl font-bold mt-2">
                {formatCurrency(totalBalance, settings.currency, settings.language)}
              </h2>
              <div className="mt-4 flex gap-3">
                 <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-xs font-medium">
                    {accounts.length} {t.my_accounts}
                 </div>
              </div>
            </div>

            {/* Accounts List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.my_accounts}</h3>
                 <button 
                    onClick={() => openManageModal('account')}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                 >
                    <Plus size={14} /> {t.add_account}
                 </button>
              </div>
              <div className="space-y-3">
                {accounts.map(acc => (
                  <button 
                    key={acc.id} 
                    onClick={() => openManageModal('account', acc)}
                    className="w-full bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {acc.type === 'cash' ? <Wallet size={20} /> : <CreditCard size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{acc.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{acc.type} • {acc.currency}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {formatCurrency(acc.balance, acc.currency, settings.language)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Movements */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.recent_activity}</h3>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic">
                  {t.no_transactions}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                           tx.type === 'expense' 
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/20' 
                            : tx.type === 'income' 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                         }`}>
                           {tx.type === 'expense' ? <TrendingDown size={18} /> : tx.type === 'income' ? <TrendingUp size={18} /> : <ArrowRight size={18} />}
                         </div>
                         <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{tx.title}</p>
                            <p className="text-xs text-gray-500">{formatDate(tx.date, settings.language)}</p>
                         </div>
                      </div>
                      <span className={`font-bold ${
                        tx.type === 'expense' ? 'text-red-500' : tx.type === 'income' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                         {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency, settings.language)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GOALS VIEW */}
        {activeTab === 'goals' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.your_goals}</h3>
                <button 
                    onClick={() => openManageModal('goal')}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                 >
                    <Plus size={14} /> {t.add_goal}
                 </button>
             </div>
             
             {goals.length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                  <Target size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No active goals yet.</p>
               </div>
             ) : (
                goals.map(goal => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
                  
                  return (
                    <button 
                        key={goal.id} 
                        onClick={() => openManageModal('goal', goal)}
                        className="w-full text-left bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-lg dark:text-white">{goal.name}</span>
                        <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
                      </div>
                      
                      <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                         <div 
                           className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                           style={{ width: `${progress}%` }}
                         ></div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t.missing} <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(remaining, goal.currency, settings.language)}</span></span>
                        <span className="text-gray-400">{t.target}: {formatCurrency(goal.targetAmount, goal.currency, settings.language)}</span>
                      </div>
                    </button>
                  );
                })
             )}
          </div>
        )}

        {/* DEBTS VIEW */}
        {activeTab === 'debts' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.tab_debts}</h3>
                 <button 
                    onClick={() => openManageModal('debt')}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                 >
                    <Plus size={14} /> {t.add_debt}
                 </button>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
                   <p className="text-green-600 text-sm font-medium mb-1">{t.owe_me}</p>
                   <p className="text-2xl font-bold text-green-700 dark:text-green-500">
                     {formatCurrency(totalDebtOwedToMe, settings.currency, settings.language)}
                   </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                   <p className="text-red-600 text-sm font-medium mb-1">{t.i_owe}</p>
                   <p className="text-2xl font-bold text-red-700 dark:text-red-500">
                     {formatCurrency(totalDebtIOwe, settings.currency, settings.language)}
                   </p>
                </div>
             </div>

             <div className="space-y-4">
                {debts.map(debt => (
                  <button 
                    key={debt.id} 
                    onClick={() => openManageModal('debt', debt)}
                    className="w-full text-left flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border-l-4 border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" 
                    style={{ borderLeftColor: debt.type === 'i_owe' ? '#EF4444' : '#22C55E'}}
                  >
                     <div>
                        <p className="font-bold text-gray-900 dark:text-white">{debt.personName}</p>
                        <p className="text-xs text-gray-500">{debt.description || t.debt_person}</p>
                     </div>
                     <div className="text-right">
                        <p className={`font-bold ${debt.type === 'i_owe' ? 'text-red-500' : 'text-green-500'}`}>
                           {formatCurrency(debt.amount, debt.currency, settings.language)}
                        </p>
                     </div>
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Persistent FAB */}
      <div className="fixed bottom-6 left-0 w-full px-6 flex justify-center z-50">
         <button 
           onClick={onAddRecord}
           className="bg-gray-900 dark:bg-white dark:text-black text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
         >
            <Plus size={24} strokeWidth={3} />
            {t.new_record}
         </button>
      </div>

      {manageType && (
          <ManageEntityModal 
            type={manageType} 
            initialData={editingItem} 
            onClose={closeManageModal} 
          />
      )}
    </div>
  );
};
