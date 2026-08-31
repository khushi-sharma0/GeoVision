import React, { useState } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  FileText,
  Upload,
  Clock,
  ShieldAlert,
  Building,
  MapPin,
  FileCheck2,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { useAuth } from '../../context/AuthContext';

export const ReportsView: React.FC = () => {
  const { parcels, buildings, units, selectedParcel } = useCadastre();
  const { user } = useAuth();

  const [selectedUlpin, setSelectedUlpin] = useState<string>(
    selectedParcel?.ulpin || parcels[0]?.ulpin || '27101500123471'
  );
  const [conflictType, setConflictType] = useState<string>('Volumetric / Floor Area Overlap Mismatch');
  const [severity, setSeverity] = useState<string>('High');
  const [description, setDescription] = useState<string>('');
  const [contactName, setContactName] = useState<string>(user?.name || 'Aarav Mehta');
  const [contactPhone, setContactPhone] = useState<string>('+91 98201 44810');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');

  const [submittedReports, setSubmittedReports] = useState([
    {
      id: 'REP-2024-MH-8812',
      ulpin: '27101500123471',
      location: 'Palm Road, Civil Lines, Nagpur',
      type: 'Area Mismatch: Unit Totals Exceed Floor Slab',
      severity: 'High',
      date: '2024-08-28',
      status: 'Under Cadastral Review',
      officer: 'Senior Surveyor Rajesh Kulkarni',
    },
    {
      id: 'REP-2024-MH-7419',
      ulpin: '27101500984120',
      location: 'CS No. 412, Worli, Mumbai',
      type: '2D Ground Parcel Boundary Overlap',
      severity: 'Medium',
      date: '2024-08-15',
      status: 'Surveyor Assigned',
      officer: 'Surveyor Amit Patil',
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `REP-2024-MH-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(newId);

    const newReport = {
      id: newId,
      ulpin: selectedUlpin,
      location: parcels.find((p) => p.ulpin === selectedUlpin)?.locationName || 'Nagpur Central Residency',
      type: conflictType,
      severity,
      date: new Date().toISOString().split('T')[0],
      status: 'Under Cadastral Review',
      officer: 'Nodal Surveyor Desk',
    };

    setSubmittedReports([newReport, ...submittedReports]);
    setIsSubmitted(true);
    setDescription('');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Report Boundary Conflict & Spatial Dispute
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                CITIZEN DISPUTE DESK
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              File an official report for boundary overlap, volumetric area calculation mismatch, or title dispute directly to the Department of Land Records (LADM ISO 19152).
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {isSubmitted && (
          <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-lg space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Boundary Conflict Report Successfully Filed! Ticket ID: {ticketId}</span>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs bg-emerald-700 hover:bg-emerald-800 px-3 py-1 rounded font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-emerald-100">
              Your dispute has been logged in the State Cadastral Register. A Nodal Surveyor has been notified for field adjudication.
            </p>
          </div>
        )}

        {/* Main Grid: Form Left, Active Reports Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* File Report Form (Left - 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                File New Boundary Dispute Report
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Select Property / ULPIN */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Target Property / ULPIN
                </label>
                <select
                  value={selectedUlpin}
                  onChange={(e) => setSelectedUlpin(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold"
                >
                  {parcels.map((p) => {
                    const bldg = buildings.find((b) => b.parcelId === p.id);
                    return (
                      <option key={p.id} value={p.ulpin}>
                        {p.ulpin} — {bldg?.buildingName || p.localParcelId} ({p.locationName})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Conflict Category & Severity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Discrepancy Category
                  </label>
                  <select
                    value={conflictType}
                    onChange={(e) => setConflictType(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Volumetric / Floor Area Overlap Mismatch">Volumetric / Slab Overlap Mismatch</option>
                    <option value="2D Ground Parcel Boundary Overlap">2D Ground Parcel Boundary Overlap</option>
                    <option value="Encroachment by Neighboring Structure">Encroachment by Neighboring Structure</option>
                    <option value="Floor Height / Z-Level Elevation Error">Floor Height / Z-Level Elevation Error</option>
                    <option value="Duplicate Conveyance / Double Sale Claim">Duplicate Conveyance / Ownership Claim</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Priority / Urgency Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="High">High (Active Construction / Encroachment)</option>
                    <option value="Medium">Medium (Deed Area Mismatch)</option>
                    <option value="Low">Low (Minor Boundary Label Discrepancy)</option>
                  </select>
                </div>
              </div>

              {/* Citizen Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Reporter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Contact Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Detailed Boundary Complaint & Observations
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the exact boundary discrepancy, unit overlap, or incorrect footprint..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Upload Proof */}
              <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-center space-y-1">
                <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                  Attach Supporting Documents (GPS Survey / Deed / Photos)
                </span>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Boundary Conflict Report</span>
              </button>
            </form>
          </div>

          {/* Active Filed Reports List (Right - 5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    My Filed Boundary Reports ({submittedReports.length})
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600">
                  Track Status
                </span>
              </div>

              <div className="space-y-3">
                {submittedReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {rep.id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {rep.status}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        {rep.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ULPIN: {rep.ulpin}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Filed: {rep.date}</span>
                      <span>Assigned: {rep.officer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};