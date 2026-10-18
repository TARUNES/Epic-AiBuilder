import React, { useState } from 'react';
import { 
  CheckCircle, 
  ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';

const ACTION_TYPE_LABELS = {
  dispatch_volunteer_resource: 'Emergency Rescue Squad Dispatch',
  trigger_municipal_containment_protocol: 'Municipal Water Chlorination Protocol',
  restock_medical_inventory: 'Clinic Emergency Medical Restock',
  dispatch_chlorination_tanker: 'Mobile Water Tanker Deployment'
};

const DAY_1_PREVENTIVE_ACTIONS = [
  {
    action_id: 'ACT-DAY1-01',
    action_type: 'dispatch_volunteer_resource',
    title: 'Deploy Water Purification Sachets & Rations with Rescue Boats',
    target_area: 'Inundated 4th Main Road & Murugu Nagar',
    urgency: 'HIGH',
    status: 'APPROVED',
    approved_by: 'Chief Municipal Health Officer'
  },
  {
    action_id: 'ACT-DAY1-02',
    action_type: 'trigger_municipal_containment_protocol',
    title: 'Log & Geotag Sewage Breach Coordinates for Post-Flood Chlorination',
    target_area: 'All Phase 1 Active Hazard Anchors',
    urgency: 'HIGH',
    status: 'APPROVED',
    approved_by: 'Disaster Cell Incident Commander'
  }
];

export default function EpidemicReasoningCard({ 
  alert, 
  isWave2 = false,
  totalBioHazardCount = 5,
  activeClinicCount = 5,
  totalPresentingPatients = 257,
  surgePercent = 380,
  onActionApproved
}) {
  const [approvingActionId, setApprovingActionId] = useState(null);

  const isDay1Baseline = !isWave2;
  const isCritical = !isDay1Baseline && (alert ? alert.risk_probability >= 0.8 : true);

  const handleApprove = async (actionId) => {
    setApprovingActionId(actionId);
    try {
      const result = await api.approveAction(
        actionId,
        'Chief Municipal Health Officer',
        'Authorized under Public Health Act.'
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

  // Consumer-friendly clear explanation of current situation
  const dynamicReasoningParagraph = isDay1Baseline
    ? (totalBioHazardCount > 0 
        ? `Floodwaters are active. Rescue teams have logged ${totalBioHazardCount} flooded hazard points. Clinic patient counts currently remain at baseline (${totalPresentingPatients} patients visiting across ${activeClinicCount} clinics).`
        : `Monitoring active response network. No flood contamination incidents or patient surges reported yet.`)
    : (totalPresentingPatients > 0
        ? `${totalBioHazardCount} sewage overflows and stagnant water areas identified during the flood are upstream of ${activeClinicCount} local clinics that have seen a ${surgePercent}% surge in patients needing ORS and antibiotics (${totalPresentingPatients} patients). Early water chlorination and supply restocks are required to prevent widespread illness.`
        : `No illness outbreaks or medication spikes detected across reporting healthcare partners.`);

  const actionsList = alert?.action_proposals || [];

  return (
    <div className="superhuman-card p-6 space-y-6 text-[#292827]">
      
      {/* Header: Clean, uncluttered with exact logical Risk status */}
      <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#292827] tracking-tight">
            Health Alert
          </h3>
          <p className="text-xs text-[#73736e] mt-0.5">
            {isDay1Baseline 
              ? 'Tracking flood-linked health risks' 
              : 'Pattern found across nearby clinics'}
          </p>
        </div>

        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isDay1Baseline 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : (isCritical ? 'bg-rose-100 text-rose-800' : 'bg-[#d4c7ff]/50 text-[#1b1938]')
          }`}>
            {isDay1Baseline 
              ? 'Risk: 18% Low — Early Incubation' 
              : `Risk: ${Math.round((alert?.risk_probability || 0.93) * 100)}% Critical`}
          </span>
        </div>
      </div>

      {/* Pathogen & Deduction */}
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-white border border-black/[0.06] shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-[#73736e] uppercase tracking-wider">
            {isDay1Baseline ? 'Current Situation' : 'What we found'}
          </div>
          <div className="text-sm font-semibold text-[#292827]">
            {isDay1Baseline 
              ? 'Floodwaters active — monitoring for waterborne illness outbreaks' 
              : (alert?.suspected_pathogen_class || 'Waterborne illness spike — Diarrhea, vomiting, dehydration')}
          </div>
        </div>

        {/* Dynamic Reasoning Paragraph - 100% Consistent with Bottom Stat Cards */}
        <p className="text-xs text-[#292827] font-normal leading-relaxed bg-[#f7f5f2] p-4 rounded-xl border border-black/[0.04]">
          {dynamicReasoningParagraph}
        </p>
      </div>

      {/* Containment Action Orders */}
      <div className="space-y-3 pt-1">
        <div className="text-xs font-semibold text-[#73736e] uppercase tracking-wider">
          {isDay1Baseline ? 'Actions taken' : 'Recommended actions'}
        </div>

        <div className="space-y-3">
          {actionsList.length === 0 ? (
            <div className="p-4 rounded-xl bg-white border border-black/[0.06] text-xs text-[#73736e] text-center">
              No pending containment actions. System operating under normal protocols.
            </div>
          ) : (
            actionsList.map((action) => {
            const isApproved = action.status === 'APPROVED';
            const displayTitle = (action.title || '').replace(/Ward 14/gi, 'Affected Low-Lying Sectors');
            const displayTargetArea = (action.target_area || '').replace(/Ward 14/gi, 'Affected Low-Lying Sectors');

            return (
              <div 
                key={action.action_id}
                className="p-4 rounded-xl bg-white border border-black/[0.06] shadow-xs space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#73736e]">
                      {ACTION_TYPE_LABELS[action.action_type] || action.action_type}
                    </div>
                    <div className="text-sm font-semibold text-[#292827] mt-0.5">
                      {displayTitle}
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                    isApproved 
                      ? 'bg-emerald-50 text-[#027e6f]' 
                      : 'bg-[#d4c7ff]/40 text-[#1b1938]'
                  }`}>
                    {isApproved ? 'Approved' : 'Pending Authorization'}
                  </span>
                </div>

                <div className="text-xs text-[#73736e] flex items-center justify-between">
                  <span>Target Area: <strong className="text-[#292827] font-medium">{displayTargetArea}</strong></span>
                </div>

                {!isApproved ? (
                  <button
                    type="button"
                    onClick={() => handleApprove(action.action_id)}
                    disabled={approvingActionId === action.action_id}
                    className="w-full superhuman-btn-primary !h-10 text-xs !opacity-100 hover:!opacity-95"
                    style={{
                      background: '#1b1938',
                      color: '#ffffff',
                      opacity: 1
                    }}
                  >
                    <span className="text-white font-medium">
                      {approvingActionId === action.action_id ? 'Authorizing order...' : 'Authorize & Dispatch Order'}
                    </span>
                    <span className="superhuman-arrow-chip !p-1">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[#027e6f] font-medium pt-1">
                    <CheckCircle className="w-4 h-4 text-[#027e6f]" />
                    <span>Order signed by {action.approved_by || 'CMHO'}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
        </div>
      </div>

    </div>
  );
}
