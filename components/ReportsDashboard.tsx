import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS } from '../constants';
import { formatCurrency, convertCurrency } from '../services/financeService';
import { Transaction } from '../types';

interface ReportsDashboardProps {
  filteredTransactions: Transaction[];
}

const SimpleLineChart = ({ data, color }: { data: number[], color: string }) => {
    if (data.length < 2) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-32 mt-4 relative">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                 <polyline 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="2" 
                    points={points} 
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                 />
                 {/* Gradient Area */}
                 <polyline 
                    fill={color} 
                    fillOpacity="0.1"
                    stroke="none"
                    points={`0,100 ${points} 100,100`} 
                    vectorEffect="non-scaling-stroke"
                 />
             </svg>
             <div className="flex justify-between text-[10px] text-gray-400 mt-1 absolute -bottom-4 w-full">
                 <span>Start</span>
                 <span>End</span>
             </div>
        </div>
    );
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
                    // Fix full circle case
                    const pathData = angle === 360 
                        ? "M 50 10 A 40 40 0 1 1 49.99 10" 
                        : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    
                    const element = (
                        <path key={i} d={pathData} fill={item.color} stroke="white" strokeWidth="1" className="dark:stroke-gray-900 transition-all hover:opacity-80" />
                    );
                    
                    currentAngle += angle;
                    return element;
                })}
                <circle cx="50" cy="50" r="25" className="fill-white dark:fill-gray-900" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-xs font-bold text-gray-500">DIST</span>
            </div>
        </div>
    );
};

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ filteredTransactions }) => {
    const { settings, categories } = useFinance();
    const t = TRANSLATIONS[settings.language];

    // 1. Calculate Balance Evolution
    // We start from 0 and simulate the balance change over time based on the filtered transactions
    // Note: Ideally we should know the starting balance of the filtered range, but for a simple "Evolution" trend,
    // cumulating the deltas in the range is often sufficient for visual trend.
    
    // Sort chronological
    const sortedTx = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;
    const balanceHistory = sortedTx.map(tx => {
        const amount = convertCurrency(tx.amount, tx.currency, settings.currency);
        if (tx.type === 'income') runningBalance += amount;
        if (tx.type === 'expense') runningBalance -= amount;
        // Transfers inside the same view might cancel out if we view 'all accounts', 
        // but if we view one account, transfers out are neg, transfers in are pos.
        // For simplicity in this general view:
        if (tx.type === 'transfer') {
             // If we are looking at specific account logic, it's complex. 
             // Global view: Transfers don't change net worth. 
             // But let's assume this graph shows "Cash Flow" impact if viewed globally? 
             // Or let's just track Net Worth change. 
             // Transfers = 0 change globally.
        }
        return runningBalance;
    });

    // 2. Calculate Category Distribution (Donut)
    // Group by Income vs Expense first
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const income = filteredTransactions.filter(t => t.type === 'income');
    
    const expenseTotal = expenses.reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, settings.currency), 0);
    const incomeTotal = income.reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, settings.currency), 0);

    const chartData = categories
        .filter(c => c.type === 'expense')
        .map(cat => {
            const val = expenses
                .filter(tx => tx.category === cat.key)
                .reduce((sum, tx) => sum + convertCurrency(tx.amount, tx.currency, settings.currency), 0);
            return {
                label: t[cat.key as keyof typeof t] || cat.key,
                value: val,
                color: cat.color.replace('text-', 'text-').replace('bg-', '') // Hacky: Extract color from tailwind class or just generate
                // Better: Use a fixed palette or map
            };
        })
        .filter(d => d.value > 0)
        .map((d, i) => ({
            ...d,
            // Generate a real hex color for SVG based on index
            color: `hsl(${(i * 137.5) % 360}, 70%, 60%)`
        }));

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            
            {/* Balance Evolution Card */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-lg dark:text-white mb-1">{t.balance_evolution}</h3>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-xs text-gray-500">Net Change</p>
                        <p className={`text-2xl font-bold ${runningBalance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                            {runningBalance >= 0 ? '+' : ''}{formatCurrency(runningBalance, settings.currency, settings.language)}
                        </p>
                    </div>
                </div>
                {balanceHistory.length > 1 ? (
                    <SimpleLineChart data={balanceHistory} color={runningBalance >= 0 ? '#2563EB' : '#EF4444'} />
                ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                        Not enough data for chart
                    </div>
                )}
            </div>

            {/* Income vs Expense Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
                     <p className="text-green-600 text-xs font-bold uppercase mb-1">{t.income}</p>
                     <p className="text-xl font-bold text-green-700 dark:text-green-500 truncate">
                        {formatCurrency(incomeTotal, settings.currency, settings.language)}
                     </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                     <p className="text-red-600 text-xs font-bold uppercase mb-1">{t.expense}</p>
                     <p className="text-xl font-bold text-red-700 dark:text-red-500 truncate">
                        {formatCurrency(expenseTotal, settings.currency, settings.language)}
                     </p>
                </div>
            </div>

            {/* Category Donut */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                 <h3 className="text-center font-bold text-lg mb-2 dark:text-white">{t.distribution}</h3>
                 <DonutChart data={chartData} />
                 
                 <div className="space-y-3 mt-6">
                     {chartData.sort((a,b) => b.value - a.value).map((item, i) => (
                         <div key={i} className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
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
    );
};
