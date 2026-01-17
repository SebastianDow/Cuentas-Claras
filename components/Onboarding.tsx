import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS } from '../constants';
import { Button } from './Button';

export const Onboarding: React.FC = () => {
  const { settings, updateSettings } = useFinance();
  const t = TRANSLATIONS[settings.language];
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateSettings({ name: name.trim(), hasOnboarded: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-black transition-colors">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto mb-6 shadow-xl shadow-blue-500/30 flex items-center justify-center">
             <span className="text-4xl text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            {t.welcome_title}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.name_placeholder}
              className="w-full px-5 py-4 text-lg bg-white dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white placeholder-gray-400"
              autoFocus
            />
          </div>
          
          <Button 
            variant="primary" 
            size="lg" 
            type="submit" 
            disabled={!name.trim()}
            className="w-full"
          >
            {t.continue}
          </Button>
        </form>
      </div>
    </div>
  );
};
