import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Minus, 
  CheckCircle, 
  Mic, 
  MicOff, 
  ArrowRight,
  Volume2,
  RotateCcw
} from 'lucide-react';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { api } from '../services/api';

const KEY_MEDICATIONS = [
  { key: 'ORS_PACKETS', name: 'ORS hydration sachets', sub: 'Electrolytes for diarrhea / dehydration' },
  { key: 'PARACETAMOL', name: 'Paracetamol / fever tablets', sub: 'Acute fever & systemic symptoms' },
  { key: 'DOXYCYCLINE', name: 'Doxycycline / antibiotics', sub: 'Water-borne bacterial protocol' },
];

const FACILITIES = [
  { id: 'PHARM-MEDPLUS-14', name: 'MedPlus Pharmacy · Velachery Main Rd', zone: 'Zone 14 (South)' },
  { id: 'PHARM-APOLLO-02', name: 'Apollo Pharmacy · Bypass Junction', zone: 'Zone 14 (East)' },
  { id: 'PHARM-JANAUSHADHI-03', name: 'Jan Aushadhi Kendra · Taramani Link', zone: 'Zone 13 (Central)' },
  { id: 'CLINIC-UPHC-04', name: 'Urban Primary Health Centre (UPHC)', zone: 'Zone 14 (Core)' },
  { id: 'PHARM-HEALTHCARE-05', name: 'Apollo 24/7 Clinic · 100ft Bypass Road', zone: 'Zone 13 (West)' }
];

