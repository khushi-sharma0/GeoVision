import React from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  enforceTopology: boolean;
  setEnforceTopology: (v: boolean) => void;
  selectedLadmClasses: string[];
  setSelectedLadmClasses: React.Dispatch<React.SetStateAction<string[]>>;
  demDsmThreshold: string;
  setDemDsmThreshold: (v: string) => void;
}

const ALL_LADM_CLASSES = ['Party', 'RRR', 'Spatial Unit', 'Building Unit'];

export const LadmComplianceSection: React.FC<Props> = ({
  isExpanded,
  onToggle,
  enforceTopology,
  setEnforceTopology,
  selectedLadmClasses,
  setSelectedLadmClasses,
  demDsmThreshold,
  setDemDsmThreshold,
}) => {
  const toggleClass = (cls: string) => {
    setSelectedLadmClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
      >
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            LADM & Compliance Rules
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
            ISO 19152 topological integrity, mandatory classes & DSM triggers
          </p>
        </div>
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          {/* Toggle: Enforce parcel topology validation */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                Enforce parcel topology validation (no gaps/overlaps)
              </label>
              <span className="text-[11px] text-slate-400">
                Rejects any unit extrusion that overlaps adjacent volumetric bounds or exceeds parent parcel perimeter.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEnforceTopology(!enforceTopology)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enforceTopology ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enforceTopology ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Multi-select: Mandatory LADM classes */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1.5">
              Mandatory LADM classes required per property
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_LADM_CLASSES.map((cls) => {
                const isSelected = selectedLadmClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 text-blue-700 dark:text-blue-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dropdown: Minimum unit count that triggers mandatory DEM+DSM upload */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Minimum unit count that triggers mandatory DEM+DSM upload
            </label>
            <select
              value={demDsmThreshold}
              onChange={(e) => setDemDsmThreshold(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="5+ units">5+ units (Low-density threshold)</option>
              <option value="10+ units">10+ units (Standard default)</option>
              <option value="20+ units">20+ units (High-density complex)</option>
              <option value="50+ units">50+ units (Mega multi-tower)</option>
              <option value="All properties">All properties (Mandatory for all)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
