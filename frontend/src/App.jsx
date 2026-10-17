import React, { useState, useEffect, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import LoginModal from './components/LoginModal';
import CitizenSOSPortal from './components/CitizenSOSPortal';
import PharmacyPulsePortal from './components/PharmacyPulsePortal';
import CommandCenter from './components/CommandCenter';
import { api } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('command');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('epic_user');
      return saved ? JSON.parse(saved) : {
        role: 'MUNICIPAL',
        token: 'DEMO-OFFICER-SESSION',
        user: {
          name: 'Dr. M. Natarajan, IAS',
          title: 'Special Relief Commissioner & CMHO',
          department: 'Greater Chennai Corporation - Disaster Cell'
        }
      };
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Operational Phase & Simulation
  const [currentPhase, setCurrentPhase] = useState(1);
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
    if (route === 'command' && (!currentUser || currentUser.role !== 'MUNICIPAL')) {
      const demoCommander = {
        role: 'MUNICIPAL',
        token: 'DEMO-OFFICER-SESSION',
        user: {
          name: 'Dr. M. Natarajan, IAS',
          title: 'Special Relief Commissioner & CMHO',
          department: 'Greater Chennai Corporation - Disaster Cell'
        }
      };
      setCurrentUser(demoCommander);
      try {
        localStorage.setItem('epic_user', JSON.stringify(demoCommander));
      } catch {}
      setCurrentRoute('command');
      return;
    }

    if (route === 'pharmacy' && (!currentUser || currentUser.role !== 'PHARMACY')) {
      const demoPharmacy = {
        role: 'PHARMACY',
        token: 'DEMO-PHARM-SESSION',
        user: {
          facility_id: 'PHARM-MEDPLUS-14',
          facility_name: 'MedPlus Pharmacy - Velachery Main Rd',
          license_number: 'PHARM-LIC-VERIFIED-VLC-01'
        }
      };
      setCurrentUser(demoPharmacy);
      try {
        localStorage.setItem('epic_user', JSON.stringify(demoPharmacy));
      } catch {}
      setCurrentRoute('pharmacy');
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
    <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col font-sans selection:bg-[#5266eb] selection:text-white">
      
      {/* Top Header */}
      <AppHeader
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection Notice if backend restarting */}
        {connectionError && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#272735] border border-[rgba(175,180,205,0.15)] text-xs text-[#c3c3cc] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#9bb4e6] shrink-0" />
              <span>{connectionError}</span>
            </div>
            <button
              type="button"
              onClick={fetchState}
              className="mercury-btn-ghost h-8 text-xs px-3"
            >
              Retry
            </button>
          </div>
        )}

        {currentRoute === 'citizen' && (
          <CitizenSOSPortal
            onTicketCreated={() => {
              fetchState();
            }}
          />
        )}

        {currentRoute === 'pharmacy' && (
          <PharmacyPulsePortal
            currentUser={currentUser}
            onPulseSubmitted={() => {
              fetchState();
            }}
          />
        )}

        {currentRoute === 'command' && (
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

      {/* Clean Mercury Footer */}
      <footer className="border-t border-[rgba(175,180,205,0.12)] py-8 px-4 sm:px-8 text-xs text-[#afb4cd] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-[#ededf3] font-normal">EPIC-Hour</span>
            <span>·</span>
            <span className="font-light">Greater Chennai Corporation · Ward 14 Velachery</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono text-[#c3c3cc]">
            <span>1070 Emergency Helpline</span>
            <span>·</span>
            <span>Zero Hardware Outbreak Radar</span>
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
