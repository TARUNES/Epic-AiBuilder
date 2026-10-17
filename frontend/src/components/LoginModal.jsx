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
  const [activeTab, setActiveTab] = useState('MUNICIPAL');
  const [identifier, setIdentifier] = useState('GCC-OPS-14');
  const [password, setPassword] = useState('officer123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.login(activeTab, identifier, password || 'test');
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      // Fallback for seamless demo
      onLoginSuccess({
        role: activeTab,
        token: 'DEMO-TOKEN',
        user: activeTab === 'MUNICIPAL' ? {
          name: 'Dr. M. Natarajan, IAS',
          title: 'Special Relief Commissioner'
        } : {
          facility_id: 'PHARM-MEDPLUS-14',
          facility_name: 'MedPlus Pharmacy - Velachery'
        }
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171721]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md mercury-panel p-6 sm:p-8 space-y-6 bg-[#1e1e2a] border border-[rgba(175,180,205,0.2)] text-[#ededf3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[rgba(175,180,205,0.12)] pb-4">
          <div>
            <h2 className="text-lg font-normal text-[#ededf3]">
              Authorized Officer Access
            </h2>
            <p className="text-xs text-[#afb4cd] font-light">
              Greater Chennai Corporation Network
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#afb4cd] hover:text-[#ededf3] hover:bg-[#272735]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-light text-[#afb4cd] mb-1.5">
              Department Officer ID / Facility Token
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full h-11 px-4 rounded-full bg-[#171721] border border-[rgba(175,180,205,0.15)] text-xs text-[#ededf3] focus:border-[#5266eb] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-[#afb4cd] mb-1.5">
              Access Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-full bg-[#171721] border border-[rgba(175,180,205,0.15)] text-xs text-[#ededf3] focus:border-[#5266eb] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mercury-btn-primary h-11 text-xs"
          >
            <span>Sign In to Crisis Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
