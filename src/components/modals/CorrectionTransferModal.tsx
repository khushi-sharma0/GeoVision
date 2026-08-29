import React, { useState } from 'react';
import { X, FileCheck2, CheckCircle2, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';

export const CorrectionTransferModal: React.FC = () => {
  const { isCorrectionModalOpen, setIsCorrectionModalOpen, selectedUnit } = useCadastre();

  const [applicationType, setApplicationType] = useState<'correction' | 'transfer'>('transfer');
  const [ulpin, setUlpin] = useState<string>(selectedUnit?.full3DULPIN || '27101500123456-BA-F3-U03');
  const [currentOwner, setCurrentOwner] = useState<string>('Aarav Mehta');
  const [newOwnerName, setNewOwnerName] = useState<string>('Rohan Desai');
  const [saleDeedRef, setSaleDeedRef] = useState<string>('DEED-2024-MH-8812');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isCorrectionModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCorrectionModalOpen(false);
      alert(`Official ${applicationType === 'transfer' ? 'Ownership Transfer' : 'Property Correction'} Application Submitted! Ref Token: APP-2024-MH-5510`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
            <FileCheck2 className="w-5 h-5" />
            <span>Apply for Property Correction / Transfer</span>
          </div>
          <button
            onClick={() => setIsCorrectionModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setApplicationType('transfer')}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              applicationType === 'transfer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Ownership Title Transfer
          </button>

          <button
            type="button"
            onClick={() => setApplicationType('correction')}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              applicationType === 'correction'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Record / Area Correction
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Property 3D ULPIN
            </label>
            <input
              type="text"
              required
              value={ulpin}
              onChange={(e) => setUlpin(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {applicationType === 'transfer' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Current Registered Owner
                  </label>
                  <input
                    type="text"
                    required
                    value={currentOwner}
                    onChange={(e) => setCurrentOwner(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Transferee / Buyer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Registered Sale Deed / Gift Deed Reference
                </label>
                <input
                  type="text"
                  required
                  value={saleDeedRef}
                  onChange={(e) => setSaleDeedRef(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Requested Correction Details (Name / Address / UDS Share)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Specify exact typographical or area metric correction requested..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600" />
            <span>Applications are verified by the Nodal Cadastral Survey Office using ISO 19152 validation algorithms.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCorrectionModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};