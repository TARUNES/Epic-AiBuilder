import React, { useState, useEffect, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import LoginModal from './components/LoginModal';
import CitizenSOSPortal from './components/CitizenSOSPortal';
import PharmacyPulsePortal from './components/PharmacyPulsePortal';
import CommandCenter from './components/CommandCenter';
import { api } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  // Routes: 'citizen' (public) | 'pharmacy' (protected) | 'command' (protected)
  const [currentRoute, setCurrentRoute] = useState('citizen');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('epic_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Operational Phase & Simulation
  const [currentPhase, setCurrentPhase] = useState(1); // 1: Flood (Hours 0-48) | 2: Surveillance (Days 3-14)
  const [simulatedDay, setSimulatedDay] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);

  // State Telemetry
  const [systemState, setSystemState] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const fetchState = useCallback(async () => {
    try {
      setConnectionError(null);
      const data = await api.getState('WARD_14');
      setSystemState(data);
      if (data.current_simulated_day) {
        setSimulatedDay(data.current_simulated_day);
        setCurrentPhase(data.current_simulated_day >= 5 ? 2 : 1);
      }
    } catch (err) {
      console.warn('Backend server not responding yet:', err);
      setConnectionError('Municipal operations server connecting...');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) await fetchState();
    };
    init();
    const interval = setInterval(() => {
      if (isMounted) fetchState();
    }, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchState]);

  const handleLoginSuccess = (authData) => {
    setCurrentUser(authData);
    try {
      localStorage.setItem('epic_user', JSON.stringify(authData));
    } catch {}
    // Navigate to authorized portal
    if (authData.role === 'PHARMACY') {
      setCurrentRoute('pharmacy');
    } else if (authData.role === 'MUNICIPAL') {
      setCurrentRoute('command');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('epic_user');
    } catch {}
    setCurrentRoute('citizen');
  };

  const handleNavigate = (route) => {
    if (route === 'pharmacy' && currentUser?.role !== 'PHARMACY') {
      setIsLoginModalOpen(true);
      return;
    }
    if (route === 'command' && currentUser?.role !== 'MUNICIPAL') {
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentRoute(route);
  };

  const handleSimulateDay = async (day) => {
    setIsSimulating(true);
    try {
      await api.simulateDay(day);
      setSimulatedDay(day);
      setCurrentPhase(day >= 5 ? 2 : 1);
      await fetchState();
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleActionApproved = (approvedAction) => {
    setSystemState((prev) => {
      if (!prev || !prev.outbreak_alert) return prev;
      const updatedActions = (prev.outbreak_alert.action_proposals || []).map((a) =>
        a.action_id === approvedAction.action_id ? approvedAction : a
      );
      return {
        ...prev,
        outbreak_alert: {
          ...prev.outbreak_alert,
          action_proposals: updatedActions,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Official Civic App Header */}
      <AppHeader
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Connection Notice if backend restarting */}
      {connectionError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{connectionError}</span>
          </div>
          <button
            type="button"
            onClick={fetchState}
            className="px-2.5 py-1 bg-white border border-amber-300 rounded font-semibold text-[11px] hover:bg-amber-100"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Container Views */}
      <main className="flex-1">
        {currentRoute === 'citizen' && (
          <CitizenSOSPortal
            onTicketCreated={() => {
              fetchState();
            }}
          />
        )}

        {currentRoute === 'pharmacy' && currentUser?.role === 'PHARMACY' && (
          <PharmacyPulsePortal
            currentUser={currentUser}
            onPulseSubmitted={() => {
              fetchState();
            }}
          />
        )}

        {currentRoute === 'command' && currentUser?.role === 'MUNICIPAL' && (
          <CommandCenter
            currentUser={currentUser}
            currentPhase={currentPhase}
            onPhaseChange={setCurrentPhase}
            simulatedDay={simulatedDay}
            onSimulateDay={handleSimulateDay}
            isSimulating={isSimulating}
            systemState={systemState}
            onActionApproved={handleActionApproved}
            onRefresh={fetchState}
          />
        )}
      </main>

      {/* Official Government / Public Health Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">Greater Chennai Corporation</span>
            <span>·</span>
            <span>Ward 14 Disaster Response & Public Health Cell</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>Emergency Contacts: 1070 (State) / 1913 (Corporation)</span>
            <span>·</span>
            <span>National Disaster Management Framework</span>
          </div>
        </div>
      </footer>

      {/* RBAC Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
