import React, { useState, useMemo } from 'react';
import { 
  Store, 
  LifeBuoy, 
  Droplets, 
  X
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const VELACHERY_CENTER = [12.9775, 80.2212];

const HAZARD_NAMES = {
  SEWAGE_OVERFLOW: 'Sewage Overflow Breach',
  STAGNANT_FLOODWATER: 'Stagnant Floodwater Pool',
  CONTAMINATED_WELL: 'Contaminated Well / Sump',
  CARCASS_DEBRIS: 'Animal / Biological Debris',
  POWER_GRID_FAIL: 'Submerged Transformer Hazard'
};

const CATEGORY_NAMES = {
  MEDICAL_EVACUATION: 'Medical Evacuation',
  STRANDED_FLOOD: 'Stranded Flood Rescue',
  FOOD_WATER_CRITICAL: 'Potable Water & Food Crisis',
  STRUCTURAL_COLLAPSE: 'Structural Collapse',
  ELECTRICAL_HAZARD: 'Electrical Grid Hazard'
};

export default function EpicHourMap({
  phase = 1,
  tickets = [],
  facilities = [],
  volunteers = [],
  pulses = []
}) {
  const [showHazards, setShowHazards] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const hazardNodes = useMemo(() => {
    return tickets.filter(
      (t) => t.triage?.environmental_hazard_logged?.length > 0
    );
  }, [tickets]);

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
      
      {/* Top Map Controls Overlay */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Badge: Ward Location & Count */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-extrabold text-slate-900">Ward 14 Velachery</span>
          <span className="text-slate-500 font-medium hidden sm:inline">
            · {phase === 1 ? `${tickets.length} Active Incidents` : `${pulses.length} Clinic Reports`}
          </span>
        </div>

        {/* Right: Layer Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-slate-200 shadow-sm text-xs">
          <button
            type="button"
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              showHazards 
                ? 'bg-purple-50 text-purple-800 border border-purple-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-purple-600" />
            <span>Hazard Anchors</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFacilities(!showFacilities)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              showFacilities 
                ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-teal-600" />
            <span>Pharmacies</span>
          </button>

          {phase === 1 && (
            <button
              type="button"
              onClick={() => setShowVolunteers(!showVolunteers)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                showVolunteers 
                  ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
              <span>Responders</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Container using CartoDB Positron (High-trust Light Tiles) */}
      <MapContainer
        center={VELACHERY_CENTER}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* PHASE 1: Active Rescue Incident Markers */}
        {phase === 1 &&
          tickets.map((t) => {
            const urgency = t.triage?.urgency_score || 5;
            const isCritical = urgency >= 9.0;
            const fillColor = isCritical ? '#dc2626' : urgency >= 7.5 ? '#d97706' : '#2563eb';

            return (
              <CircleMarker
                key={t.ticket_id}
                center={[t.location.lat, t.location.lng]}
                radius={isCritical ? 11 : 8}
                pathOptions={{
                  fillColor: fillColor,
                  fillOpacity: 0.9,
                  color: '#ffffff',
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedItem({ type: 'SOS_TICKET', data: t });
                    if (onSelectTicket) onSelectTicket(t);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                  <div className="text-xs font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">#{t.ticket_id}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800">
                        Priority {urgency}/10
                      </span>
                    </div>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      {CATEGORY_NAMES[t.triage?.category] || t.triage?.category}
                    </div>
                    <div className="text-[11px] text-slate-500">{t.location?.address}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

        {/* PHASE 2: Persistent Hazard Anchors */}
        {phase === 2 && showHazards &&
          hazardNodes.map((t) => (
            <React.Fragment key={`hazard-${t.ticket_id}`}>
              <Circle
                center={[t.location.lat, t.location.lng]}
                radius={160}
                pathOptions={{
                  color: '#9333ea',
                  fillColor: '#a855f7',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
              <CircleMarker
                center={[t.location.lat, t.location.lng]}
                radius={7}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#7e22ce',
                  fillOpacity: 0.95,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <div className="text-xs font-sans">
                    <span className="text-[10px] font-bold text-purple-700 block uppercase">
                      Persistent Bio-Hazard Breach Point
                    </span>
                    <span className="font-bold text-slate-900">
                      {t.triage?.environmental_hazard_logged?.map((h) => HAZARD_NAMES[h] || h).join(', ')}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Recorded at: {t.location?.address}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          ))}

        {/* PHASE 2: Pharmacy Daily Surveillance Clusters */}
        {phase === 2 &&
          pulses.map((p) => {
            const patientCount = p.extracted_signals?.estimated_patient_count || 10;
            const radius = Math.min(26, Math.max(10, Math.floor(patientCount / 3)));

            return (
              <React.Fragment key={`pulse-${p.pulse_id}`}>
                <Circle
                  center={[p.location.lat, p.location.lng]}
                  radius={radius * 12}
                  pathOptions={{
                    color: '#e11d48',
                    fillColor: '#f43f5e',
                    fillOpacity: 0.2,
                    weight: 1.5,
                  }}
                />
                <CircleMarker
                  center={[p.location.lat, p.location.lng]}
                  radius={radius}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: '#e11d48',
                    fillOpacity: 0.95,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'PHARMACY_PULSE', data: p }),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <div className="text-xs font-sans">
                      <span className="font-bold text-slate-900 block">{p.facility_name}</span>
                      <div className="text-[11px] font-semibold text-rose-700 mt-0.5">
                        {p.extracted_signals?.estimated_patient_count} presenting patients
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Surging: {p.extracted_signals?.medications_spiking?.join(', ')}
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              </React.Fragment>
            );
          })}

        {/* Verified Pharmacies & Clinics */}
        {showFacilities &&
          facilities.map((fac) => (
            <CircleMarker
              key={fac.facility_id}
              center={[fac.location.lat, fac.location.lng]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#059669',
                fillOpacity: 0.95,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => setSelectedItem({ type: 'FACILITY', data: fac }),
              }}
            >
              <Tooltip direction="bottom" offset={[0, 6]}>
                <div className="text-xs font-sans">
                  <span className="font-bold text-slate-900 block">{fac.facility_name}</span>
                  <span className="text-[10px] text-slate-500">Verified Healthcare Partner</span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

        {/* Volunteer Rescue Units (Phase 1) */}
        {phase === 1 && showVolunteers &&
          volunteers.map((vol) => (
            <CircleMarker
              key={vol.volunteer_id}
              center={[vol.lat, vol.lng]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#2563eb',
                fillOpacity: 0.95,
                weight: 1.5,
              }}
            >
              <Tooltip direction="bottom" offset={[0, 6]}>
                <div className="text-xs font-sans">
                  <span className="font-bold text-slate-900 block">{vol.name}</span>
                  <span className="text-[10px] text-slate-500">Rescue Squad</span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-4">
          {phase === 1 ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>P0 Emergency Evacuation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Priority Flood Rescue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Active Rescue Unit</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Symptom / Medication Surge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                <span>Persisted Sewage Breach</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Verified Facility</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          CartoDB Light Tactical Grid · Velachery Ward 14
        </div>
      </div>

      {/* Selected Item Drawer */}
      {selectedItem && (
        <div className="absolute bottom-12 right-4 max-w-sm z-[1000] bg-white rounded-xl border border-slate-300 p-4 shadow-lg text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-sm">
              {selectedItem.type === 'SOS_TICKET' && `Incident Ticket #${selectedItem.data.ticket_id}`}
              {selectedItem.type === 'PHARMACY_PULSE' && selectedItem.data.facility_name}
              {selectedItem.type === 'FACILITY' && selectedItem.data.facility_name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedItem.type === 'SOS_TICKET' && (
            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Priority: <strong className="text-red-600">{selectedItem.data.triage?.urgency_score}/10</strong></span>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-medium">
                  {CATEGORY_NAMES[selectedItem.data.triage?.category] || selectedItem.data.triage?.category}
                </span>
              </div>
              <p className="text-slate-800">{selectedItem.data.raw_input}</p>
              {selectedItem.data.assigned_volunteer_name && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-blue-800">
                  Assigned Team: {selectedItem.data.assigned_volunteer_name} ({selectedItem.data.assigned_volunteer_eta_minutes} min ETA)
                </div>
              )}
            </div>
          )}

          {selectedItem.type === 'PHARMACY_PULSE' && (
            <div className="space-y-1.5 text-slate-600">
              <div>Presenting Patients: <strong className="text-rose-600">{selectedItem.data.extracted_signals?.estimated_patient_count}</strong></div>
              <div>Spiking Meds: <strong className="text-slate-800">{selectedItem.data.extracted_signals?.medications_spiking?.join(', ')}</strong></div>
              <div>Stockouts: <span className="text-red-700 font-semibold">{selectedItem.data.extracted_signals?.stockout_warning?.join(', ') || 'None'}</span></div>
              <p className="text-slate-700 mt-1">{selectedItem.data.raw_summary}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
