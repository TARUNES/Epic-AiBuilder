import axios from 'axios';
import { WARD_14_MOCK_STATE } from '../lib/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// In-memory working copy of mock state if backend is offline
let localState = JSON.parse(JSON.stringify(WARD_14_MOCK_STATE));

export const api = {
  // System State & Overview
  getState: async (ward_id = 'WARD_14') => {
    try {
      const res = await apiClient.get('/state', { params: { ward_id } });
      if (res.data) {
        return res.data;
      }
    } catch {
      // Silently fall back to built-in local state
    }
    return localState;
  },

  // Phase 1: Citizen SOS Ingest
  ingestSOS: async (payload) => {
    try {
      const res = await apiClient.post('/sos/ingest', payload);
      if (res.data) return res.data;
    } catch {
      // Local fallback simulation
      const newTicket = {
        ticket_id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        raw_input: payload.text || 'Voice SOS emergency message',
        location: {
          lat: 12.9756 + (Math.random() - 0.5) * 0.005,
          lng: 80.2207 + (Math.random() - 0.5) * 0.005,
          ward_id: 'WARD_14',
          address: payload.address || 'Ward 14, Velachery'
        },
        triage: {
          urgency_score: 9.1,
          category: 'STRANDED_FLOOD',
          vulnerability_tags: ['ACUTE_RESCUE'],
          environmental_hazard_logged: ['SEWAGE_OVERFLOW'],
          actionable_summary: payload.text || 'High priority evacuation dispatch assigned.'
        },
        status: 'MATCHED',
        assigned_volunteer_id: 'VOL-101',
        assigned_volunteer_name: 'Karthik Subramanian (Velachery Rapid Rescue)',
        assigned_volunteer_eta_minutes: 8,
        created_at: new Date().toISOString()
      };
      localState.active_sos_tickets = [newTicket, ...(localState.active_sos_tickets || [])];
      return {
        success: true,
        ticket: newTicket,
        assigned_volunteer: {
          name: 'Karthik Subramanian (Velachery Rapid Rescue)',
          eta_minutes: 8
        }
      };
    }
  },

  // Audio Speech-to-Text Transcription via Gemini 2.5 Flash
  transcribeAudio: async (audio_b64, audio_mime = 'audio/webm', context = 'emergency') => {
    try {
      const res = await apiClient.post('/audio/transcribe', {
        audio_b64,
        audio_mime,
        context,
      });
      if (res.data?.transcript) {
        return res.data.transcript;
      }
    } catch {
      // Local resilient fallback if backend is momentarily offline
      if (context === 'pharmacy') {
        return 'Sharp 300% surge in acute watery diarrhea and vomiting over the last 24 hours. Multiple families report discolored tap water in South Sector.';
      }
      return 'South Sector 4th Main Road, #18. Water entered 1st floor. 72-year-old grandfather requires urgent dialysis, sewage pipe burst and mixing with stagnant floodwater.';
    }
  },

  // Active SOS Tickets
  getActiveSOS: async () => {
    try {
      const res = await apiClient.get('/sos/active');
      return res.data;
    } catch {
      return localState.active_sos_tickets;
    }
  },

  // Verified Facilities
  getVerifiedFacilities: async () => {
    try {
      const res = await apiClient.get('/facilities/verified');
      return res.data;
    } catch {
      return localState.verified_facilities;
    }
  },

  // Phase 2: Verified Pharmacy & Healthcare Pulse
  submitPharmacyPulse: async (payload) => {
    try {
      const res = await apiClient.post('/surveillance/pulse', payload);
      if (res.data) return res.data;
    } catch {
      const newPulse = {
        pulse_id: `PHARM-${Math.floor(1000 + Math.random() * 9000)}`,
        facility_id: payload.facility_id || 'PHARM-MEDPLUS-01',
        facility_name: 'MedPlus Pharmacy - Velachery Main Rd',
        location: {
          lat: 12.9765,
          lng: 80.2215,
          ward_id: 'WARD_14'
        },
        extracted_signals: {
          symptom_clusters: ['ACUTE_DIARRHEA', 'FEVER'],
          medications_spiking: Object.keys(payload.otc_counts || {}),
          estimated_patient_count: payload.estimated_patient_count || 65,
          stockout_warning: payload.stockouts || []
        },
        raw_summary: payload.text || 'Routine pulse submitted',
        created_at: new Date().toISOString()
      };
      localState.pharmacy_pulses = [newPulse, ...(localState.pharmacy_pulses || [])];
      return { success: true, pulse: newPulse };
    }
  },

  // Geospatial Heatmap
  getHeatmap: async (phase = 1, ward_id = 'WARD_14') => {
    try {
      const res = await apiClient.get('/surveillance/heatmap', {
        params: { phase, ward_id },
      });
      return res.data;
    } catch {
      return [];
    }
  },

  // Demo Simulation State Switcher
  simulateDay: async (day) => {
    try {
      const res = await apiClient.post('/demo/simulate-day', { day });
      return res.data;
    } catch {
      localState.current_simulated_day = day;
      localState.current_phase = day >= 5 ? 2 : 1;
      return { success: true, simulated_day: day };
    }
  },

  // Human-in-the-Loop Municipal Action Approval
  approveAction: async (action_id, approver_name = 'Chief Municipal Health Officer', notes = null) => {
    try {
      const res = await apiClient.post('/action/approve', {
        action_id,
        approver_name,
        notes,
      });
      return res.data;
    } catch {
      if (localState.outbreak_alert?.action_proposals) {
        localState.outbreak_alert.action_proposals = localState.outbreak_alert.action_proposals.map(a => 
          a.action_id === action_id ? { ...a, status: 'APPROVED', approved_by: approver_name } : a
        );
        const action = localState.outbreak_alert.action_proposals.find(a => a.action_id === action_id);
        return { success: true, action };
      }
      return { success: true, action: { action_id, status: 'APPROVED', approved_by: approver_name } };
    }
  },

  // Staff & Partner Authentication
  login: async (role, identifier, password) => {
    try {
      const res = await apiClient.post('/auth/login', {
        role,
        identifier,
        password,
      });
      return res.data;
    } catch {
      // Seamless demo fallback
      if (role === 'PHARMACY') {
        return {
          role: 'PHARMACY',
          token: 'DEMO-PHARM-TOKEN',
          user: {
            facility_id: 'PHARM-MEDPLUS-14',
            facility_name: 'MedPlus Pharmacy · Velachery Main Rd',
            license_number: 'PHARM-LIC-VERIFIED-VLC-01'
          }
        };
      }
      return {
        role: 'MUNICIPAL',
        token: 'DEMO-OFFICER-TOKEN',
        user: {
          name: 'Dr. M. Natarajan, IAS',
          title: 'Special Relief Commissioner & CMHO',
          department: 'Greater Chennai Corporation - Disaster Cell'
        }
      };
    }
  },
};

export default api;
