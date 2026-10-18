import React, { useState, useEffect, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import LoginModal from './components/LoginModal';
import CitizenSOSPortal from './components/CitizenSOSPortal';
import PharmacyPulsePortal from './components/PharmacyPulsePortal';
import CommandCenter from './components/CommandCenter';
import { api } from './services/api';
import { 
  saveUserCredentials, 
  clearUserCredentials, 
  getUserCredentials,
  subscribeToUserSession,
  saveActiveWave,
  subscribeToActiveWave 
} from './lib/firebase';

export default function App() {
  // Restore persistent session immediately on boot (no flash of logged-out state)
  const initialSession = typeof window !== 'undefined' ? (function() {
    try {
      const s = localStorage.getItem('epic_user_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })() : null;

  const [currentUser, setCurrentUser] = useState(initialSession);
  const [currentRoute, setCurrentRoute] = useState(
    initialSession?.role === 'MUNICIPAL' ? 'command' : initialSession?.role === 'PHARMACY' ? 'pharmacy' : 'citizen'
  );

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeWave, setActiveWave] = useState('wave1');
  const [systemState, setSystemState] = useState(null);
  const [isLoadingState, setIsLoadingState] = useState(true);

  // Subscribe to real-time User Session and Wave updates from Firebase
  useEffect(() => {
    const unsubscribeSession = subscribeToUserSession((firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        if (firebaseUser.role === 'MUNICIPAL') setCurrentRoute('command');
        else if (firebaseUser.role === 'PHARMACY') setCurrentRoute('pharmacy');
      } else {
        const local = getUserCredentials();
        if (!local) {
          setCurrentUser(null);
          setCurrentRoute('citizen');
        }
      }
    });

    const unsubscribeWave = subscribeToActiveWave((cloudWave) => {
      if (cloudWave) setActiveWave(cloudWave);
    });

    return () => {
      if (typeof unsubscribeSession === 'function') unsubscribeSession();
      if (typeof unsubscribeWave === 'function') unsubscribeWave();
    };
  }, []);

  const handleWaveChange = (wave) => {
    const normalized = wave === 'wave2' || wave === 2 ? 'wave2' : 'wave1';
    setActiveWave(normalized);
    saveActiveWave(normalized);
  };

  const fetchState = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoadingState(true);
    try {
      const data = await api.getState('WARD_14');
      if (data) {
        setSystemState(data);
      }
    } catch (err) {
      console.debug('State sync:', err);
    } finally {
      setIsLoadingState(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) await fetchState(true);
    };
    init();
    const interval = setInterval(() => {
      if (isMounted) fetchState(false);
    }, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchState]);

  const handleLoginSuccess = async (authData) => {
    setCurrentUser(authData);
    await saveUserCredentials(authData);

    if (authData.role === 'PHARMACY') {
      setCurrentRoute('pharmacy');
    } else {
      setCurrentRoute('command');
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    await clearUserCredentials();
    setCurrentRoute('citizen');
  };

  const handleNavigate = async (route) => {
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
      await saveUserCredentials(demoCommander);
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
      await saveUserCredentials(demoPharmacy);
      setCurrentRoute('pharmacy');
      return;
    }

    setCurrentRoute(route);
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
            onTicketCreated={async (newTicket) => {
              if (newTicket) {
                setSystemState((prev) => ({
                  ...prev,
                  active_sos_tickets: [newTicket, ...(prev?.active_sos_tickets || [])]
                }));
              }
              await fetchState();
            }}
          />
        )}

        {currentRoute === 'pharmacy' && (
          <PharmacyPulsePortal
            currentUser={currentUser}
            onPulseSubmitted={async (newPulse) => {
              if (newPulse) {
                setSystemState((prev) => ({
                  ...prev,
                  pharmacy_pulses: [newPulse, ...(prev?.pharmacy_pulses || [])]
                }));
              }
              await fetchState();
            }}
          />
        )}

        {currentRoute === 'command' && (
          <CommandCenter
            currentUser={currentUser}
            activeWave={activeWave}
            onWaveChange={handleWaveChange}
            systemState={systemState}
            isLoadingState={isLoadingState}
            onActionApproved={handleActionApproved}
            onRefresh={() => fetchState(true)}
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
