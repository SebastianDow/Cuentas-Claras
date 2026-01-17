import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Onboarding } from './components/Onboarding';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { SettingsScreen } from './components/Settings';
import { AddRecordModal } from './components/AddRecordModal';
import { History as HistoryIcon, Home as HomeIcon } from 'lucide-react';

const AppContent: React.FC = () => {
  const { settings } = useFinance();
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);

  if (!settings.hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-white">
      {/* Header is persistent only on Dashboard */}
      <Header currentTab={currentView} onTabChange={setCurrentView} />

      <main>
        {currentView === 'dashboard' && <Dashboard onAddRecord={() => setShowAddModal(true)} />}
        {currentView === 'history' && <History onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'settings' && <SettingsScreen onBack={() => setCurrentView('dashboard')} />}
      </main>

      {/* Navigation (Only on Dashboard to switch to History easily) */}
      {currentView === 'dashboard' && (
          <div className="fixed top-6 right-6 z-50">
             <button 
               onClick={() => setCurrentView('history')}
               className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-md rounded-full text-blue-600 hover:scale-110 transition-transform"
             >
                <HistoryIcon size={24} />
             </button>
          </div>
      )}

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
