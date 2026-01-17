import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS } from '../constants';
import { getGreetingKey } from '../services/financeService';
import { User, Settings, Bell } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'history' | 'settings';
  onTabChange: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { settings } = useFinance();
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
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out px-6 pt-12 pb-4 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`flex flex-col transition-all duration-300 ${isScrolled ? 'scale-90 origin-top-left opacity-90' : 'scale-100'}`}>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">
            {greeting}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {settings.name}
          </h1>
        </div>
        
        <button 
          onClick={() => onTabChange('settings')}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
