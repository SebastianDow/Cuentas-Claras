import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS } from '../constants';
import { formatCurrency, formatSmartDate, dateFromInput } from '../services/financeService';
import { Search, ArrowUpLeft, PieChart, List, MoreHorizontal, ArrowRight, ArrowRightLeft, Filter, Calendar, X, ChevronDown } from 'lucide-react';
import { AddRecordModal } from './AddRecordModal';
import { Transaction, FilterState } from '../types';
import { IconMap } from './icons';
import { ReportsDashboard } from './ReportsDashboard';

interface HistoryProps {
    onBack: () => void;
    initialAccountId?: string;
    initialViewMode?: 'list' | 'chart';
}

export const History: React.FC<HistoryProps> = ({ onBack, initialAccountId, initialViewMode = 'list' }) => {
  const { settings, transactions, accounts, categories, goals, debts } = useFinance();
  const t = TRANSLATIONS[settings.language];
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'chart'>(initialViewMode);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  
  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Complex Filter Object
  const [filters, setFilters] = useState<FilterState>({
      dateRange: { start: null, end: null },
      entityType: initialAccountId ? 'account' : 'all',
      entityId: initialAccountId || 'all',
      category: 'all',
      transactionType: 'all'
  });

  const resetFilters = () => {
      setFilters({
        dateRange: { start: null, end: null },
        entityType: 'all',
        entityId: 'all',
        category: 'all',
        transactionType: 'all'
      });
      setSearchTerm('');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
        // 1. Search Text
        const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              tx.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 2. Date Range
        let matchesDate = true;
        if (filters.dateRange.start) {
            matchesDate = matchesDate && new Date(tx.date) >= new Date(filters.dateRange.start);
        }
        if (filters.dateRange.end) {
            // End of the day
            const endDate = new Date(filters.dateRange.end);
            endDate.setHours(23,59,59);
            matchesDate = matchesDate && new Date(tx.date) <= endDate;
        }

        // 3. Category (Independent)
        const matchesCategory = filters.category === 'all' || tx.category === filters.category;

        // 4. Transaction Type
        const matchesType = filters.transactionType === 'all' || tx.type === filters.transactionType;

        // 5. Entity Logic (Smart Filter)
        let matchesEntity = true;
        if (filters.entityId !== 'all') {
             matchesEntity = tx.accountId === filters.entityId || tx.toAccountId === filters.entityId;
        } else if (filters.entityType !== 'all') {
             // Filter by Group (All Accounts vs All Goals vs All Debts)
             if (filters.entityType === 'account') {
                 matchesEntity = accounts.some(a => a.id === tx.accountId || a.id === tx.toAccountId);
             } else if (filters.entityType === 'goal') {
                 matchesEntity = goals.some(g => g.id === tx.accountId);
             } else if (filters.entityType === 'debt') {
                 // Debts usually don't have direct transactions in this model yet unless linked, 
                 // but for robustness we check id matches
                 matchesEntity = debts.some(d => d.id === tx.accountId);
             }
        }

        return matchesSearch && matchesDate && matchesCategory && matchesType && matchesEntity;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filters, accounts, goals, debts]);


  // Helper to render entity selection options based on type
  const renderEntityOptions = () => {
      if (filters.entityType === 'all') return null;
      
      let options: {id: string, name: string}[] = [];
      if (filters.entityType === 'account') options = accounts;
      if (filters.entityType === 'goal') options = goals;
      if (filters.entityType === 'debt') options = debts.map(d => ({id: d.id, name: d.personName}));

      if (options.length === 0) return null;

      return (
          <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] uppercase text-gray-500 font-bold ml-1 mb-1 block">{t.specific_item}</label>
              <div className="relative">
                <select
                    value={filters.entityId}
                    onChange={(e) => setFilters(prev => ({...prev, entityId: e.target.value}))}
                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm appearance-none outline-none text-gray-900 dark:text-white"
                >
                    <option value="all">{t.all_entities}</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 animate-fade-in pb-safe-bottom">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 dark:bg-black py-2 z-10">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
               <ArrowUpLeft className="text-gray-900 dark:text-white" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.history}</h2>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
            <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
                <List size={20} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-500'} />
            </button>
            <button 
                onClick={() => setViewMode('chart')}
                className={`p-2 rounded-md ${viewMode === 'chart' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
                <PieChart size={20} className={viewMode === 'chart' ? 'text-blue-600' : 'text-gray-500'} />
            </button>
        </div>
      </div>

      {/* SMART FILTERS SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-6 space-y-4">
          {/* Search & Expand Toggle */}
          <div className="flex gap-3">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm"
                />
             </div>
             <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
             >
                 <Filter size={18} />
             </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
              <div className="space-y-4 animate-fade-in pt-2 border-t border-gray-100 dark:border-gray-800">
                  
                  {/* Row 1: Date Range */}
                  <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">{t.date_range}</label>
                        {(filters.dateRange.start || filters.dateRange.end) && (
                            <button 
                                onClick={() => setFilters(prev => ({...prev, dateRange: {start: null, end: null}}))}
                                className="text-[10px] text-blue-500 font-bold"
                            >
                                {t.clear_dates}
                            </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                          <div className="relative flex-1">
                             <input 
                                type="date"
                                value={filters.dateRange.start || ''}
                                onChange={(e) => setFilters(prev => ({...prev, dateRange: {...prev.dateRange, start: e.target.value}}))}
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none text-gray-900 dark:text-white"
                             />
                          </div>
                          <span className="text-gray-400 self-center">-</span>
                          <div className="relative flex-1">
                             <input 
                                type="date"
                                value={filters.dateRange.end || ''}
                                onChange={(e) => setFilters(prev => ({...prev, dateRange: {...prev.dateRange, end: e.target.value}}))}
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none text-gray-900 dark:text-white"
                             />
                          </div>
                      </div>
                  </div>

                  {/* Row 2: Entity Logic */}
                  <div className="flex gap-2 flex-wrap">
                      <div className="flex-1 min-w-[120px]">
                          <label className="text-[10px] uppercase text-gray-500 font-bold ml-1 mb-1 block">{t.entity_type}</label>
                          <div className="relative">
                            <select
                                value={filters.entityType}
                                onChange={(e) => setFilters(prev => ({...prev, entityType: e.target.value as any, entityId: 'all'}))}
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm appearance-none outline-none text-gray-900 dark:text-white"
                            >
                                <option value="all">{t.all_entities}</option>
                                <option value="account">{t.all_accounts}</option>
                                <option value="goal">{t.all_goals}</option>
                                <option value="debt">{t.all_debts}</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                      </div>
                      {renderEntityOptions()}
                  </div>

                  {/* Row 3: Category & Type */}
                  <div className="flex gap-2">
                      <div className="flex-1">
                          <label className="text-[10px] uppercase text-gray-500 font-bold ml-1 mb-1 block">{t.category}</label>
                          <div className="relative">
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm appearance-none outline-none text-gray-900 dark:text-white"
                            >
                                <option value="all">{t.all_entities}</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.key}>{t[c.key as keyof typeof t] || c.key}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                      </div>
                      <div className="flex-1">
                          <label className="text-[10px] uppercase text-gray-500 font-bold ml-1 mb-1 block">{t.type}</label>
                          <div className="relative">
                            <select
                                value={filters.transactionType}
                                onChange={(e) => setFilters(prev => ({...prev, transactionType: e.target.value as any}))}
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm appearance-none outline-none text-gray-900 dark:text-white"
                            >
                                <option value="all">{t.all_entities}</option>
                                <option value="income">{t.income}</option>
                                <option value="expense">{t.expense}</option>
                                <option value="transfer">{t.transfer}</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={resetFilters}
                    className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                  >
                      Reset All Filters
                  </button>
              </div>
          )}
      </div>

      {viewMode === 'chart' ? (
          <ReportsDashboard filteredTransactions={filteredTransactions} />
      ) : (
        <div className="space-y-4 pb-12 animate-fade-in">
            {filteredTransactions.map(tx => {
            const isTransfer = tx.type === 'transfer';
            const accName = accounts.find(a => a.id === tx.accountId)?.name || 'Unknown';
            const toAccName = isTransfer ? (accounts.find(a => a.id === tx.toAccountId)?.name || 'Unknown') : '';
            
            // Handle Category Icon safely
            let Icon = MoreHorizontal;
            let categoryLabel = '';
            let colorClass = 'bg-gray-100 text-gray-500';

            if (isTransfer) {
                Icon = ArrowRightLeft;
                categoryLabel = t.transfer;
                colorClass = 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            } else {
                const cat = categories.find(c => c.key === tx.category);
                if (cat) {
                    Icon = IconMap[cat.icon] || MoreHorizontal;
                    categoryLabel = t[cat.key as keyof typeof t] || cat.key;
                    colorClass = cat.color;
                }
            }

            return (
                <button 
                  key={tx.id} 
                  onClick={() => setEditingTx(tx)}
                  className="w-full bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm flex justify-between items-start text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
                >
                <div className="flex-1 flex gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass} bg-opacity-20`}>
                        <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-gray-400">{formatSmartDate(tx.date, settings.language)}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base truncate">{tx.title}</h4>
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex gap-2 text-xs text-gray-500 overflow-hidden">
                                {isTransfer ? (
                                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded truncate max-w-full">
                                        {accName} <ArrowRight size={10} /> {toAccName}
                                    </span>
                                ) : (
                                    <>
                                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded truncate max-w-[50%]">{accName}</span>
                                        {categoryLabel && <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded truncate max-w-[50%]">{categoryLabel}</span>}
                                    </>
                                )}
                            </div>
                            {tx.description && <p className="text-xs text-gray-400 line-clamp-1">{tx.description}</p>}
                        </div>
                    </div>
                </div>
                <div className={`ml-4 font-bold text-lg whitespace-nowrap self-center ${
                    tx.type === 'expense' ? 'text-red-500' : tx.type === 'income' ? 'text-green-500' : 'text-blue-500'
                }`}>
                    {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                    {formatCurrency(tx.amount, tx.currency, settings.language)}
                </div>
                </button>
            );
            })}
            
            {filteredTransactions.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    <p>No transactions found.</p>
                </div>
            )}
        </div>
      )}

      {editingTx && (
          <AddRecordModal onClose={() => setEditingTx(null)} initialData={editingTx} />
      )}
    </div>
  );
};
