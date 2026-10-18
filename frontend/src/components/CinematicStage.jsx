import React from 'react';
import { 
  Store, 
  ShieldAlert, 
  Compass, 
  Radio
} from 'lucide-react';

export default function CinematicStage({
  currentRoute,
  onNavigate,
  activeWard = "Ward 14 · Velachery",
  simulatedDay = 1,
  alertLevel = "LOW RISK"
}) {
  return (
    <section className="relative w-full bg-[#020204] text-white pt-10 pb-16 px-4 sm:px-8 lg:px-12 overflow-hidden border-b border-white/[0.06]">
      
      {/* Background ambient light & sweep glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-gradient-to-br from-[#c679c4]/10 via-[#fa3d1d]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[400px] h-[200px] bg-[#ffdc5c]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-[1700px] mx-auto space-y-10 relative z-10">
        
        {/* Top Control Bar: Stage metadata & chips */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#f2fcb3] animate-pulse" />
            <span className="font-mono text-xs tracking-wider uppercase text-white/60">
              Act I · Crisis Command Stream
            </span>
            <span className="text-white/20">/</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#f2fcb3] text-black">
              {activeWard}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#ffdc5c] text-black hidden sm:inline-block">
              Day {simulatedDay} Status
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-mono text-white/70 flex items-center gap-2">
              <Radio className="w-3 h-3 text-[#ffdc5c]" />
              <span>Bio-Telemetry Live</span>
            </div>
          </div>
        </div>

        {/* Hero 112px Exposure Variable SERIF Wordmark */}
        <div className="space-y-4 pt-2">
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <h1 
              className="font-brand-serif font-light text-white tracking-[-3.36px] leading-[0.92] select-none"
              style={{
                fontSize: 'clamp(3.75rem, 8vw, 7rem)',
                fontWeight: 300,
                letterSpacing: '-3.36px'
              }}
            >
              EPIC-Hour
            </h1>

            {/* Stage Portal Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] backdrop-blur-[24px] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => onNavigate('command')}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                  currentRoute === 'command'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Command & Tactical Map</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('citizen')}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                  currentRoute === 'citizen'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Citizen SOS</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('pharmacy')}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                  currentRoute === 'pharmacy'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Pharmacy Pulse</span>
              </button>
            </div>
          </div>

          {/* Subtitle & Causal Statement */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
            <p className="text-white/60 text-lg sm:text-xl max-w-2xl font-light leading-relaxed">
              Autonomous epidemic prediction & immediate disaster rescue. Spanning the critical gap between 
              <span className="text-white font-normal"> acute flood triage</span> and 
              <span className="text-[#ffdc5c] font-normal"> post-disaster bio-surveillance</span>.
            </p>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-[12px] flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f2fcb3]" />
                <div className="text-left">
                  <div className="text-[10px] font-mono uppercase text-white/40">Outbreak Risk Velocity</div>
                  <div className="text-xs font-mono font-medium text-white/90">{alertLevel} · Latent Incubation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Marquee Strip */}
        <div className="pt-2 overflow-hidden border-t border-white/[0.06]">
          <div className="relative w-full overflow-hidden py-2.5">
            <div className="animate-marquee flex items-center gap-8 text-[11px] font-mono uppercase tracking-widest text-white/40 select-none whitespace-nowrap">
              <span>⚡ WARD 14 VELACHERY COMMAND</span>
              <span className="text-[#f2fcb3]">● STAGNANT WATER PERSISTENCE ANCHORS</span>
              <span>768-DIM VECTOR DE-DUPLICATION</span>
              <span className="text-[#ffdc5c]">● OTC VELOCITY SURVEILLANCE RADAR</span>
              <span>NO HARDWARE · 100% CLOUD-NATIVE</span>
              <span>MUNICIPAL HUMAN-IN-THE-LOOP APPROVALS</span>
              <span>⚡ WARD 14 VELACHERY COMMAND</span>
              <span className="text-[#f2fcb3]">● STAGNANT WATER PERSISTENCE ANCHORS</span>
              <span>768-DIM VECTOR DE-DUPLICATION</span>
              <span className="text-[#ffdc5c]">● OTC VELOCITY SURVEILLANCE RADAR</span>
            </div>
          </div>
        </div>

      </div>

      {/* Chroma Sweep Accent Line at Transition into Act II */}
      <div className="chroma-sweep-bar h-[2px] w-full absolute bottom-0 left-0" />
    </section>
  );
}
