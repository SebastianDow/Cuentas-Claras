import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES } from '../constants';
import { getGreetingKey } from '../services/financeService';
import { Settings, History, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { Currency } from '../types';

interface HeaderProps {
  currentTab: 'dashboard' | 'history' | 'settings';
  onTabChange: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { settings, isPrivacyEnabled, togglePrivacyMode, updateSettings } = useFinance();
  const t = TRANSLATIONS[settings.language];
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const greeting = t[getGreetingKey()];

  if (currentTab !== 'dashboard') return null;

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out px-6 pt-safe-top mb-4 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-black/90 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800 pb-4 pt-4' 
          : 'bg-transparent pb-4 pt-10' // Increased top padding
      }`}
    >
      <div className="flex justify-between items-center mt-2 w-full">
        {/* Left: Text Container with Flex constraints to prevent pushing buttons */}
        <div className={`flex flex-col transition-all duration-300 flex-1 min-w-0 pr-4 ${isScrolled ? 'scale-95 origin-top-left' : 'scale-100'}`}>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider leading-none mb-1">
            {greeting}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white truncate leading-tight">
            {settings.name}
          </h1>
        </div>
        
        {/* Right: Buttons Container (Fixed width/No shrink) */}
        <div className="flex items-center gap-2 shrink-0">
            {/* Currency Switcher (Hidden Native Select) */}
            <div className="relative">
                <button 
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  {settings.currency}
                </button>
                <select 
                   value={settings.currency}
                   onChange={(e) => updateSettings({ currency: e.target.value as Currency })}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                    {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <button 
              onClick={togglePrivacyMode}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-center"
              aria-label="Toggle Privacy"
            >
              {isPrivacyEnabled ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
            </button>
            <button 
              onClick={() => onTabChange('history')}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-center"
              aria-label="History"
            >
              <History size={18} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => onTabChange('settings')}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-center"
              aria-label="Settings"
            >
              <Settings size={18} strokeWidth={2.5} />
            </button>
        </div>
      </div>
    </header>
  );
};
