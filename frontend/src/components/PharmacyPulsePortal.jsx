import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Minus, 
  CheckCircle, 
  Mic, 
  MicOff, 
  Send,
  AlertCircle
} from 'lucide-react';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { api } from '../services/api';

const MEDICATIONS = [
  { key: 'ORS_PACKETS', name: 'ORS hydration sachets', sub: 'Electrolytes for diarrhea / dehydration' },
  { key: 'PARACETAMOL', name: 'Paracetamol / fever tablets', sub: 'Acute fever relief' },
  { key: 'DOXYCYCLINE', name: 'Doxycycline & antibiotics', sub: 'Water-borne bacterial protocol' },
  { key: 'ANTI_DIARRHEAL', name: 'Anti-diarrheal suspension', sub: 'Gastroenteritis symptoms' },
  { key: 'IV_FLUIDS', name: 'IV saline / Ringers lactate', sub: 'Severe dehydration cases' }
];

export default function PharmacyPulsePortal({ currentUser, onPulseSubmitted }) {
  const [otcCounts, setOtcCounts] = useState({
    ORS_PACKETS: 65,
    DOXYCYCLINE: 25,
    PARACETAMOL: 40,
    ANTI_DIARRHEAL: 30,
    IV_FLUIDS: 12
  });
  const [stockouts, setStockouts] = useState(['ORS_PACKETS']);
  const [patientCount, setPatientCount] = useState(60);
  const [notesText, setNotesText] = useState('Sharp 300% surge in acute watery diarrhea and vomiting over the last 24 hours. Multiple families report discolored tap water.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const facilityId = currentUser?.user?.facility_id || 'PHARM-MEDPLUS-01';
  const licenseToken = currentUser?.user?.license_number || 'PHARM-LIC-VERIFIED-VLC-01';
  const facilityName = currentUser?.user?.facility_name || 'MedPlus Pharmacy · Velachery Main Rd';

  const {
    isRecording,
    recordingTime,
    audioBase64,
    audioMime,
    startRecording,
    stopRecording,
    resetRecording
  } = useMediaRecorder();

  const updateCount = (key, delta) => {
    setOtcCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  const toggleStockout = (key) => {
    setStockouts((prev) => 
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        facility_id: facilityId,
        license_token: licenseToken,
        text: notesText || undefined,
        audio_b64: audioBase64 || undefined,
        audio_mime: audioMime,
        otc_counts: otcCounts,
        stockouts: stockouts,
        estimated_patient_count: Number(patientCount)
      };

      const result = await api.submitPharmacyPulse(payload);
      setSubmitSuccess(result);
      if (onPulseSubmitted) {
        onPulseSubmitted(result);
      }
    } catch (err) {
      console.error('Pulse submission failed:', err);
      setErrorMessage('Submission failed. Check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 text-[#ededf3]">
      
      {/* Calm, Humanist Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9bb4e633] text-xs font-light text-[#9bb4e6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
          <span>Neighborhood Health Radar</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal text-[#ededf3] tracking-tight">
          Clinic daily pulse
        </h1>
        <p className="text-sm text-[#c3c3cc] font-light leading-relaxed">
          {facilityName}. Report unusual medication rushes so public health teams can treat water sources before hospital beds overflow.
        </p>
      </div>

      {/* Main Capsule Panel */}
      <div className="mercury-panel p-6 sm:p-8 space-y-8">
        
        {/* Patient Volume Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#272735] border border-[rgba(175,180,205,0.15)]">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-sm font-medium text-[#ededf3]">Presenting patients today</div>
            <div className="text-xs text-[#afb4cd] font-light">Estimated customers seeking gastro or fever relief</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPatientCount(Math.max(0, patientCount - 5))}
              className="w-9 h-9 rounded-full bg-[#171721] hover:bg-[#1e1e2a] flex items-center justify-center text-[#ededf3]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono text-xl text-[#ededf3] w-12 text-center font-medium">
              {patientCount}
            </span>
            <button
              type="button"
              onClick={() => setPatientCount(patientCount + 5)}
              className="w-9 h-9 rounded-full bg-[#171721] hover:bg-[#1e1e2a] flex items-center justify-center text-[#ededf3]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1-Tap Medication Spikes with Hairline Rows */}
        <div className="space-y-3">
          <div className="text-xs font-light text-[#afb4cd] uppercase tracking-wider">
            Medication velocity (Last 24 Hours)
          </div>

          <div className="divide-y divide-[rgba(175,180,205,0.1)] border-y border-[rgba(175,180,205,0.1)]">
            {MEDICATIONS.map((med) => {
              const count = otcCounts[med.key] || 0;
              const isStockout = stockouts.includes(med.key);

              return (
                <div key={med.key} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[#ededf3]">{med.name}</div>
                    <div className="text-xs text-[#afb4cd] font-light">{med.sub}</div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    {/* Stockout indicator pill */}
                    <button
                      type="button"
                      onClick={() => toggleStockout(med.key)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        isStockout 
                          ? 'bg-[#fc92b4]/20 text-[#fc92b4] border border-[#fc92b4]/40 font-medium' 
                          : 'bg-[#171721] text-[#afb4cd] border border-[rgba(175,180,205,0.15)] hover:text-[#ededf3]'
                      }`}
                    >
                      {isStockout ? 'Stockout reported' : 'In stock'}
                    </button>

                    {/* Stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCount(med.key, -5)}
                        className="w-8 h-8 rounded-full bg-[#272735] hover:bg-[#171721] flex items-center justify-center text-[#ededf3]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-sm text-[#ededf3] w-9 text-center">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCount(med.key, 5)}
                        className="w-8 h-8 rounded-full bg-[#272735] hover:bg-[#171721] flex items-center justify-center text-[#ededf3]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pharmacist Voice / Clinical Note */}
        <div className="space-y-2">
          <label className="block text-xs font-light text-[#afb4cd]">
            Clinical notes or pattern observations
          </label>
          <textarea
            rows={2}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="e.g. Surge in vomiting among children living along 4th Main Road."
            className="w-full p-4 rounded-xl bg-[#171721] border border-[rgba(175,180,205,0.15)] text-sm text-[#ededf3] placeholder:text-[#afb4cd]/50 focus:border-[#5266eb] focus:outline-none"
          />
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#fc92b4]/10 border border-[#fc92b4]/30 text-xs text-[#fc92b4] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Action */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mercury-btn-primary h-12 text-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Transmitting report to Municipal Health Command...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit daily clinic pulse</span>
            </>
          )}
        </button>

      </div>

      {/* Success Notification */}
      {submitSuccess && (
        <div className="mercury-panel p-6 sm:p-8 space-y-2 border-[#5266eb]/40 bg-[#1e1e2a] animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-[#5266eb]">
            <CheckCircle className="w-5 h-5 text-[#5266eb]" />
            <span className="text-base text-[#ededf3] font-normal">Report received by municipal surveillance</span>
          </div>
          <p className="text-xs text-[#c3c3cc] font-light">
            Data logged under facility ID <strong className="text-[#ededf3] font-mono">{facilityId}</strong>. Public health algorithms will correlate this spike against flood hazard anchors.
          </p>
        </div>
      )}

    </div>
  );
}
