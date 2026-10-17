import React, { useState } from 'react';
import { 
  Building2, 
  Store, 
  ShieldCheck, 
  Lock, 
  User, 
  X, 
  ArrowRight, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { api } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('PHARMACY'); // 'PHARMACY' | 'MUNICIPAL'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFillTestCredentials = () => {
    if (activeTab === 'PHARMACY') {
      setIdentifier('PHARM-TN-1402');
      setPassword('partner123');
    } else {
      setIdentifier('GCC-OPS-14');
      setPassword('officer123');
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please enter your Facility ID or Department ID.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.login(activeTab, identifier, password || 'test');
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Authorized Personnel Access
              </h2>
              <p className="text-xs text-slate-500">
                Official Crisis & Public Health Network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Segmented Tabs */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('PHARMACY');
                setError(null);
                setIdentifier('');
                setPassword('');
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'PHARMACY'
                  ? 'bg-white text-teal-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-teal-600" />
              <span>Pharmacy Partner</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('MUNICIPAL');
                setError(null);
                setIdentifier('');
                setPassword('');
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'MUNICIPAL'
                  ? 'bg-white text-blue-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Municipal Officer</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {activeTab === 'PHARMACY' ? (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Pharmacy Facility ID / License Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. PHARM-TN-1402 or MedPlus"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-900 placeholder:text-slate-400"
                />
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Department Officer ID / Official Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. GCC-OPS-14 or commissioner@gcc.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Department Access Key / Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 ${
              activeTab === 'PHARMACY'
                ? 'bg-teal-700 hover:bg-teal-800'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isLoading ? (
              <span>Authenticating Credentials...</span>
            ) : (
              <>
                <span>Sign In to {activeTab === 'PHARMACY' ? 'Pharmacy Portal' : 'Command Center'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Fill Test Credentials Helper */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={handleFillTestCredentials}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Test Credentials ({activeTab === 'PHARMACY' ? 'MedPlus Velachery' : 'Ward 14 Officer'})</span>
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          Protected government & public health portal · Greater Chennai Corporation
        </div>
      </div>
    </div>
  );
}
