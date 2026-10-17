import React from 'react';
import { 
  LifeBuoy, 
  Activity, 
  ArrowRight,
  Droplets
} from 'lucide-react';

export default function TimeHorizonSlider({ 
  currentPhase, 
  onPhaseChange, 
  simulatedDay, 
  onSimulateDay,
  isSimulating 
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Operational Phase Identifier */}
        <div className="flex items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
            currentPhase === 1 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {currentPhase === 1 ? (
              <LifeBuoy className="w-6 h-6" />
            ) : (
              <Activity className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Crisis Operational Horizon
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold border ${
                currentPhase === 1
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {currentPhase === 1 ? 'Wave 1: Acute Flooding' : 'Wave 2: Post-Disaster Surveillance'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {currentPhase === 1 
                ? 'Active Disaster SOS Triage & Rescue Operations' 
                : 'Post-Flood Epidemiological Early Warning Radar'}
            </h2>
          </div>
        </div>

        {/* Middle: Phase Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => onPhaseChange(1)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              currentPhase === 1
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-red-600" />
            <span>Wave 1: Hours 0–48</span>
          </button>

          <button
            type="button"
            onClick={() => onPhaseChange(2)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              currentPhase === 2
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Wave 2: Days 3–14</span>
          </button>
        </div>

        {/* Right: Scenario Data Switcher (For Evaluation & Drills) */}
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 px-1 hidden xl:inline">
            Scenario Data:
          </span>
          <button
            type="button"
            disabled={isSimulating}
            onClick={() => onSimulateDay(1)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              simulatedDay === 1
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day 1 (Flood)
          </button>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            disabled={isSimulating}
            onClick={() => onSimulateDay(5)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              simulatedDay === 5
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day 5 (Post-Flood)
          </button>
        </div>

      </div>

      {/* Operational Briefing Note */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {currentPhase === 1 
              ? 'Monitoring 12 active emergency incidents and logging persistent sewage breach coordinates.'
              : 'Correlating persistent sewage rupture points with pharmacy OTC surges and weather telemetry.'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>H00</span>
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${currentPhase === 1 ? 'w-1/4 bg-red-600' : 'w-4/5 bg-blue-600'}`} 
            />
          </div>
          <span>D14</span>
        </div>
      </div>
    </div>
  );
}
