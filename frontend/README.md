# EPIC-Hour Frontend

React 19 + Vite frontend application for EPIC-Hour (Epidemic Prediction & Immediate Crisis Hour).

## Overview

The frontend provides three crisis response portals:
- **Citizen SOS Portal (`CitizenSOSPortal.jsx`):** Zero-login emergency reporting with voice recording, live speech transcription, and automated triage status.
- **Clinic & Pharmacy Pulse Portal (`PharmacyPulsePortal.jsx`):** Syndromic telemetry ingestion, OTC medication rush tracking, and clinical dictation.
- **Municipal Command Center (`CommandCenter.jsx`):** Interactive tactical map, timeline switching between Wave 1 (Day 1 Acute Rescue) and Wave 2 (Day 5 Post-Flood Epidemic Surveillance), and one-click municipal action approvals.

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Default local port: `http://localhost:5173`

### Production Build
```bash
npm run build
```
