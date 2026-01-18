
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS } from '../constants';
import { formatCurrency, convertCurrency } from '../services/financeService';
import { Budget } from '../types';
import { IconMap } from './icons';
import { Pencil, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface BudgetCardProps {
    budget: Budget;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
    const { settings, categories, transactions, deleteBudget, updateBudget } = useFinance();
    const t = TRANSLATIONS[settings.language];
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(budget.limit.toString());

    // Calculate spend
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Sum transactions for this category in this month
    const spent = transactions
        .filter(tx => 
            tx.category === budget.categoryId && 
            tx.type === 'expense' && 
            new Date(tx.date) >= startOfMonth
        )
        .reduce((sum, tx) => sum + convertCurrency(tx.amount, tx.currency, budget.currency), 0);
    
    const percentage = Math.min((spent / budget.limit) * 100, 100);
    const remaining = Math.max(budget.limit - spent, 0);

    // Color logic
    let progressColor = 'bg-green-500';
    if (percentage > 75) progressColor = 'bg-yellow-500';
    if (percentage > 95) progressColor = 'bg-red-500';

    const categoryDef = categories.find(c => c.key === budget.categoryId);
    const Icon = categoryDef ? (IconMap[categoryDef.icon] || IconMap.Wallet) : IconMap.Wallet;
    const catName = categoryDef ? (t[categoryDef.key as keyof typeof t] || categoryDef.key) : 'Unknown';

    const handleSave = () => {
        const val = parseFloat(editAmount);
        if (val > 0) {
            updateBudget({ ...budget, limit: val });
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
             <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-in">
                 <div className="flex justify-between items-center mb-4">
                     <span className="font-bold text-gray-900 dark:text-white text-lg">{t.edit_budget}</span>
                     <button onClick={() => setIsEditing(false)}><X size={24} className="text-gray-400" /></button>
                 </div>
                 <div className="mb-6">
                     <label className="text-sm font-semibold text-gray-500 mb-2 block">{catName} Limit</label>
                     <input 
                       type="number"
                       value={editAmount}
                       onChange={(e) => setEditAmount(e.target.value)}
                       className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-lg"
                     />
                 </div>
                 <div className="flex gap-3">
                     <button onClick={() => deleteBudget(budget.id)} className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl"><Trash2 size={22}/></button>
                     <Button size="lg" onClick={handleSave} className="flex-1 text-lg font-bold">{t.save}</Button>
                 </div>
             </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative group">
            <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 text-gray-300 hover:text-blue-500 dark:text-gray-600 transition-colors">
                <Pencil size={18} />
            </button>

            <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${categoryDef?.color || 'bg-gray-100 text-gray-500'} bg-opacity-20`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{catName}</h4>
                    <p className="text-base text-gray-500 font-medium mt-0.5">{t.budget_limit}: <span className="text-gray-800 dark:text-gray-300 font-bold">{formatCurrency(budget.limit, budget.currency, settings.language)}</span></p>
                </div>
            </div>

            <div className="h-5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                <div 
                    className={`h-full ${progressColor} transition-all duration-1000 ease-out`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>

            <div className="flex justify-between text-base font-semibold">
                <span className={`${percentage > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                    {t.spent}: {formatCurrency(spent, budget.currency, settings.language)}
                </span>
                <span className="text-gray-400">
                    {t.remaining}: {formatCurrency(remaining, budget.currency, settings.language)}
                </span>
            </div>
        </div>
    );
};
