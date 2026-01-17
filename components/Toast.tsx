
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { X } from 'lucide-react';

export const Toast: React.FC = () => {
    const { toast, hideToast } = useFinance();

    if (!toast) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up w-[90%] max-w-sm">
            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4">
                <span className="font-medium text-sm">{toast.message}</span>
                <div className="flex items-center gap-3">
                    {toast.actionLabel && (
                        <button 
                            onClick={toast.onAction}
                            className="text-blue-400 dark:text-blue-600 font-bold text-sm hover:underline"
                        >
                            {toast.actionLabel}
                        </button>
                    )}
                    <button onClick={hideToast} className="text-gray-500 dark:text-gray-400">
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
