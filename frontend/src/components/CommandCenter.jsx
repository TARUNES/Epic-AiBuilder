import React from 'react';
import { 
  Building2, 
  LifeBuoy, 
  Droplets, 
  Store, 
  TrendingUp, 
  RefreshCw,
  AlertTriangle,
  Users
} from 'lucide-react';
import TimeHorizonSlider from './TimeHorizonSlider';
import EpicHourMap from './EpicHourMap';
import EpidemicReasoningCard from './EpidemicReasoningCard';

const CATEGORY_NAMES = {
  MEDICAL_EVACUATION: 'Medical Evacuation',
  STRANDED_FLOOD: 'Stranded Flood Rescue',
  FOOD_WATER_CRITICAL: 'Drinking Water & Food',
  STRUCTURAL_COLLAPSE: 'Structural Hazard',
  ELECTRICAL_HAZARD: 'Submerged Power Grid'
};

export default function CommandCenter({
  currentUser,
  currentPhase,
  onPhaseChange,
  simulatedDay,
  onSimulateDay,
  isSimulating,
  systemState,
  onActionApproved,
  onRefresh
}) {
  const tickets = systemState?.active_sos_tickets || [];
  const facilities = systemState?.verified_facilities || [];
  const volunteers = systemState?.volunteers || [];
  const pulses = systemState?.pharmacy_pulses || [];
  const alert = systemState?.outbreak_alert;

  const totalPatients = pulses.reduce(
    (acc, p) => acc + (p.extracted_signals?.estimated_patient_count || 0),
    0
  );

  const hazardCount = tickets.filter(
    (t) => t.triage?.environmental_hazard_logged?.length > 0
  ).length;

  const criticalCount = tickets.filter(
    (t) => (t.triage?.urgency_score || 0) >= 9.0
  ).length;

  const availableVolunteers = volunteers.filter((v) => v.available).length;

  return (
    <div className="space-y-6 text-[#ededf3]">
      
      {/* Top Header Card */}
      <div className="mercury-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#5266eb]/20 text-[#9bb4e6]">
              Ward 14 Velachery
            </span>
            <span className="text-xs text-[#afb4cd] font-light">
              Greater Chennai Corporation
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#ededf3] tracking-tight">
            Municipal Crisis Operations
          </h2>
          <p className="text-xs text-[#c3c3cc] font-light">
            Incident Commander: <strong className="text-[#ededf3] font-normal">{currentUser?.user?.name || 'Dr. M. Natarajan, IAS'}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="mercury-btn-ghost text-xs self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#9bb4e6]" />
          <span>Sync Live Telemetry</span>
        </button>
      </div>

      {/* Time Horizon Slider Bar */}
      <TimeHorizonSlider
        currentPhase={currentPhase}
        onPhaseChange={onPhaseChange}
        simulatedDay={simulatedDay}
        onSimulateDay={onSimulateDay}
        isSimulating={isSimulating}
      />

      {/* Primary Grid: Tactical Map & Epidemiological Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Map & Phase-Tailored 3-Tile Metrics */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="mercury-panel p-2">
            <EpicHourMap
              phase={currentPhase}
              tickets={tickets}
              facilities={facilities}
              volunteers={volunteers}
              pulses={pulses}
            />
          </div>

          {/* Clean 3-Tile Metric Strip */}
          {currentPhase === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="mercury-panel p-4 space-y-1">
                <span className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider block">
                  Active Emergency SOS
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-normal text-[#ededf3]">{tickets.length}</span>
                  <span className="text-xs text-[#9bb4e6]">Live queue</span>
                </div>
                <span className="text-xs text-[#c3c3cc] font-light block">Citizen rescue tickets</span>
              </div>

              <div className="mercury-panel p-4 space-y-1">
                <span className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider block">
                  P0 Life-Threatening
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-normal text-[#fc92b4]">{criticalCount}</span>
                  <span className="text-xs text-[#fc92b4]">Critical</span>
                </div>
                <span className="text-xs text-[#c3c3cc] font-light block">Score ≥ 9.0/10</span>
              </div>

              <div className="mercury-panel p-4 space-y-1">
                <span className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider block">
                  Field Responders Ready
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-normal text-[#ededf3]">{availableVolunteers} / {volunteers.length}</span>
                  <span className="text-xs text-[#5266eb]">Deployed</span>
                </div>
                <span className="text-xs text-[#c3c3cc] font-light block">Boats & paramedics</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="mercury-panel p-4 space-y-1">
                <span className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider block">
                  Clinic Surveillance Pulses
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-normal text-[#ededf3]">{pulses.length}</span>
                  <span className="text-xs text-[#5266eb]">Active</span>
                </div>
                <span className="text-xs text-[#c3c3cc] font-light block">{totalPatients} presenting patients</span>
              </div>

              <div className="mercury-panel p-4 space-y-1">
                <span className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider block">
                  Bio-Hazard Anchors
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-normal text-[#fc92b4]">{hazardCount}</span>
                  <span className="text-xs text-[#fc92b4]">Breach</span>
                </div>
                <span className="text-xs text-[#c3c3cc] font-light block">Sewage contamination sites</span>
              </div>

              <div className="mercury-panel p-4 space-y-1">
                <span className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider block">
                  Verified Clinics
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-normal text-[#ededf3]">{facilities.length}</span>
                  <span className="text-xs text-[#9bb4e6]">Reporting</span>
                </div>
                <span className="text-xs text-[#c3c3cc] font-light block">Pharmacies & UPHCs</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Epidemiological Reasoning Card */}
        <div className="lg:col-span-5 space-y-4">
          <EpidemicReasoningCard
            alert={alert}
            onActionApproved={onActionApproved}
          />
        </div>

      </div>

      {/* Bottom Dispatch / Audit Table with Hairline Dividers */}
      <div className="mercury-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(175,180,205,0.12)] pb-3">
          <div>
            <h3 className="text-base font-normal text-[#ededf3]">
              {currentPhase === 1 ? 'Live Incident Dispatch Queue' : 'Historical Hazard Audit Log'}
            </h3>
            <p className="text-xs text-[#c3c3cc] font-light mt-0.5">
              {currentPhase === 1 
                ? 'Status of emergency calls, de-duplication clustering, and assigned response squads.'
                : 'Audited Phase 1 SOS tickets persisting as epidemiological bio-hazard correlates.'}
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#272735] text-[#afb4cd]">
            {tickets.length} Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(175,180,205,0.12)] text-[#afb4cd] font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">{currentPhase === 1 ? 'Assigned Squad' : 'Hazard Logged'}</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(175,180,205,0.08)] text-[#ededf3]">
              {tickets.map((t) => (
                <tr key={t.ticket_id} className="hover:bg-[#272735]/40 transition-colors">
                  <td className="py-3 px-3 font-mono text-[#ededf3]">
                    #{t.ticket_id}
                  </td>
                  <td className="py-3 px-3 font-light text-[#c3c3cc]">
                    {CATEGORY_NAMES[t.triage?.category] || t.triage?.category}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] ${
                      t.triage?.urgency_score >= 9.0 
                        ? 'bg-[#fc92b4]/20 text-[#fc92b4]' 
                        : 'bg-[#5266eb]/20 text-[#9bb4e6]'
                    }`}>
                      {t.triage?.urgency_score} / 10
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-[#afb4cd] font-light">
                    {t.location?.address}
                  </td>
                  <td className="py-3 px-3">
                    {currentPhase === 1 ? (
                      t.assigned_volunteer_name ? (
                        <span className="text-[#ededf3] font-light">
                          {t.assigned_volunteer_name} (~{t.assigned_volunteer_eta_minutes}m)
                        </span>
                      ) : (
                        <span className="text-[#afb4cd] italic">Auto-matching...</span>
                      )
                    ) : (
                      t.triage?.environmental_hazard_logged?.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#fc92b4]/20 text-[#fc92b4]">
                          {t.triage.environmental_hazard_logged.join(', ')}
                        </span>
                      ) : (
                        <span className="text-[#afb4cd]">None</span>
                      )
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#5266eb]/15 text-[#9bb4e6]">
                      {t.status || 'ACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
