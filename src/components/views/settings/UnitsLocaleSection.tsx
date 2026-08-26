import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  areaUnit: string;
  setAreaUnit: (v: string) => void;
  nameScript: string;
  setNameScript: (v: string) => void;
}

export const UnitsLocaleSection: React.FC<Props> = ({
  isExpanded,
  onToggle,
  areaUnit,
  setAreaUnit,
  nameScript,
  setNameScript,
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
            Units & Locale
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
            Measurement units, conversion bases & multilingual script representations
          </p>
        </div>
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Area Unit System
              </label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="sq.m (Square Metres - SI Standard)">sq.m (Square Metres - SI Standard)</option>
                <option value="sq.ft (Square Feet - Commercial)">sq.ft (Square Feet - Commercial)</option>
                <option value="guntha (Revenue / Agrarian Unit)">guntha (Revenue / Agrarian Unit)</option>
                <option value="hectares (Regional Metric)">hectares (Regional Metric)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Name Script / Language for Owner Records
              </label>
              <select
                value={nameScript}
                onChange={(e) => setNameScript(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="Latin (English Official)">Latin (English Official Standard)</option>
                <option value="Devanagari (Hindi / Marathi)">Devanagari (Hindi / Marathi)</option>
                <option value="Kannada">Kannada (Karnataka Land Records)</option>
                <option value="Tamil">Tamil (Tamil Nadu e-Services)</option>
                <option value="Telugu">Telugu (Telangana / AP Dharani)</option>
                <option value="Gujarati">Gujarati (AnyRoR)</option>
                <option value="Bengali">Bengali (Banglarbhumi)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
