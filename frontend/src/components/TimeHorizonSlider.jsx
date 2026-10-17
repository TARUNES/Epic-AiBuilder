import React from 'react';
import { 
  LifeBuoy, 
  Activity, 
  ArrowRight
} from 'lucide-react';

export default function TimeHorizonSlider({ 
  currentPhase, 
  onPhaseChange, 
  simulatedDay, 
  onSimulateDay,
  isSimulating 
}) {
  return (
    <div className="mercury-panel p-5 text-[#ededf3] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      {/* Phase Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#272735] flex items-center justify-center text-[#5266eb] border border-[rgba(175,180,205,0.15)] shrink-0">
          {currentPhase === 1 ? (
            <LifeBuoy className="w-5 h-5 text-[#5266eb]" />
          ) : (
            <Activity className="w-5 h-5 text-[#5266eb]" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider">
              Crisis Lifecycle Horizon
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#5266eb]/20 text-[#9bb4e6]">
              {currentPhase === 1 ? 'Phase 1 · Rescue' : 'Phase 2 · Bio-Surveillance'}
            </span>
          </div>
          <h2 className="text-base font-normal text-[#ededf3] mt-0.5">
            {currentPhase === 1 
              ? 'Hours 0–48: Active emergency rescue & sewage breach logging' 
              : 'Days 3–14: Post-flood contamination radar & medication velocity'}
          </h2>
        </div>
      </div>

      {/* Middle: Minimal Phase Toggle Pills */}
      <div className="flex items-center bg-[#272735] p-1 rounded-full border border-[rgba(175,180,205,0.15)] text-xs">
        <button
          type="button"
          onClick={() => onPhaseChange(1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
            currentPhase === 1
              ? 'bg-[#5266eb] text-white font-medium'
              : 'text-[#c3c3cc] hover:text-[#ededf3]'
          }`}
        >
          <span>Wave 1: Flood Rescue</span>
        </button>

        <button
          type="button"
          onClick={() => onPhaseChange(2)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
            currentPhase === 2
              ? 'bg-[#5266eb] text-white font-medium'
              : 'text-[#c3c3cc] hover:text-[#ededf3]'
          }`}
        >
          <span>Wave 2: Outbreak Radar</span>
        </button>
      </div>

      {/* Right: Day Scenario Switcher */}
      <div className="flex items-center space-x-2 bg-[#272735] px-3 py-1.5 rounded-full border border-[rgba(175,180,205,0.15)] text-xs">
        <span className="text-[11px] font-light text-[#afb4cd] hidden sm:inline">
          Drill State:
        </span>
        <button
          type="button"
          disabled={isSimulating}
          onClick={() => onSimulateDay(1)}
          className={`px-3 py-1 rounded-full transition-all ${
            simulatedDay === 1
              ? 'bg-[#5266eb] text-white font-medium'
              : 'text-[#c3c3cc] hover:text-[#ededf3]'
          }`}
        >
          Day 1
        </button>
        <ArrowRight className="w-3 h-3 text-[#afb4cd]" />
        <button
          type="button"
          disabled={isSimulating}
          onClick={() => onSimulateDay(5)}
          className={`px-3 py-1 rounded-full transition-all ${
            simulatedDay === 5
              ? 'bg-[#5266eb] text-white font-medium'
              : 'text-[#c3c3cc] hover:text-[#ededf3]'
          }`}
        >
          Day 5 (Outbreak)
        </button>
      </div>

    </div>
  );
}
