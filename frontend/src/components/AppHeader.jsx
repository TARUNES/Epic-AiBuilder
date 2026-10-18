import React from 'react';
import { 
  Store, 
  LifeBuoy, 
  Lock, 
  LogOut, 
  Compass
} from 'lucide-react';
import { EpicHourLogo } from './EpicHourLogo';

export default function AppHeader({
  currentUser,
  currentRoute,
  onNavigate,
  onOpenLogin,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 superhuman-glass-card !rounded-none !border-x-0 !border-t-0 !border-b !border-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Brand Logo */}
          <div 
            className="cursor-pointer group flex items-center" 
            onClick={() => onNavigate(currentUser?.role === 'PHARMACY' ? 'pharmacy' : currentUser?.role === 'MUNICIPAL' ? 'command' : 'citizen')}
          >
            <EpicHourLogo size={38} subtitle="Crisis & Public Health Network" />
          </div>

          {/* Center Navigation: ONLY visible when authenticated in demo / officer mode */}
          {currentUser ? (
            <nav className="flex items-center space-x-1 p-1 rounded-xl bg-[#f2f0eb] border border-black/[0.06] text-xs">
              <button
                type="button"
                onClick={() => onNavigate('command')}
                className={currentRoute === 'command' ? 'superhuman-pill-active' : 'superhuman-pill-inactive'}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Command & Map</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('citizen')}
                className={currentRoute === 'citizen' ? 'superhuman-pill-active' : 'superhuman-pill-inactive'}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Citizen SOS</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('pharmacy')}
                className={currentRoute === 'pharmacy' ? 'superhuman-pill-active' : 'superhuman-pill-inactive'}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Clinic Pulse</span>
              </button>
            </nav>
          ) : (
            // Clean empty center space for public users
            <div className="hidden md:flex items-center gap-2 text-xs text-[#73736e]">
              <span className="w-2 h-2 rounded-full bg-[#027e6f] animate-pulse" />
              <span className="font-medium text-[#292827]">Regional Citizen Emergency Response Network</span>
            </div>
          )}

          {/* Right Action: Clean "Partner & Officer Login" Lavender Pill or Active Profile */}
          <div className="flex items-center space-x-3">
            {!currentUser ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="superhuman-pill-active shadow-xs hover:opacity-90 transition-opacity"
              >
                <Lock className="w-3.5 h-3.5 text-[#1b1938]" />
                <span>Partner & Officer Login</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#f2f0eb] border border-black/[0.06] text-xs text-[#292827]">
                  <span className="w-2 h-2 rounded-full bg-[#027e6f]" />
                  <span className="font-semibold">
                    {currentUser.role === 'PHARMACY' 
                      ? (currentUser.user?.facility_name || 'Clinic Partner') 
                      : (currentUser.user?.name || 'Municipal Officer')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-[#73736e] hover:text-[#292827] hover:bg-black/[0.05] rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
