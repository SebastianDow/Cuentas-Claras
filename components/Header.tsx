
import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES } from '../constants';
import { getGreetingKey } from '../services/financeService';
import { Settings, History, Eye, EyeOff } from 'lucide-react';
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

  // Reusable Expanding Button Component
  const HeaderButton = ({ onClick, icon: Icon, label, active = false }: any) => (
    <button 
      onClick={onClick}
      className={`
        group flex items-center justify-center gap-0 hover:gap-2
        h-10 px-3 rounded-full transition-all duration-300 ease-out
        ${active ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
        shadow-sm hover:pr-4 w-10 hover:w-auto overflow-hidden
      `}
      title={label}
    >
      <Icon size={20} strokeWidth={2.5} className="shrink-0" />
      <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 whitespace-nowrap text-xs font-bold hidden md:block">
        {label}
      </span>
    </button>
  );

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out px-6 pt-safe-top mb-2 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800 pb-3 pt-3' 
          : 'bg-transparent pb-4 pt-8'
      }`}
    >
      <div className="flex justify-between items-center mt-2 w-full">
        {/* Left: Text Container */}
        <div className={`flex flex-col transition-all duration-300 flex-1 min-w-0 pr-4 ${isScrolled ? 'scale-95 origin-top-left' : 'scale-100'}`}>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider leading-none mb-1">
            {greeting}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white truncate leading-tight">
            {settings.name}
          </h1>
        </div>
        
        {/* Right: Buttons Container */}
        <div className="flex items-center gap-2 shrink-0">
            {/* Currency Switcher */}
            <div className="relative group">
                <button 
                  className="flex items-center justify-center gap-0 hover:gap-2 h-10 px-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm w-10 hover:w-auto overflow-hidden"
                >
                  <span className="text-xs font-black shrink-0">{settings.currency}</span>
                  <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 whitespace-nowrap text-xs font-bold hidden md:block">
                    {t.currency}
                  </span>
                </button>
                <select 
                   value={settings.currency}
                   onChange={(e) => updateSettings({ currency: e.target.value as Currency })}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                    {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <HeaderButton 
                onClick={togglePrivacyMode} 
                icon={isPrivacyEnabled ? EyeOff : Eye} 
                label={isPrivacyEnabled ? "Show" : "Hide"} 
            />
            
            <HeaderButton 
                onClick={() => onTabChange('history')} 
                icon={History} 
                label={t.history} 
            />
            
            <HeaderButton 
                onClick={() => onTabChange('settings')} 
                icon={Settings} 
                label={t.settings} 
            />
        </div>
      </div>
    </header>
  );
};
