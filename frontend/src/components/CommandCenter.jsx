import React from 'react';
import { 
  Building2, 
  LifeBuoy, 
  Droplets, 
  Store, 
  TrendingUp, 
  RefreshCw,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import TimeHorizonSlider from './TimeHorizonSlider';
import EpicHourMap from './EpicHourMap';
import EpidemicReasoningCard from './EpidemicReasoningCard';

const CATEGORY_NAMES = {
  MEDICAL_EVACUATION: 'Medical Evacuation',
  STRANDED_FLOOD: 'Stranded Flood Rescue',
  FOOD_WATER_CRITICAL: 'Potable Water & Food Crisis',
  STRUCTURAL_COLLAPSE: 'Structural Collapse',
  ELECTRICAL_HAZARD: 'Electrical Grid Hazard'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Ward 14 Command Operations Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Municipal Crisis & Public Health Operations Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Official Access
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Ward 14 (Velachery) · Greater Chennai Corporation · Incident Commander: <strong className="text-slate-800">{currentUser?.user?.name || 'Dr. M. Natarajan, IAS'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-2xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* Time Horizon Slider Bar */}
      <TimeHorizonSlider
        currentPhase={currentPhase}
        onPhaseChange={onPhaseChange}
        simulatedDay={simulatedDay}
        onSimulateDay={onSimulateDay}
        isSimulating={isSimulating}
      />

      {/* Primary 12-Column Grid: Tactical Map & Epidemiological Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Map & Quick Metrics Strip */}
        <div className="lg:col-span-7 space-y-4">
          <EpicHourMap
            phase={currentPhase}
            tickets={tickets}
            facilities={facilities}
            volunteers={volunteers}
            pulses={pulses}
          />

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                Active SOS Incidents
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-black text-red-600">{tickets.length}</span>
                <LifeBuoy className="w-4 h-4 text-red-500" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                Persisted Hazard Breach
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-black text-purple-700">{hazardCount} nodes</span>
                <Droplets className="w-4 h-4 text-purple-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                Reporting Clinics
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-black text-teal-700">{facilities.length} verified</span>
                <Store className="w-4 h-4 text-teal-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                Presenting Patients (24h)
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-black text-slate-900">{totalPatients}</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Epidemiological Reasoning & Human-in-the-Loop Action Orders */}
        <div className="lg:col-span-5 space-y-4">
          <EpidemicReasoningCard
            alert={alert}
            onActionApproved={onActionApproved}
          />
        </div>

      </div>

      {/* Bottom: Active SOS Emergency Dispatch Queue Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Active Incident Dispatch Queue (Ward 14)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of citizen emergency calls, de-duplication clustering, and assigned response squads.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {tickets.length} Active Dispatch Tickets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Assigned Squad</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tickets.map((t) => (
                <tr key={t.ticket_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    #{t.ticket_id}
                  </td>
                  <td className="py-3 px-3 font-medium">
                    {CATEGORY_NAMES[t.triage?.category] || t.triage?.category}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${
                      t.triage?.urgency_score >= 9.0 
                        ? 'bg-red-100 text-red-800' 
                        : t.triage?.urgency_score >= 7.5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t.triage?.urgency_score} / 10
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                    {t.location?.address}
                  </td>
                  <td className="py-3 px-3">
                    {t.assigned_volunteer_name ? (
                      <span className="inline-flex items-center gap-1 text-slate-800 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        {t.assigned_volunteer_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      {t.status === 'MATCHED' ? 'Squad Dispatched' : 'Active'}
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
