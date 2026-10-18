import React, { useState, useEffect, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import LoginModal from './components/LoginModal';
import CitizenSOSPortal from './components/CitizenSOSPortal';
import PharmacyPulsePortal from './components/PharmacyPulsePortal';
import CommandCenter from './components/CommandCenter';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('epic_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Public users landing on app see Citizen SOS. If authenticated as MUNICIPAL, default to command. If PHARMACY, default to pharmacy.
  const [currentRoute, setCurrentRoute] = useState(() => {
    try {
      const saved = localStorage.getItem('epic_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'MUNICIPAL') return 'command';
        if (parsed.role === 'PHARMACY') return 'pharmacy';
      }
    } catch {}
    return 'citizen';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Persistent Active Wave State (Decoupled from polling and synced with sessionStorage)
  const [activeWave, setActiveWave] = useState(() => {
    try {
      const saved = sessionStorage.getItem('epic_active_wave');
      return saved === 'wave2' || saved === '2' ? 'wave2' : 'wave1';
    } catch {
      return 'wave1';
    }
  });

  const [simulatedDay, setSimulatedDay] = useState(() => {
    try {
      const savedWave = sessionStorage.getItem('epic_active_wave');
      return savedWave === 'wave2' || savedWave === '2' ? 5 : 1;
    } catch {
      return 1;
    }
  });

  const [isSimulating, setIsSimulating] = useState(false);

  // State Telemetry (silently and seamlessly loads local mock state if backend is offline)
  const [systemState, setSystemState] = useState(null);

  const handleWaveChange = (wave) => {
    const normalized = wave === 'wave2' || wave === 2 ? 'wave2' : 'wave1';
    setActiveWave(normalized);
    const syncDay = normalized === 'wave2' ? 5 : 1;
    setSimulatedDay(syncDay);
    try {
      sessionStorage.setItem('epic_active_wave', normalized);
    } catch {}
  };

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getState('WARD_14');
      if (data) {
        setSystemState(data);
        // NOTE: We deliberately DO NOT overwrite activeWave here, fixing the snap-back bug!
      }
    } catch (err) {
      console.debug('State sync:', err);
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
    } else {
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
          facility_name: 'MedPlus Pharmacy · Velachery Main Rd',
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
      const newWave = day >= 5 ? 'wave2' : 'wave1';
      setActiveWave(newWave);
      try {
        sessionStorage.setItem('epic_active_wave', newWave);
      } catch {}
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
    <div className="min-h-screen bg-[#f7f5f2] text-[#292827] flex flex-col font-sans selection:bg-[#d4c7ff] selection:text-[#1b1938]">
      
      {/* Superhuman Glassy Navbar */}
      <AppHeader
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
            activeWave={activeWave}
            onWaveChange={handleWaveChange}
            simulatedDay={simulatedDay}
            onSimulateDay={handleSimulateDay}
            isSimulating={isSimulating}
            systemState={systemState}
            onActionApproved={handleActionApproved}
            onRefresh={fetchState}
          />
        )}
      </main>

      {/* Superhuman Warm Footer */}
      <footer className="border-t border-black/[0.06] py-8 px-4 sm:px-8 text-xs text-[#73736e] mt-auto bg-[#f7f5f2]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-[#292827] font-semibold">EPIC-Hour</span>
            <span>·</span>
            <span>Greater Chennai Corporation · Unified Regional Emergency Network</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono text-[#73736e]">
            <span>1070 Emergency Helpline</span>
            <span>·</span>
            <span className="text-[#027e6f] font-semibold">Verified Healthcare Network</span>
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
