import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  User,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';

export const OwnershipDocsModal: React.FC = () => {
  const { isDocsModalOpen, setIsDocsModalOpen, selectedUnit, selectedOwnership } = useCadastre();
  const [activeDocTab, setActiveDocTab] = useState<'deed' | 'encumbrance' | 'possession'>('deed');

  if (!isDocsModalOpen || !selectedUnit) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Ownership Documents & Legal Conveyance Records
            </span>
          </div>

          <button
            onClick={() => setIsDocsModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={() => setActiveDocTab('deed')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeDocTab === 'deed'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Registered Sale Deed
          </button>
          <button
            onClick={() => setActiveDocTab('encumbrance')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeDocTab === 'encumbrance'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Encumbrance Certificate (EC)
          </button>
          <button
            onClick={() => setActiveDocTab('possession')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeDocTab === 'possession'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Occupancy & Possession
          </button>
        </div>

        {/* Document Content View */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-800 dark:text-slate-200">
          {activeDocTab === 'deed' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Document No: {selectedOwnership?.docRefNo || 'DOC-BLR-2024-8842'}</span>
                  <span className="text-emerald-600">Registered</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Registered at Sub-Registrar Office, Bangalore South (Book 1, Volume 412)
                </div>
              </div>

              <div className="space-y-1.5">
                <p>
                  <strong>Vendor:</strong> Prestige Estates Projects Ltd.
                </p>
                <p>
                  <strong>Purchaser:</strong> {selectedOwnership?.ownerName || 'Rahul Sharma'} (PAN: ABCPS1234F)
                </p>
                <p>
                  <strong>Property Schedule:</strong> Flat No. {selectedUnit.unitCode}, Floor 3, Building BA, measuring {selectedUnit.carpetAreaSqM} m² with 2.45% undivided share in land parcel {selectedUnit.full3DULPIN.split('-')[0]}.
                </p>
                <p>
                  <strong>Consideration Value:</strong> ₹ 1,45,00,000 INR (Stamp Duty Paid: ₹ 9,57,000 INR).
                </p>
              </div>
            </div>
          )}

          {activeDocTab === 'encumbrance' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300">
                ✓ Form 15 Non-Encumbrance Certificate: No active mortgages, bank liens, or legal attachments recorded for the period 01-Jan-2010 to 2026.
              </div>
              <p>
                <strong>Search Period:</strong> 16 Years (Continuous).
              </p>
              <p>
                <strong>Issuing Authority:</strong> Department of Registration and Stamps, Karnataka.
              </p>
            </div>
          )}

          {activeDocTab === 'possession' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300">
                ✓ BBMP Occupancy Certificate: OC/BBMP/2024/7120 issued in accordance with National Building Code (NBC).
              </div>
              <p>
                <strong>Fire Safety NOC:</strong> Clearance Certificate No. FSC/2024/908.
              </p>
              <p>
                <strong>Pollution Control Board Consent:</strong> KSPCB/W/2023/4412.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end">
          <button
            onClick={() => setIsDocsModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
