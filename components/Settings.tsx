
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TRANSLATIONS, SUPPORTED_CURRENCIES } from '../constants';
import { Theme, Language, Currency } from '../types';
import { formatCurrency, formatSmartDate, getRecurringFrequencyLabel } from '../services/financeService';
import { Moon, Sun, Monitor, ArrowLeft, Globe, CreditCard, DollarSign, Target, AlertTriangle, Download, Upload, Repeat, Trash2, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

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
  onClick?: () => void;
}

const SettingRow = ({ label, children, icon: Icon, onClick }: SettingRowProps) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-gray-900 p-4 rounded-xl flex items-center justify-between shadow-sm mb-2 overflow-hidden relative"
  >
    <div className="flex items-center gap-3 shrink-0">
       <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
         <Icon size={18} />
       </div>
       <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{label}</span>
    </div>
    <div className="flex-1 flex justify-end min-w-0 pl-4 items-center">
        {children}
    </div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

export const SettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { settings, updateSettings, exportData, importData, recurringRules, deleteRecurringRule } = useFinance();
  const t = TRANSLATIONS[settings.language];
  const notif = settings.notifications || { lowBalance: false, debtReminders: false, goalMilestones: false, lowBalanceThreshold: 0 };
  const [showRecurring, setShowRecurring] = useState(false);

  const updateNotif = (key: keyof typeof notif, value: any) => {
    updateSettings({ notifications: { ...notif, [key]: value } });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  const success = importData(ev.target.result as string);
                  if (success) alert("Data imported successfully!");
                  else alert("Failed to import data.");
              }
          };
          reader.readAsText(file);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 animate-fade-in pb-safe-bottom">
       <div className="flex items-center gap-4 mb-8 pt-safe-top">
        <button onClick={onBack} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
           <ArrowLeft className="text-gray-900 dark:text-white" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings}</h2>
      </div>

      <div className="max-w-lg mx-auto pb-10">
        <div className="mb-6">
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.name_placeholder}</label>
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
               <span className="capitalize">
                 {thm === 'light' ? t.theme_light : thm === 'dark' ? t.theme_dark : t.theme_system}
               </span>
             </button>
           ))}
        </div>

        <SectionTitle>{t.currency}</SectionTitle>
        <SettingRow label={t.currency} icon={CreditCard}>
             <div className="flex items-center gap-2">
                 <span className="text-blue-600 font-medium">{settings.currency}</span>
                 <ChevronRight size={16} className="text-gray-400" />
                 {/* Invisible Select Overlay for Native Picker */}
                 <select 
                   value={settings.currency}
                   onChange={(e) => updateSettings({ currency: e.target.value as Currency })}
                   className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                 >
                   {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
             </div>
        </SettingRow>

        <SectionTitle>{t.language}</SectionTitle>
        <SettingRow label={t.language} icon={Globe}>
             <div className="flex items-center gap-2">
                 <span className="text-blue-600 font-medium uppercase">{settings.language}</span>
                 <ChevronRight size={16} className="text-gray-400" />
                 <select 
                   value={settings.language}
                   onChange={(e) => updateSettings({ language: e.target.value as Language })}
                   className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                 >
                   <option value="es">Español</option>
                   <option value="en">English</option>
                   <option value="fr">Français</option>
                   <option value="pt">Português</option>
                   <option value="de">Deutsch</option>
                   <option value="it">Italiano</option>
                   <option value="ja">日本語</option>
                 </select>
             </div>
        </SettingRow>

        {/* RECURRING RULES MANAGEMENT */}
        <SectionTitle>{t.active_rules}</SectionTitle>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
             <button 
                onClick={() => setShowRecurring(!showRecurring)}
                className="w-full p-4 flex items-center justify-between"
             >
                 <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                         <Repeat size={18} />
                     </div>
                     <span className="font-medium text-gray-900 dark:text-white">{t.active_rules} ({recurringRules.length})</span>
                 </div>
                 {showRecurring ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
             </button>
             
             {showRecurring && (
                 <div className="border-t border-gray-100 dark:border-gray-800">
                     {recurringRules.length === 0 ? (
                         <div className="p-4 text-center text-sm text-gray-400 italic">
                             {t.no_recurring}
                         </div>
                     ) : (
                         recurringRules.map(rule => (
                             <div key={rule.id} className="p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 flex justify-between items-center">
                                 <div className="min-w-0 pr-2">
                                     <p className="font-bold text-gray-900 dark:text-white truncate">{rule.template.title}</p>
                                     <p className="text-xs text-gray-500 truncate">
                                         {formatCurrency(rule.template.amount, rule.template.currency, settings.language)} • {getRecurringFrequencyLabel(rule.frequency, rule.nextDueDate, settings.language)}
                                     </p>
                                     <p className="text-xs text-blue-500 mt-0.5">Next: {formatSmartDate(rule.nextDueDate, settings.language)}</p>
                                 </div>
                                 <button 
                                    onClick={() => deleteRecurringRule(rule.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                                 >
                                     <Trash2 size={18} />
                                 </button>
                             </div>
                         ))
                     )}
                 </div>
             )}
        </div>

        <SectionTitle>{t.notifications}</SectionTitle>
        <SettingRow label={t.notify_low_balance} icon={AlertTriangle}>
            <Toggle checked={notif.lowBalance} onChange={(v) => updateNotif('lowBalance', v)} />
        </SettingRow>
        {notif.lowBalance && (
            <div className="mb-2 px-4 animate-fade-in">
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

        <SectionTitle>{t.data_management}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={exportData}
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm text-blue-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <Download size={18} />
                {t.export_data}
            </button>
            <label className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm text-blue-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <Upload size={18} />
                {t.import_data}
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
        </div>

        <div className="mt-12 text-center pb-8">
            <button className="text-blue-500 font-medium hover:underline">
               {t.feedback}
            </button>
            <p className="text-xs text-gray-400 mt-2">v1.6.0 • Cuentas Claras</p>
        </div>
      </div>
    </div>
  );
};
