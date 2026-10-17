import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle, 
  ShieldAlert, 
  Droplets, 
  CloudRain, 
  Thermometer, 
  FileText,
  UserCheck,
  Building2
} from 'lucide-react';
import { api } from '../services/api';

const ACTION_TYPE_LABELS = {
  dispatch_volunteer_resource: 'Emergency Tactical Resource Dispatch',
  trigger_municipal_containment_protocol: 'Municipal Water Containment Protocol',
  restock_medical_inventory: 'Hospital & Clinic Emergency Medical Restock',
  dispatch_chlorination_tanker: 'Mobile Chlorination Tanker Deployment'
};

const PARAMETER_LABELS = {
  crew_id: 'Assigned Crew',
  resource: 'Resource Allocated',
  priority: 'Priority Tier',
  protocol_code: 'Protocol Reference',
  chlorination_ppm: 'Chlorination Level',
  alert_broadcast: 'Public SMS Broadcast',
  affected_population_estimate: 'Estimated Population in Zone',
  ors_cartons: 'ORS Cartons (50/pk)',
  iv_fluids_rl_cases: 'IV Fluids (Ringer’s Lactate Cases)',
  doxycycline_100mg_tabs: 'Doxycycline 100mg Tabs',
  volunteer_id: 'Assigned Responder Unit',
  ticket_id: 'Referenced SOS Ticket'
};

function formatParameterValue(key, val) {
  if (typeof val === 'boolean') return val ? 'Enabled (Active)' : 'Disabled';
  if (key === 'chlorination_ppm') return `${val} PPM (Standard Shock Dosage)`;
  if (key === 'priority' && val === 'P0_IMMEDIATE') return 'P0 Immediate Emergency';
  if (key === 'affected_population_estimate') return `${Number(val).toLocaleString()} residents`;
  if (key === 'resource' && val === 'CHLORINATION_TANKER_5000L') return '5,000L Mobile Water Chlorination Tanker';
  return String(val);
}

export default function EpidemicReasoningCard({ 
  alert, 
  onActionApproved
}) {
  const [approvingActionId, setApprovingActionId] = useState(null);

  if (!alert) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center text-slate-500">
        <Activity className="w-6 h-6 mx-auto text-slate-400 mb-2 animate-spin" />
        <p className="text-xs">Aggregating Ward Epidemiological Data...</p>
      </div>
    );
  }

  const handleApprove = async (actionId) => {
    setApprovingActionId(actionId);
    try {
      const result = await api.approveAction(
        actionId,
        'Chief Municipal Health Officer (Dr. M. Natarajan)',
        'Immediate execution authorized under Tamil Nadu Public Health Act.'
      );
      if (onActionApproved) {
        onActionApproved(result.action);
      }
    } catch (err) {
      console.error('Action approval failed:', err);
    } finally {
      setApprovingActionId(null);
    }
  };

  const isCritical = alert.risk_probability >= 0.8;
  const isModerate = alert.risk_probability >= 0.4 && alert.risk_probability < 0.8;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Header: Epidemiological Intelligence */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Epidemiological Risk Assessment
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              Ref: {alert.alert_id}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
            Ward 14 Post-Disaster Health Radar
          </h3>
        </div>

        {/* Probability Gauge Badge */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
          isCritical
            ? 'bg-red-50 border-red-200 text-red-700'
            : isModerate
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              Outbreak Probability
            </span>
            <span className="text-2xl font-black">
              {(alert.risk_probability * 100).toFixed(0)}%
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-current shadow-2xs">
            {alert.risk_level}
          </span>
        </div>
      </div>

      {/* Pathogen Classification */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Suspected Pathogen & Transmission Vector
        </span>
        <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          {alert.suspected_pathogen_class}
        </span>
      </div>

      {/* Causal Chain Explanation */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
          Causal Correlation Analysis
        </span>
        <p className="text-xs text-slate-600 leading-relaxed">
          {alert.causal_chain_reasoning}
        </p>

        {/* Environmental Drivers Badges (Formatted) */}
        {alert.environmental_drivers && alert.environmental_drivers.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Associated Environmental Vectors
            </span>
            <div className="flex flex-wrap gap-1.5">
              {alert.environmental_drivers.map((drv, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {drv}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meteorological Telemetry Strip */}
      {alert.weather_context && (
        <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-[10px] text-slate-500 block">Temperature</span>
              <span className="font-bold text-slate-800">
                {alert.weather_context.temperature_c}°C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <div>
              <span className="text-[10px] text-slate-500 block">Rel. Humidity</span>
              <span className="font-bold text-slate-800">
                {alert.weather_context.relative_humidity_pct}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-[10px] text-slate-500 block">Precipitation</span>
              <span className="font-bold text-slate-800">
                {alert.weather_context.precipitation_mm} mm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Municipal Action Protocols (Clean Key-Value Table, No Raw JSON!) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-600" />
            Municipal Containment & Resource Orders
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            Requires Health Officer Authorization
          </span>
        </div>

        <div className="space-y-3">
          {alert.action_proposals && alert.action_proposals.map((act) => {
            const isApproved = act.status === 'APPROVED';
            const isProcessing = approvingActionId === act.action_id;

            return (
              <div
                key={act.action_id}
                className={`p-4 rounded-xl border transition-all ${
                  isApproved
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Protocol Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${isApproved ? 'text-emerald-600' : 'text-blue-600'}`} />
                    <span className="text-xs font-bold text-slate-900">
                      {act.title}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold w-fit ${
                    isApproved 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {isApproved ? 'ORDER EXECUTED' : 'PENDING APPROVAL'}
                  </span>
                </div>

                {/* Structured Key-Value Details */}
                <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 space-y-1 mb-3 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operation Type:</span>
                    <span className="font-semibold text-slate-800">
                      {ACTION_TYPE_LABELS[act.action_type] || act.action_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Area:</span>
                    <span className="font-semibold text-slate-800">{act.target_area}</span>
                  </div>

                  {/* Clean key-value parameter breakdown (no raw JSON!) */}
                  {act.parameters && Object.keys(act.parameters).map((paramKey) => {
                    const label = PARAMETER_LABELS[paramKey] || paramKey;
                    const val = formatParameterValue(paramKey, act.parameters[paramKey]);
                    return (
                      <div key={paramKey} className="flex justify-between border-t border-slate-200/60 pt-1 text-[11px]">
                        <span className="text-slate-500">{label}:</span>
                        <span className="font-medium text-slate-700">{val}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Button or Confirmation */}
                {isApproved ? (
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-2 rounded-lg border border-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      Approved by {act.approved_by || 'Chief Municipal Health Officer'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700">
                      Dispatched to Field Squad
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleApprove(act.action_id)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      'Authorizing Protocol...'
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Authorize & Execute Municipal Order
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