export default function PharmacyPulsePortal({ currentUser, onPulseSubmitted }) {
  const [selectedFacilityId, setSelectedFacilityId] = useState(
    currentUser?.user?.facility_id || 'PHARM-MEDPLUS-14'
  );
  const [stockouts, setStockouts] = useState(['ORS_PACKETS']);
  const [patientCount, setPatientCount] = useState(60);
  const [notesText, setNotesText] = useState('Sharp 300% surge in acute watery diarrhea and vomiting over the last 24 hours. Multiple families report discolored tap water.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const selectedFacility = FACILITIES.find((f) => f.id === selectedFacilityId) || FACILITIES[0];
  const facilityId = selectedFacility.id;

  const {
    isRecording,
    recordingTime,
    audioBase64,
    audioUrl,
    audioMime,
    isTranscribing,
    startRecording,
    stopRecording,
    resetRecording
  } = useMediaRecorder();

  const handleToggleDictation = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording({
        context: 'pharmacy',
        onTranscript: (liveText) => {
          if (liveText) {
            setNotesText(liveText);
          }
        }
      });
    }
  };

  const toggleStockout = (key) => {
    setStockouts((prev) => 
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        facility_id: facilityId,
        license_token: currentUser?.user?.license_number || 'PHARM-LIC-VERIFIED-VLC-01',
        text: notesText || undefined,
        audio_b64: audioBase64 || undefined,
        audio_mime: audioMime,
        otc_counts: {
          ORS_PACKETS: stockouts.includes('ORS_PACKETS') ? 0 : 50,
          PARACETAMOL: stockouts.includes('PARACETAMOL') ? 0 : 40,
          DOXYCYCLINE: stockouts.includes('DOXYCYCLINE') ? 0 : 25,
        },
        stockouts: stockouts,
        estimated_patient_count: Number(patientCount)
      };

      const result = await api.submitPharmacyPulse(payload);
      setSubmitSuccess(result);
      if (onPulseSubmitted) {
        onPulseSubmitted(result.pulse);
      }
    } catch (err) {
      console.error('Pulse submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Superhuman Clean Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#027e6f]/10 text-[#027e6f] border border-[#027e6f]/20 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#027e6f] animate-pulse" />
          <span>Community Clinic Network</span>
        </div>
        <h1 className="superhuman-headline !text-3xl sm:!text-4xl">
          Clinic daily update
        </h1>
        <p className="text-sm text-[#73736e]">
          Verified Local Healthcare Partner · Share medication demand trends so local response teams can deploy water purification and medical supplies where needed.
        </p>

        {/* Facility / Zone Selector Dropdown */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] shadow-xs text-xs">
            <Store className="w-3.5 h-3.5 text-[#027e6f]" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent font-medium text-[#292827] focus:outline-none cursor-pointer"
            >
              {FACILITIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.zone})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Streamlined Card */}
      <div className="superhuman-card p-6 sm:p-8 space-y-6">
        
        {/* 1. Presenting Patients Today Stepper */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-black/[0.06] shadow-xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-sm font-semibold text-[#292827]">Presenting patients today</div>
            <div className="text-xs text-[#73736e]">Estimated customers seeking gastro or fever relief</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPatientCount(Math.max(0, patientCount - 5))}
              className="w-9 h-9 rounded-full bg-[#f2f0eb] hover:bg-[#e6e3dc] flex items-center justify-center text-[#292827] transition-all cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono text-xl text-[#292827] w-12 text-center font-bold">
              {patientCount}
            </span>
            <button
              type="button"
              onClick={() => setPatientCount(patientCount + 5)}
              className="w-9 h-9 rounded-full bg-[#f2f0eb] hover:bg-[#e6e3dc] flex items-center justify-center text-[#292827] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. 3 Key OTC Medication Rows with In stock / Stockout Pills */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-[#73736e] uppercase tracking-wider">
            Key Medication Stock Status
          </div>

          <div className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
            {KEY_MEDICATIONS.map((med) => {
              const isStockout = stockouts.includes(med.key);

              return (
                <div key={med.key} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[#292827]">{med.name}</div>
                    <div className="text-xs text-[#73736e]">{med.sub}</div>
                  </div>

                  {/* Simple In stock / Stockout Pill Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleStockout(med.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isStockout
                        ? 'bg-rose-100 text-rose-800 border border-rose-200 shadow-xs'
                        : 'bg-[#d4c7ff]/40 text-[#1b1938] hover:bg-[#d4c7ff]/70'
                    }`}
                  >
                    {isStockout ? '● Stockout' : 'In stock'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Single Voice / Text Note Input with Live Speech-to-Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#73736e]">
              Clinical notes or pattern observations
            </label>
            <button
              type="button"
              onClick={handleToggleDictation}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-rose-100 text-rose-800 animate-pulse font-semibold' 
                  : 'text-[#1b1938] bg-black/[0.04] hover:bg-black/[0.08]'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? `Recording (${formatSeconds(recordingTime)})` : 'Dictate note'}</span>
            </button>
          </div>

          {/* Dictated Audio Playback Bar */}
          {audioUrl && (
            <div className="p-3.5 rounded-xl bg-white border border-black/[0.08] shadow-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-[#1b1938]" />
                  <span className="text-xs font-semibold text-[#1b1938]">Dictated Voice Note</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {recordingTime > 0 ? `${formatSeconds(recordingTime)} recorded` : 'Audio attached'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetRecording}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear / Re-record</span>
                </button>
              </div>
              <audio controls src={audioUrl} className="w-full h-8 rounded-lg focus:outline-none" />
            </div>
          )}

          {/* Real-time Transcription Status Indicator */}
          {isTranscribing && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#1b1938] px-3 py-2 rounded-lg bg-[#d4c7ff]/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#353088] animate-ping" />
              <span>Transcribing clinical dictation via Gemini 2.5 Flash...</span>
            </div>
          )}

          <textarea
            rows={3}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="e.g. Surge in vomiting and acute diarrhea among children from 4th Main Road."
            className="w-full superhuman-input text-sm"
          />
        </div>

        {/* 4. Primary CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full superhuman-btn-primary !opacity-100 hover:!opacity-95"
            style={{
              background: '#1b1938',
              color: '#ffffff',
              opacity: 1,
            }}
          >
            <span className="text-white font-medium text-sm">
              {isSubmitting ? 'Transmitting daily pulse...' : 'Submit daily pulse'}
            </span>
            <span className="superhuman-arrow-chip">
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          </button>
        </div>

      </div>

      {/* Success Notification */}
      {submitSuccess && (
        <div className="superhuman-glass-card p-6 space-y-2 border-emerald-200 bg-emerald-50/70 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-[#027e6f]">
            <CheckCircle className="w-5 h-5 text-[#027e6f]" />
            <span className="text-base text-[#292827] font-semibold">Update received by health authorities</span>
          </div>
          <p className="text-xs text-[#73736e]">
            Logged for <strong className="text-[#292827] font-mono">{facilityId}</strong>. Coordinated response teams and water treatment units have been alerted.
          </p>
        </div>
      )}

    </div>
  );
}
