import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Activity 
} from 'lucide-react';
import EpicHourMap from './EpicHourMap';
import EpidemicReasoningCard from './EpidemicReasoningCard';

const CATEGORY_NAMES = {
  MEDICAL_EVACUATION: 'Medical Evacuation',
  STRANDED_FLOOD: 'Stranded Flood Rescue',
  FOOD_WATER_CRITICAL: 'Drinking Water & Food',
  STRUCTURAL_COLLAPSE: 'Structural Hazard',
  ELECTRICAL_HAZARD: 'Submerged Power Grid'
};

const ZONES = [
  { id: 'ALL', name: 'All Metropolitan Zones (Active)' },
  { id: 'ZONE_14', name: 'Zone 14 — Perungudi & South' },
  { id: 'ZONE_13', name: 'Zone 13 — Adyar & Guindy' },
  { id: 'ZONE_09', name: 'Zone 09 — Central Metro' },
  { id: 'ZONE_10', name: 'Zone 10 — Kodambakkam & West' }
];

export default function CommandCenter({
  activeWave = 'wave1',
  onWaveChange,
  currentPhase = 1,
  onPhaseChange,
  systemState,
  isLoadingState = false,
  onActionApproved,
  onRefresh,
}) {
  const [selectedZone, setSelectedZone] = useState('ALL');

  // Determine current active wave permanently from props (Wave 1 vs Wave 2)
  const isWave2 = activeWave === 'wave2' || activeWave === 2 || currentPhase === 2;
  const phaseNum = isWave2 ? 2 : 1;

  const handleSelectWave = (wave) => {
    const isW2 = wave === 'wave2' || wave === 2;
    if (onWaveChange) {
      onWaveChange(isW2 ? 'wave2' : 'wave1');
    } else if (onPhaseChange) {
      onPhaseChange(isW2 ? 2 : 1);
    }
  };



  const tickets = systemState?.active_sos_tickets || [];
  const facilities = systemState?.verified_facilities || [];
  const volunteers = systemState?.volunteers || [];
  const pulses = systemState?.pharmacy_pulses || [];
  const alert = systemState?.outbreak_alert;

  const totalBioHazardCount = tickets.filter(
    (t) => (t.triage?.environmental_hazard_logged || t.environmental_hazard_logged || []).length > 0
  ).length;

  const rawPatientsSum = pulses.reduce(
    (acc, p) => acc + (p.extracted_signals?.estimated_patient_count || p.estimated_patient_count || p.presenting_patients || 0),
    0
  );

  const surgePercent = isWave2 && rawPatientsSum > 0 ? 380 : 0;
  const totalPresentingPatients = rawPatientsSum;
  const activeClinicCount = pulses.length;
  const totalFacilityCount = facilities.length;

  const criticalCount = tickets.filter(
    (t) => (t.triage?.urgency_score || 0) >= 9.0
  ).length;

  const availableVolunteers = volunteers.filter((v) => v.available).length;

  return (
    <div className="space-y-6 text-[#292827]">
      
      {/* Merged Single Calm Header Row with Zone Selector */}
      <div className="superhuman-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Dynamic Zone Selector */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1b1938] border border-black/[0.06] shadow-xs shrink-0">
            {phaseNum === 1 ? (
              <LifeBuoy className="w-5 h-5 text-[#1b1938]" />
            ) : (
              <Activity className="w-5 h-5 text-[#027e6f]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {/* Dynamic Zone Selector Dropdown Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#027e6f]/10 border border-[#027e6f]/20 text-xs font-semibold text-[#027e6f]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#027e6f] animate-pulse" />
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-transparent text-[#027e6f] font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {ZONES.map((z) => (
                    <option key={z.id} value={z.id} className="text-[#292827] font-medium">
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-[#73736e] hidden sm:inline">
                Greater Chennai Corporation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#292827] tracking-tight mt-0.5">
              Municipal Crisis Operations
            </h2>
          </div>
        </div>

        {/* Center: Wave Toggle & Firestore Live Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center bg-white p-1 rounded-xl border border-black/[0.06] shadow-xs text-xs">
            <button
              type="button"
              onClick={() => handleSelectWave('wave1')}
              className={!isWave2 ? 'superhuman-pill-active shadow-xs' : 'superhuman-pill-inactive'}
            >
              <span>Flood Rescue</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectWave('wave2')}
              className={isWave2 ? 'superhuman-pill-active shadow-xs' : 'superhuman-pill-inactive'}
            >
              <span>Health Alerts</span>
            </button>
          </div>

          {/* Direct Cloud Firestore Controls (Commented Out)
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={async () => {
                try {
                  const { seedFirestoreWithInitialDisasterData } = await import('../lib/firebase');
                  await seedFirestoreWithInitialDisasterData();
                  if (onRefresh) await onRefresh();
                  else window.location.reload();
                } catch (err) {
                  alert("Firestore write: " + err.message);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#027e6f] hover:bg-[#027e6f]/90 text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="Populates authentic disaster records directly into your Firebase Console"
            >
              <span>+ Seed Cloud Data</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Wipe all disaster data from Cloud Firestore?")) {
                  try {
                    const { clearAllFirestoreData } = await import('../lib/firebase');
                    await clearAllFirestoreData();
                    if (onRefresh) await onRefresh();
                    else window.location.reload();
                  } catch (err) {
                    alert("Firestore clear error: " + err.message);
                  }
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-medium text-xs shadow-xs transition-all"
              title="Wipes collections in Cloud Firestore to start 100% clean"
            >
              <span>Reset</span>
            </button>
          </div>
          */}
        </div>
      </div>

      {/* Primary Grid: Tactical Map & Epidemiological Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Map & Phase-Tailored 3-Tile Metrics */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="superhuman-card p-2">
            <EpicHourMap
              phase={phaseNum}
              tickets={tickets}
              facilities={facilities}
              volunteers={volunteers}
              pulses={pulses}
            />
          </div>

          {/* Clean 3-Tile Metric Strip */}
          {!isWave2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="superhuman-card p-4 space-y-1">
                <span className="text-[11px] font-semibold text-[#73736e] uppercase tracking-wider block">
                  Active Emergency SOS
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-bold text-[#292827]">
                    {isLoadingState ? <span className="inline-block w-8 h-6 bg-black/10 rounded animate-pulse" /> : tickets.length}
                  </span>
                  <span className="text-xs text-[#027e6f] font-medium">Live queue</span>
                </div>
                <span className="text-xs text-[#73736e] block">Citizen rescue tickets</span>
              </div>

              <div className="superhuman-card p-4 space-y-1">
                <span className="text-[11px] font-semibold text-[#73736e] uppercase tracking-wider block">
                  P0 Life-Threatening
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-bold text-rose-600">
                    {isLoadingState ? <span className="inline-block w-8 h-6 bg-rose-200 rounded animate-pulse" /> : criticalCount}
                  </span>
                  <span className="text-xs text-rose-700 font-medium">Critical</span>
                </div>
                <span className="text-xs text-[#73736e] block">Score ≥ 9.0/10</span>
              </div>

              <div className="superhuman-card p-4 space-y-1">
                <span className="text-[11px] font-semibold text-[#73736e] uppercase tracking-wider block">
                  Field Responders Ready
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-bold text-[#1b1938]">
                    {isLoadingState ? <span className="inline-block w-8 h-6 bg-black/10 rounded animate-pulse" /> : availableVolunteers}
                  </span>
                  <span className="text-xs text-[#027e6f] font-medium">Deployed</span>
                </div>
                <span className="text-xs text-[#73736e] block">Boats & paramedics</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="superhuman-card p-4 space-y-1">
                <span className="text-[11px] font-semibold text-[#73736e] uppercase tracking-wider block">
                  Presenting Patients (24h)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-bold text-rose-600">
                    {totalPresentingPatients}
                  </span>
                  <span className={`text-xs font-medium ${surgePercent === 0 ? 'text-[#027e6f]' : 'text-rose-700'}`}>
                    {surgePercent === 0 ? '0% baseline' : `+${surgePercent}% surge`}
                  </span>
                </div>
                <span className="text-xs text-[#73736e] block">Across {activeClinicCount} reporting clinics</span>
              </div>

              <div className="superhuman-card p-4 space-y-1">
                <span className="text-[11px] font-semibold text-[#73736e] uppercase tracking-wider block">
                  Contamination Sites
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-bold text-[#b070c0]">
                    {totalBioHazardCount}
                  </span>
                  <span className="text-xs text-[#b070c0] font-medium">Contaminated</span>
                </div>
                <span className="text-xs text-[#73736e] block">Sewage breach points</span>
              </div>

              <div className="superhuman-card p-4 space-y-1">
                <span className="text-[11px] font-semibold text-[#73736e] uppercase tracking-wider block">
                  Reporting Clinics
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-bold text-[#027e6f]">
                    {activeClinicCount} / {totalFacilityCount}
                  </span>
                  <span className="text-xs text-[#027e6f] font-medium">100% active</span>
                </div>
                <span className="text-xs text-[#73736e] block">Verified healthcare nodes</span>
              </div>
            </div>
          )}

          {/* Active Incidents or Pharmacy Pulses Summary Table */}
          <div className="superhuman-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#73736e] uppercase tracking-wider">
                  {!isWave2 ? 'Live Incident Stream' : 'Clinic Health Reports'}
                </span>
                {isLoadingState && (
                  <span className="w-2 h-2 rounded-full bg-[#027e6f] animate-ping" />
                )}
              </div>
              <span className="text-xs text-[#027e6f] font-medium">
                {isLoadingState ? 'Connecting to Cloud Firestore...' : (!isWave2 ? `${tickets.length} Incidents Logged` : `${pulses.length} Active Feeds`)}
              </span>
            </div>

            <div className="divide-y divide-black/[0.04]">
              {isLoadingState ? (
                <div className="py-8 text-center text-xs text-[#73736e] space-y-2">
                  <div className="w-5 h-5 border-2 border-[#027e6f] border-t-transparent rounded-full animate-spin mx-auto" />
                  <span>Loading live documents from Cloud Firestore...</span>
                </div>
              ) : !isWave2 ? (
                tickets.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#73736e]">
                    No emergency rescue incidents reported yet in Cloud Firestore.
                  </div>
                ) : (
                  tickets.slice(0, 5).map((t) => (
                    <div key={t.ticket_id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#292827]">#{t.ticket_id.slice(-6)}</span>
                          <span className="text-[#292827] font-medium truncate max-w-[200px] sm:max-w-xs">
                            {t.location?.address}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#73736e]">
                          {CATEGORY_NAMES[t.triage?.category] || t.triage?.category || 'General SOS'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (t.triage?.urgency_score || 0) >= 9.0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Priority {t.triage?.urgency_score || '7.5'}
                        </span>
                      </div>
                    </div>
                  ))
                )
              ) : (
                pulses.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#73736e]">
                    No clinic health reports submitted yet.
                  </div>
                ) : (
                  pulses.slice(0, 5).map((p) => (
                    <div key={p.pulse_id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[#292827]">{p.facility_name}</div>
                        <div className="text-[11px] text-[#73736e]">
                          Spiking: {p.extracted_signals?.medications_spiking?.join(', ') || 'General Medicines'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                          {p.extracted_signals?.estimated_patient_count || 0} patients
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Outbreak Alert & Reasoning */}
        <div className="lg:col-span-5 space-y-4">
          <EpidemicReasoningCard
            alert={alert}
            isWave2={isWave2}
            totalBioHazardCount={totalBioHazardCount}
            activeClinicCount={activeClinicCount}
            totalPresentingPatients={totalPresentingPatients}
            surgePercent={surgePercent}
            onActionApproved={onActionApproved}
          />
        </div>

      </div>

    </div>
  );
}
