import React from 'react';
import { 
  Building2, 
  Store, 
  LifeBuoy, 
  Lock, 
  LogOut,
  Map,
  Compass
} from 'lucide-react';

export default function AppHeader({
  currentUser,
  currentRoute,
  onNavigate,
  onOpenLogin,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#171721]/90 backdrop-blur-md border-b border-[rgba(175,180,205,0.15)] text-[#ededf3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Logo / Brand Name in Humanist Serene Type */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => onNavigate('command')}
          >
            <div className="w-8 h-8 rounded-full bg-[#5266eb] flex items-center justify-center text-white font-medium text-xs">
              ⚡
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-normal text-xl tracking-tight text-[#ededf3]">
                EPIC-Hour
              </span>
              <span className="text-xs text-[#afb4cd] font-light hidden sm:inline">
                Crisis & Bio-Surveillance
              </span>
            </div>
          </div>

          {/* Center Navigation: Persona-Driven Minimal Switcher */}
          <nav className="flex items-center space-x-1.5 p-1 rounded-full bg-[#1e1e2a] border border-[rgba(175,180,205,0.15)] text-xs">
            <button
              type="button"
              onClick={() => onNavigate('command')}
              className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
                currentRoute === 'command'
                  ? 'bg-[#5266eb] text-white font-medium'
                  : 'text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Command & Map</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('citizen')}
              className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
                currentRoute === 'citizen'
                  ? 'bg-[#5266eb] text-white font-medium'
                  : 'text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735]'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Citizen SOS</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('pharmacy')}
              className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
                currentRoute === 'pharmacy'
                  ? 'bg-[#5266eb] text-white font-medium'
                  : 'text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Clinic Pulse</span>
            </button>
          </nav>

          {/* Right: Auth & Identity */}
          <div className="flex items-center space-x-3">
            {!currentUser ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="mercury-btn-ghost text-xs h-9 px-4"
              >
                <Lock className="w-3.5 h-3.5 text-[#9bb4e6]" />
                <span>Officer Access</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1e1e2a] border border-[rgba(175,180,205,0.15)] text-xs text-[#c3c3cc]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
                  <span>{currentUser.user?.name || 'Municipal Officer'}</span>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-[#afb4cd] hover:text-[#ededf3] hover:bg-[#272735] rounded-full transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
