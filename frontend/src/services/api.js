import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  // System State & Overview
  getState: async (ward_id = 'WARD_14') => {
    const res = await apiClient.get('/state', { params: { ward_id } });
    return res.data;
  },

  // Phase 1: Citizen SOS Ingest
  ingestSOS: async (payload) => {
    const res = await apiClient.post('/sos/ingest', payload);
    return res.data;
  },

  // Active SOS Tickets
  getActiveSOS: async () => {
    const res = await apiClient.get('/sos/active');
    return res.data;
  },

  // Verified Facilities for Portal B
  getVerifiedFacilities: async () => {
    const res = await apiClient.get('/facilities/verified');
    return res.data;
  },

  // Phase 2: Verified Pharmacy & Healthcare Pulse
  submitPharmacyPulse: async (payload) => {
    const res = await apiClient.post('/surveillance/pulse', payload);
    return res.data;
  },

  // Geospatial Heatmap & Features
  getHeatmap: async (phase = 1, ward_id = 'WARD_14') => {
    const res = await apiClient.get('/surveillance/heatmap', {
      params: { phase, ward_id },
    });
    return res.data;
  },

  // Demo Simulation State Switcher
  simulateDay: async (day) => {
    const res = await apiClient.post('/demo/simulate-day', { day });
    return res.data;
  },

  // Human-in-the-Loop Municipal Action Approval
  approveAction: async (action_id, approver_name = 'Chief Municipal Health Officer', notes = null) => {
    const res = await apiClient.post('/action/approve', {
      action_id,
      approver_name,
      notes,
    });
    return res.data;
  },

  // Staff & Partner Authentication
  login: async (role, identifier, password) => {
    const res = await apiClient.post('/auth/login', {
      role,
      identifier,
      password,
    });
    return res.data;
  },
};

export default api;
