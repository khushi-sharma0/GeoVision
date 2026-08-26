import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Building,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Gavel,
  History,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';

export const OwnershipConflictsView: React.FC = () => {
  const { conflicts, resolveConflict, setActiveTab, setSelectedUnitId } = useCadastre();
  const [activeConflictId, setActiveConflictId] = useState<string>(conflicts[0]?.id || '');
  const [resolutionNotes, setResolutionNotes] = useState<string>(
    'Adjudication confirmed: Deed DOC-BLR-2024-8842 presented with valid bank encumbrance certificate. Deed DOC-BLR-2022-1109 nullified per registrar court order.'
  );

  const selectedC = conflicts.find((c) => c.id === activeConflictId) || conflicts[0];

  const handleResolve = () => {
    if (selectedC) {
      resolveConflict(selectedC.id, resolutionNotes);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Ownership Conflict Detection & Resolution Suite
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300">
                1 DISPUTE FLAGGED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cross-verifies 3D unit spatial extents with multi-deed conveyance registers to detect duplicate claims and boundary overlaps.
            </p>
          </div>
        </div>

        {/* Main Grid: Conflict Case Inspector & Deed Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Conflict List (Left 4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">
              Dispute Register ({conflicts.length})
            </h3>

            <div className="space-y-2">
              {conflicts.map((c) => {
                const isSelected = c.id === activeConflictId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConflictId(c.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-red-700 dark:text-red-400 font-mono">
                        Unit {c.unitCode} ({c.type})
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      {c.description}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-slate-400">
                      3D ULPIN: {c.full3DULPIN}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflict Adjudication Panel (Right 8 cols) */}
          {selectedC && (
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                    Active Adjudication Case
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                    Unit {selectedC.unitCode} — {selectedC.type}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedUnitId(selectedC.unitId);
                      setActiveTab('viewer3d');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View in 3D</span>
                  </button>
                </div>
              </div>

              {/* Competing Deeds Comparison */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Competing Claim Documents & Conveyances
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Deed 1 */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                      <span>Primary Registered Title</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">Valid</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>Claimant:</strong> Rahul Sharma (100%)
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      <strong>Deed:</strong> DOC-BLR-2024-8842 (Sale Deed)
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      <strong>Date:</strong> 14-Jan-2024 • Sub-Registrar Bangalore
                    </div>
                  </div>

                  {/* Deed 2 (Disputed) */}
                  <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-300 dark:border-red-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-red-800 dark:text-red-300">
                      <span>Conflicting Claim</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-200 text-red-800">Contested</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>Claimant:</strong> Vikram Varma (50% Claim)
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      <strong>Deed:</strong> DOC-BLR-2022-1109 (MOU Agreement)
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      <strong>Date:</strong> 02-Nov-2022 • Unregistered MOU
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjudication Action Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                  <Gavel className="w-4 h-4 text-blue-600" />
                  <span>Cadastral Adjudication & Order Recording</span>
                </div>

                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter adjudication officer findings and title confirmation rationale..."
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Resolution & Clear Conflict</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
