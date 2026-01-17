import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS } from '../constants';
import { formatCurrency, formatDate, convertCurrency } from '../services/financeService';
import { Search, Filter, ArrowUpLeft, PieChart, List, Briefcase, Laptop, Gift, TrendingUp, Utensils, Car, Zap, Film, ShoppingBag, Heart, BookOpen, Home, MoreHorizontal } from 'lucide-react';

const IconMap: { [key: string]: any } = {
  Briefcase, Laptop, Gift, TrendingUp, Utensils, Car, Zap, Film, ShoppingBag, Heart, BookOpen, Home, MoreHorizontal
};

const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    if (total === 0) return <div className="h-40 flex items-center justify-center text-gray-400">No data</div>;

    return (
        <div className="relative w-48 h-48 mx-auto my-6">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {data.map((item, i) => {
                    const angle = (item.value / total) * 360;
                    const x1 = 50 + 40 * Math.cos((Math.PI * currentAngle) / 180);
                    const y1 = 50 + 40 * Math.sin((Math.PI * currentAngle) / 180);
                    const x2 = 50 + 40 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
                    const y2 = 50 + 40 * Math.sin((Math.PI * (currentAngle + angle)) / 180);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    
                    // Simple color mapping based on index if specific hex not provided
                    const fill = `hsl(${(i * 360) / data.length}, 70%, 60%)`;
                    
                    const element = (
                        <path key={i} d={pathData} fill={fill} stroke="white" strokeWidth="1" className="dark:stroke-gray-900 transition-all hover:opacity-80" />
                    );
                    
                    currentAngle += angle;
                    return element;
                })}
                <circle cx="50" cy="50" r="25" className="fill-white dark:fill-black" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-xs font-bold text-gray-500">EXPENSES</span>
            </div>
        </div>
    );
};

export const History: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { settings, transactions, accounts, categories } = useFinance();
  const t = TRANSLATIONS[settings.language];
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  const filteredTransactions = transactions.filter(tx => 
    tx.title.toLowerCase().includes(filter.toLowerCase()) || 
    tx.description?.toLowerCase().includes(filter.toLowerCase())
  );

  // Prepare Chart Data
  const chartData = categories
    .filter(c => c.type === 'expense')
    .map(cat => {
        const total = filteredTransactions
            .filter(tx => tx.category === cat.key && tx.type === 'expense')
            .reduce((sum, tx) => sum + convertCurrency(tx.amount, tx.currency, settings.currency), 0);
        return {
            label: t[cat.key as keyof typeof t] || cat.key,
            value: total,
            color: cat.color
        };
    })
    .filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50 dark:bg-black py-4 z-10">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800">
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

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder={t.search}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
        <button className="bg-white dark:bg-gray-900 p-3 rounded-xl text-gray-600 dark:text-gray-300">
           <Filter size={20} />
        </button>
      </div>

      {viewMode === 'chart' ? (
          <div className="animate-fade-in space-y-6">
             <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm">
                 <h3 className="text-center font-bold text-lg mb-2 dark:text-white">{t.expenses_by_category}</h3>
                 <DonutChart data={chartData} />
                 
                 <div className="space-y-3 mt-6">
                     {chartData.sort((a,b) => b.value - a.value).map((item, i) => (
                         <div key={i} className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${(i * 360) / chartData.length}, 70%, 60%)` }} />
                                 <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                             </div>
                             <span className="font-bold text-gray-900 dark:text-white">
                                 {formatCurrency(item.value, settings.currency, settings.language)}
                             </span>
                         </div>
                     ))}
                 </div>
             </div>
          </div>
      ) : (
        <div className="space-y-4 pb-12 animate-fade-in">
            {filteredTransactions.map(tx => {
            const accName = accounts.find(a => a.id === tx.accountId)?.name || 'Unknown';
            const cat = categories.find(c => c.key === tx.category);
            const Icon = cat ? (IconMap[cat.icon] || MoreHorizontal) : MoreHorizontal;

            return (
                <div key={tx.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm flex justify-between items-start">
                <div className="flex-1 flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cat?.color || 'bg-gray-100 text-gray-500'} bg-opacity-20`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-400">{formatDate(tx.date, settings.language)}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">{tx.title}</h4>
                        <div className="flex gap-2 text-xs text-gray-500 mt-1">
                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{accName}</span>
                            {cat && <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{t[cat.key as keyof typeof t]}</span>}
                        </div>
                    </div>
                </div>
                <div className={`ml-4 font-bold text-lg whitespace-nowrap self-center ${
                    tx.type === 'expense' ? 'text-red-500' : tx.type === 'income' ? 'text-green-500' : 'text-gray-500'
                }`}>
                    {tx.type === 'expense' ? '-' : '+'}
                    {formatCurrency(tx.amount, tx.currency, settings.language)}
                </div>
                </div>
            );
            })}
        </div>
      )}
    </div>
  );
};
