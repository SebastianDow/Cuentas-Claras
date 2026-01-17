
import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Onboarding } from './components/Onboarding';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { SettingsScreen } from './components/Settings';
import { AddRecordModal } from './components/AddRecordModal';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { settings } = useFinance();
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Navigation Params
  const [historyFilter, setHistoryFilter] = useState<string | undefined>(undefined);
  const [historyViewMode, setHistoryViewMode] = useState<'list' | 'chart'>('list');

  const handleViewHistory = (accountId?: string, viewMode: 'list' | 'chart' = 'list') => {
      setHistoryFilter(accountId);
      setHistoryViewMode(viewMode);
      setCurrentView('history');
  };

  const handleTabChange = (tab: any) => {
      if (tab !== 'history') {
          setHistoryFilter(undefined);
          setHistoryViewMode('list');
      }
      setCurrentView(tab);
  }

  if (!settings.hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      {/* Global Toast */}
      <Toast />

      <Header currentTab={currentView} onTabChange={handleTabChange} />

      <main className="w-full max-w-4xl mx-auto">
        {currentView === 'dashboard' && (
            <Dashboard 
                onAddRecord={() => setShowAddModal(true)} 
                onViewHistory={handleViewHistory}
            />
        )}
        {currentView === 'history' && (
            <History 
                onBack={() => setCurrentView('dashboard')} 
                initialAccountId={historyFilter}
                initialViewMode={historyViewMode}
            />
        )}
        {currentView === 'settings' && <SettingsScreen onBack={() => setCurrentView('dashboard')} />}
      </main>

      {showAddModal && <AddRecordModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
