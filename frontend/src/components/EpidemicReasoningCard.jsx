import React, { useState } from 'react';
import { 
  CheckCircle, 
  Activity,
  Droplets, 
  Send
} from 'lucide-react';
import { api } from '../services/api';

const ACTION_TYPE_LABELS = {
  dispatch_volunteer_resource: 'Emergency Rescue Squad Dispatch',
  trigger_municipal_containment_protocol: 'Municipal Water Chlorination Protocol',
  restock_medical_inventory: 'Clinic Emergency Medical Restock',
  dispatch_chlorination_tanker: 'Mobile Water Tanker Deployment'
};

export default function EpidemicReasoningCard({ 
  alert, 
  onActionApproved
}) {
  const [approvingActionId, setApprovingActionId] = useState(null);

  if (!alert) {
    return (
      <div className="mercury-panel p-6 text-center text-[#afb4cd] space-y-2">
        <Activity className="w-5 h-5 mx-auto text-[#5266eb] animate-spin" />
        <p className="text-xs font-light">Correlating flood and syndromic telemetry...</p>
      </div>
    );
  }

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

  const isCritical = alert.risk_probability >= 0.8;

  return (
    <div className="mercury-panel p-6 space-y-6 text-[#ededf3]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(175,180,205,0.12)] pb-4">
        <div>
          <div className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider">
            Spatio-Temporal Analysis
          </div>
          <h3 className="text-base font-normal text-[#ededf3] mt-0.5">
            Epidemiological reasoning
          </h3>
        </div>

        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-medium ${
            isCritical ? 'bg-[#fc92b4]/20 text-[#fc92b4]' : 'bg-[#5266eb]/20 text-[#9bb4e6]'
          }`}>
            Risk: {Math.round(alert.risk_probability * 100)}%
          </span>
        </div>
      </div>

      {/* Pathogen & Deduction in Humanist Text */}
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-[#272735] border border-[rgba(175,180,205,0.15)] space-y-1.5">
          <div className="text-[11px] font-light text-[#afb4cd] uppercase tracking-wider">
            Suspected Pathogen Class
          </div>
          <div className="text-sm font-medium text-[#ededf3]">
            {alert.suspected_pathogen_class || 'Vibrio Cholerae / Acute Enteric Outbreak'}
          </div>
        </div>

        <p className="text-xs text-[#c3c3cc] font-light leading-relaxed">
          {alert.causal_chain_reasoning}
        </p>
      </div>

      {/* Human-in-the-Loop Action Orders */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-light text-[#afb4cd] uppercase tracking-wider">
          Proposed Containment Actions
        </div>

        <div className="space-y-3">
          {(alert.action_proposals || []).map((action) => {
            const isApproved = action.status === 'APPROVED';

            return (
              <div 
                key={action.action_id}
                className="p-4 rounded-xl bg-[#272735] border border-[rgba(175,180,205,0.15)] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-light text-[#afb4cd]">
                      {ACTION_TYPE_LABELS[action.action_type] || action.action_type}
                    </div>
                    <div className="text-sm font-medium text-[#ededf3] mt-0.5">
                      {action.title}
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                    isApproved 
                      ? 'bg-[#5266eb]/20 text-[#9bb4e6]' 
                      : 'bg-[#fc92b4]/20 text-[#fc92b4]'
                  }`}>
                    {isApproved ? 'Approved' : 'Pending Authorization'}
                  </span>
                </div>

                <div className="text-xs text-[#c3c3cc] font-light flex items-center justify-between">
                  <span>Target Area: <strong className="text-[#ededf3] font-normal">{action.target_area}</strong></span>
                </div>

                {!isApproved ? (
                  <button
                    type="button"
                    onClick={() => handleApprove(action.action_id)}
                    disabled={approvingActionId === action.action_id}
                    className="w-full mercury-btn-primary h-9 text-xs"
                  >
                    {approvingActionId === action.action_id ? (
                      <span>Authorizing order...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Authorize & Dispatch Order</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[#9bb4e6] font-light pt-1">
                    <CheckCircle className="w-4 h-4 text-[#5266eb]" />
                    <span>Order signed by {action.approved_by || 'CMHO'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
