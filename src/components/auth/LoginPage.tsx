import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sun,
  Moon,
  User,
  Building2,
  CheckCircle2,
  FileText,
  MapPin,
  Search,
  Layers,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { useAuth, UserRoleType } from '../../context/AuthContext';
import { useCadastre } from '../../context/CadastreContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useCadastre();

  const [activeMode, setActiveMode] = useState<UserRoleType>('citizen');
  const [email, setEmail] = useState<string>('citizen@geovision.gov.in');
  const [password, setPassword] = useState<string>('Citizen@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  const handleModeSwitch = (mode: UserRoleType) => {
    setActiveMode(mode);
    setErrorMsg(null);
    if (mode === 'citizen') {
      setEmail('citizen@geovision.gov.in');
      setPassword('Citizen@123');
    } else {
      setEmail('official@geovision.gov.in');
      setPassword('GeoVision@123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, password, activeMode, rememberMe);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid login credentials.');
        setIsSubmitting(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-xs border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
            <img src="/logo.jpg" alt="GeoVision Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300">
            Govt. of Maharashtra • 3D Cadastral & Vertical Property Portal
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          type="button"
          className="w-9 h-9 rounded-md flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Center Card */}
      <div className="w-full max-w-xl z-10 my-auto py-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <img src="/logo.jpg" alt="GeoVision Logo" className="w-16 h-16 object-contain rounded-xl" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">GeoVision</h1>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              3D ULPIN & Vertical Property Mapping System
            </p>
          </div>

          {/* Login Mode Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleModeSwitch('citizen')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeMode === 'citizen'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Citizen Mode</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('authority')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeMode === 'authority'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Authority Mode</span>
            </button>
          </div>

          {/* Mode Capabilities Feature Highlights (Matching standard design) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {activeMode === 'citizen' ? (
                <>
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Citizen Portal Access Capabilities:</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authority Portal Full Administration Suite:</span>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {activeMode === 'citizen' ? (
                <>
                  <div className="flex items-center gap-1.5"><Search className="w-3 h-3 text-blue-500" /> Search Property</div>
                  <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-blue-500" /> View 3D Property</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Check Owner/Details</div>
                  <div className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-blue-500" /> Download Property Record</div>
                  <div className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-amber-500" /> Report Incorrect Boundaries</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-500" /> Apply for Correction/Transfer</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-emerald-500" /> 3D Parcel Creation</div>
                  <div className="flex items-center gap-1.5"><Database className="w-3 h-3 text-emerald-500" /> LiDAR / Drone Data Ingestion</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-500" /> GIS Cadastral Layers</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> AI Building/Floor Extraction</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Topology Validation</div>
                  <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-emerald-500" /> Underground Infra Mapping</div>
                </>
              )}
            </div>
          </div>

          {/* Error Box */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {activeMode === 'citizen' ? 'Citizen Email / Portal ID' : 'Official Officer ID / Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full h-10 pl-9 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-11 rounded-xl text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                activeMode === 'citizen'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>LOGIN TO {activeMode === 'citizen' ? 'CITIZEN PORTAL' : 'AUTHORITY PORTAL'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Quick Demo Autofill:
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  {activeMode === 'citizen' ? 'citizen@geovision.gov.in' : 'official@geovision.gov.in'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeMode === 'citizen') {
                    setEmail('citizen@geovision.gov.in');
                    setPassword('Citizen@123');
                  } else {
                    setEmail('official@geovision.gov.in');
                    setPassword('GeoVision@123');
                  }
                  setErrorMsg(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-[10px] cursor-pointer"
              >
                Fill Credentials
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center text-slate-500 dark:text-slate-400 text-xs py-2 z-10">
        GeoVision — 3D Cadastral & Vertical Property Mapping System • ISO 19152 (LADM)
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Shield className="w-5 h-5" />
              <span>Password Recovery Helpdesk</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Citizens can recover password via Aadhaar OTP or registered email. Officers require official DSC hardware token or Cadastre IT Desk reset.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <div>Helpdesk: 1800-22-CADASTRY</div>
              <div>Demo Password (Citizen): <strong>Citizen@123</strong></div>
              <div>Demo Password (Authority): <strong>GeoVision@123</strong></div>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};