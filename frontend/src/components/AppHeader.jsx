import React from 'react';
import { 
  Building2, 
  Store, 
  PhoneCall, 
  Lock, 
  LogOut 
} from 'lucide-react';

export default function AppHeader({
  currentUser,
  currentRoute,
  onNavigate,
  onOpenLogin,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Official Civic Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('citizen')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-sm">
              <span className="text-sm font-mono tracking-tighter">GCC</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Greater Chennai Disaster & Health Operations
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                  Ward 14 · Velachery
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Crisis Emergency Triage & Post-Disaster Surveillance Network
              </p>
            </div>
          </div>

          {/* Right: Emergency Hotline & RBAC Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Public Hotline */}
            {!currentUser && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                <span>Emergency Hotline: <strong className="text-slate-900 font-mono">1070</strong> / <strong className="text-slate-900 font-mono">1913</strong></span>
              </div>
            )}

            {/* If NOT logged in: Show "Staff & Partner Login" */}
            {!currentUser ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Staff & Partner Login</span>
              </button>
            ) : (
              /* If logged in: Show User Badge, Active Workspace, and Logout */
              <div className="flex items-center space-x-2.5">
                
                {/* Active Role Portal Badge */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                  {currentUser.role === 'PHARMACY' ? (
                    <>
                      <Store className="w-4 h-4 text-teal-700" />
                      <div className="text-left">
                        <span className="font-bold text-slate-900 block leading-tight">
                          {currentUser.user?.facility_name || 'Verified Pharmacy'}
                        </span>
                        <span className="text-[10px] text-teal-800 font-mono">
                          {currentUser.user?.license_number || 'PHARM-LIC-ACTIVE'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <div className="text-left">
                        <span className="font-bold text-slate-900 block leading-tight">
                          {currentUser.user?.name || 'Municipal Health Officer'}
                        </span>
                        <span className="text-[10px] text-blue-800 font-mono">
                          {currentUser.user?.title || 'Command Operations'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Toggle to Citizen Emergency View */}
                {currentRoute !== 'citizen' ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('citizen')}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100 rounded-lg transition-all hidden sm:inline-block"
                  >
                    Public View
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate(currentUser.role === 'PHARMACY' ? 'pharmacy' : 'command')}
                    className="px-2.5 py-1.5 text-xs text-blue-700 hover:text-blue-800 font-bold bg-blue-50 border border-blue-200 rounded-lg transition-all"
                  >
                    Back to {currentUser.role === 'PHARMACY' ? 'Pharmacy' : 'Command'}
                  </button>
                )}

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
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
