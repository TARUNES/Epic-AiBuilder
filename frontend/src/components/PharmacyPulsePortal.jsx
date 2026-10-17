import React, { useState } from 'react';
import { 
  Store, 
  ShieldCheck, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  Mic, 
  MicOff, 
  RefreshCw, 
  Users, 
  Send,
  FileCheck,
  CheckCircle
} from 'lucide-react';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { api } from '../services/api';

const PAST_SUBMISSIONS_MOCK = [
  {
    report_id: 'RPT-2026-104',
    date: 'Yesterday, 18:30',
    ors: 40,
    doxy: 15,
    patients: 35,
    stockouts: 'None',
    status: 'Verified & Synced'
  },
  {
    report_id: 'RPT-2026-092',
    date: '2 Days Ago, 19:15',
    ors: 25,
    doxy: 8,
    patients: 20,
    stockouts: 'None',
    status: 'Verified & Synced'
  }
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
  const [notesText, setNotesText] = useState('Sharp 300% surge in acute watery diarrhea and vomiting presentations over the last 24 hours. Multiple patient families report discolored municipal tap water along 4th Main Road.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pastReports, setPastReports] = useState(PAST_SUBMISSIONS_MOCK);

  const facilityId = currentUser?.user?.facility_id || 'PHARM-MEDPLUS-01';
  const licenseToken = currentUser?.user?.license_number || 'PHARM-LIC-VERIFIED-VLC-01';
  const facilityName = currentUser?.user?.facility_name || 'MedPlus Pharmacy - Velachery Main Rd';

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
    e.preventDefault();
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
      
      // Prepend to past submissions table
      setPastReports((prev) => [
        {
          report_id: result.pulse_id || `RPT-2026-${Math.floor(100 + Math.random() * 900)}`,
          date: 'Just now',
          ors: otcCounts.ORS_PACKETS || 0,
          doxy: otcCounts.DOXYCYCLINE || 0,
          patients: patientCount,
          stockouts: stockouts.length > 0 ? stockouts.join(', ') : 'None',
          status: 'Transmitted to Command Center'
        },
        ...prev
      ]);

      if (onPulseSubmitted) {
        onPulseSubmitted(result);
      }
    } catch (err) {
      console.error('Pulse submission failed:', err);
      setErrorMessage(
        err.response?.data?.detail || 'Failed to submit report. Please verify connection to Municipal Network.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Verified Facility Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-slate-900">
                  {facilityName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Verified Pharmacy Partner
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Facility ID: <span className="font-mono text-slate-700">{facilityId}</span> · License: <span className="font-mono text-slate-700">{licenseToken}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Reporting Duty
            </span>
            <span className="text-xs font-bold text-slate-800">
              Daily Syndromic & OTC Dispensing Log
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Reporting Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            
            {/* Header / Instructions */}
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Daily OTC Medication Dispensing & Symptom Velocity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record significant 24-hour dispensing surges. This data is aggregated by the Municipal Health Department to detect localized waterborne and febrile outbreaks.
              </p>
            </div>

            {/* Steppers for Key Medications */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                Dispensed Medication Counts (Last 24 Hours)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'ORS_PACKETS', name: 'Oral Rehydration Salts (ORS Packets)', desc: 'Electral sachets / Hydration' },
                  { key: 'DOXYCYCLINE', name: 'Doxycycline 100mg Tablets', desc: 'Antibacterial / Cholera & Lepto' },
                  { key: 'PARACETAMOL', name: 'Paracetamol 650mg Tablets', desc: 'Febrile & Bodyache Symptom relief' },
                  { key: 'ANTI_DIARRHEAL', name: 'Anti-Diarrheal Formulations', desc: 'Loperamide / Metronidazole' },
                  { key: 'IV_FLUIDS', name: 'IV Infusion Bottles (Normal Saline / RL)', desc: 'Clinical rehydration units' }
                ].map((item) => {
                  const count = otcCounts[item.key] || 0;
                  const isStockout = stockouts.includes(item.key);

                  return (
                    <div 
                      key={item.key}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isStockout 
                          ? 'bg-red-50 border-red-200' 
                          : count >= 30 
                          ? 'bg-amber-50/60 border-amber-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleStockout(item.key)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all border ${
                            isStockout 
                              ? 'bg-red-600 text-white border-red-700' 
                              : 'bg-white text-slate-600 border-slate-300 hover:border-red-400 hover:text-red-700'
                          }`}
                        >
                          {isStockout ? 'Out of Stock' : 'Mark Stockout'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">{item.desc}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateCount(item.key, -5)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-xs hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-12 text-center font-mono font-bold text-sm text-slate-900">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCount(item.key, 5)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-xs hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => updateCount(item.key, 25)}
                            className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                          >
                            +25
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCount(item.key, 50)}
                            className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                          >
                            +50
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Presenting Patient Presentation Count */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Users className="w-4 h-4 text-blue-600" />
                  Estimated Presenting Patients with Acute Symptoms (24h)
                </label>
                <span className="font-mono text-base font-extrabold text-blue-700">
                  {patientCount} individuals
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={patientCount}
                onChange={(e) => setPatientCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-medium">
                <span>0 Normal Baseline</span>
                <span>50 Elevated Presentation</span>
                <span>100+ Epidemic Surge</span>
              </div>
            </div>

            {/* Pharmacist Clinical Notes (Voice + Text) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Mic className="w-4 h-4 text-teal-700" />
                  Pharmacist / Clinic Clinical Observations (Voice or Text)
                </span>
                {isRecording && (
                  <span className="text-xs font-mono font-bold text-teal-700 animate-pulse">
                    Recording Voice Update: {recordingTime}s
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="py-2 px-3.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Record Voice Note
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    Finish Recording ({recordingTime}s)
                  </button>
                )}

                {audioBase64 && (
                  <button
                    type="button"
                    onClick={resetRecording}
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {audioBase64 && (
                <div className="text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600" /> Voice observation recorded
                </div>
              )}

              <textarea
                rows={3}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="E.g. Sharp surge in watery diarrhea presentations over the last 24h. Patients report bad tap water odor in 4th Main / AGS Colony..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Transmitting Verified Daily Surveillance Report...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Daily Health Surveillance Report
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Status & Recent Submissions Log */}
        <div className="lg:col-span-4 space-y-6">
          
          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Report Registered #{submitSuccess.pulse_id}
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Daily syndromic report from <span className="font-bold">{facilityName}</span> has been verified and securely synchronized with the Municipal Command Center.
              </p>
              {submitSuccess.updated_outbreak_alert && (
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1 text-xs">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                    Ward Health Status Impact
                  </span>
                  <div className="font-bold text-slate-900">
                    Outbreak Probability: {(submitSuccess.updated_outbreak_alert.risk_probability * 100).toFixed(0)}% ({submitSuccess.updated_outbreak_alert.risk_level})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Past Submitted Daily Reports Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-700" />
                Past Surveillance Reports
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Logged Daily</span>
            </div>

            <div className="space-y-2.5">
              {pastReports.map((r, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="font-mono text-slate-900 font-bold">{r.report_id}</span>
                    <span className="text-[11px] text-slate-500">{r.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5">
                    <span>ORS: <strong>{r.ors}</strong> · Doxy: <strong>{r.doxy}</strong></span>
                    <span className="font-mono font-medium text-blue-700">{r.patients} patients</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Status: <span className="text-emerald-700 font-medium">{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Governance Policy */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
            <span className="font-bold text-slate-800 uppercase text-[10px] block">
              Public Health Privacy Standard
            </span>
            <p className="text-[11px] leading-relaxed">
              No individual patient names, addresses, or prescriptions are collected. Reports consist entirely of aggregate velocity indicators to detect ward-level water contamination before widespread hospital admissions occur.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
