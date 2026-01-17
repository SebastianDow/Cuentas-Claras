import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES } from '../constants';
import { Theme, Language, Currency } from '../types';
import { Moon, Sun, Monitor, ArrowLeft, Globe, CreditCard, Bell, DollarSign, Target, AlertTriangle } from 'lucide-react';

interface SectionTitleProps {
  children?: React.ReactNode;
}

const SectionTitle = ({ children }: SectionTitleProps) => (
  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-6">{children}</h3>
);

interface SettingRowProps {
  label: string;
  children?: React.ReactNode;
  icon: any;
}

const SettingRow = ({ label, children, icon: Icon }: SettingRowProps) => (
  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl flex items-center justify-between shadow-sm mb-2">
    <div className="flex items-center gap-3">
       <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
         <Icon size={18} />
       </div>
       <span className="font-medium text-gray-900 dark:text-white">{label}</span>
    </div>
    <div>{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

export const SettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { settings, updateSettings } = useFinance();
  const t = TRANSLATIONS[settings.language];
  const notif = settings.notifications || { lowBalance: false, debtReminders: false, goalMilestones: false, lowBalanceThreshold: 0 };

  const updateNotif = (key: keyof typeof notif, value: any) => {
    updateSettings({ notifications: { ...notif, [key]: value } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 animate-fade-in pb-20">
       <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800">
           <ArrowLeft className="text-gray-900 dark:text-white" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings}</h2>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="mb-6">
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
           <input 
             type="text" 
             value={settings.name}
             onChange={(e) => updateSettings({ name: e.target.value })}
             className="w-full bg-white dark:bg-gray-900 p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
           />
        </div>

        <SectionTitle>{t.theme}</SectionTitle>
        <div className="bg-white dark:bg-gray-900 p-1 rounded-xl flex shadow-sm">
           {(['light', 'dark', 'system'] as Theme[]).map((thm) => (
             <button
               key={thm}
               onClick={() => updateSettings({ theme: thm })}
               className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                 settings.theme === thm ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500'
               }`}
             >
               {thm === 'light' && <Sun size={16} />}
               {thm === 'dark' && <Moon size={16} />}
               {thm === 'system' && <Monitor size={16} />}
               <span className="capitalize">{thm}</span>
             </button>
           ))}
        </div>

        <SectionTitle>{t.currency}</SectionTitle>
        <SettingRow label={t.currency} icon={CreditCard}>
           <select 
             value={settings.currency}
             onChange={(e) => updateSettings({ currency: e.target.value as Currency })}
             className="bg-transparent text-right font-medium text-blue-600 outline-none"
           >
             {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </SettingRow>

        <SectionTitle>{t.language}</SectionTitle>
        <SettingRow label={t.language} icon={Globe}>
           <select 
             value={settings.language}
             onChange={(e) => updateSettings({ language: e.target.value as Language })}
             className="bg-transparent text-right font-medium text-blue-600 outline-none"
           >
             <option value="es">Español</option>
             <option value="en">English</option>
             <option value="fr">Français</option>
             <option value="pt">Português</option>
           </select>
        </SettingRow>

        <SectionTitle>{t.notifications}</SectionTitle>
        <SettingRow label={t.notify_low_balance} icon={AlertTriangle}>
            <Toggle checked={notif.lowBalance} onChange={(v) => updateNotif('lowBalance', v)} />
        </SettingRow>
        {notif.lowBalance && (
            <div className="mb-2 px-4">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-500">{t.threshold} ({settings.currency})</span>
                    <input 
                        type="number"
                        value={notif.lowBalanceThreshold}
                        onChange={(e) => updateNotif('lowBalanceThreshold', parseFloat(e.target.value))}
                        className="flex-1 text-right bg-transparent outline-none font-bold text-gray-900 dark:text-white"
                    />
                </div>
            </div>
        )}
        <SettingRow label={t.notify_debts} icon={DollarSign}>
            <Toggle checked={notif.debtReminders} onChange={(v) => updateNotif('debtReminders', v)} />
        </SettingRow>
        <SettingRow label={t.notify_goals} icon={Target}>
            <Toggle checked={notif.goalMilestones} onChange={(v) => updateNotif('goalMilestones', v)} />
        </SettingRow>

        <div className="mt-12 text-center">
            <button className="text-blue-500 font-medium hover:underline">
               {t.feedback}
            </button>
            <p className="text-xs text-gray-400 mt-2">v1.1.0 • Cuentas Claras</p>
        </div>
      </div>
    </div>
  );
};