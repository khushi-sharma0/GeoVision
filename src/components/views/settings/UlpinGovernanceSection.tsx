import React from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  ulpinRegenerateRole: string;
  setUlpinRegenerateRole: (v: string) => void;
  logUlpinChanges: boolean;
  setLogUlpinChanges: (v: boolean) => void;
}

export const UlpinGovernanceSection: React.FC<Props> = ({
  isExpanded,
  onToggle,
  ulpinRegenerateRole,
  setUlpinRegenerateRole,
  logUlpinChanges,
  setLogUlpinChanges,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
      >
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ULPIN Governance
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
            Identifier immutability, role authorization & historical lineage tracking
          </p>
        </div>
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          {/* Dropdown: Role permitted to regenerate/reassign a ULPIN */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Role Permitted to Regenerate / Reassign a ULPIN
            </label>
            <select
              value={ulpinRegenerateRole}
              onChange={(e) => setUlpinRegenerateRole(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="Senior Surveyor / Admin only">Senior Surveyor / Admin only</option>
              <option value="Admin only">Admin only (Strict State Cadastre)</option>
              <option value="State Cadastral Registrar">State Cadastral Registrar</option>
              <option value="All Authorized Surveyors">All Authorized Surveyors</option>
            </select>
          </div>

          {/* Toggle: Log all ULPIN changes to audit trail */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                Log all ULPIN changes to audit trail
              </label>
              <span className="text-[11px] text-slate-400">
                Cryptographically records state transitions, merges, and splits in the blockchain cadastral ledger.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLogUlpinChanges(!logUlpinChanges)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                logUlpinChanges ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  logUlpinChanges ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Read-only info text */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                Lineage & Versioning Mandate
              </span>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                ULPINs are versioned automatically on subdivision, merge, or demolition. Historical IDs are retained in the immutable archive.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
