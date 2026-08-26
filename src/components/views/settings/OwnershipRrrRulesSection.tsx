import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Plus } from 'lucide-react';

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  requireHundredPercent: boolean;
  setRequireHundredPercent: (v: boolean) => void;
  allowedOwnerTypes: string[];
  setAllowedOwnerTypes: React.Dispatch<React.SetStateAction<string[]>>;
  allowedTenureTypes: string[];
  setAllowedTenureTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

export const OwnershipRrrRulesSection: React.FC<Props> = ({
  isExpanded,
  onToggle,
  requireHundredPercent,
  setRequireHundredPercent,
  allowedOwnerTypes,
  setAllowedOwnerTypes,
  allowedTenureTypes,
  setAllowedTenureTypes,
}) => {
  const [newOwnerType, setNewOwnerType] = useState('');
  const [newTenureType, setNewTenureType] = useState('');

  const removeOwnerType = (type: string) => {
    setAllowedOwnerTypes((prev) => prev.filter((t) => t !== type));
  };

  const addOwnerType = () => {
    if (newOwnerType.trim() && !allowedOwnerTypes.includes(newOwnerType.trim())) {
      setAllowedOwnerTypes((prev) => [...prev, newOwnerType.trim()]);
      setNewOwnerType('');
    }
  };

  const removeTenureType = (type: string) => {
    setAllowedTenureTypes((prev) => prev.filter((t) => t !== type));
  };

  const addTenureType = () => {
    if (newTenureType.trim() && !allowedTenureTypes.includes(newTenureType.trim())) {
      setAllowedTenureTypes((prev) => [...prev, newTenureType.trim()]);
      setNewTenureType('');
    }
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
            Ownership & RRR Rules
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
            Right, Restriction, Responsibility validation & allowable legal party classifications
          </p>
        </div>
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          {/* Toggle: Require ownership shares to sum to 100% per unit */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                Require ownership shares to sum to 100% per unit
              </label>
              <span className="text-[11px] text-slate-400">
                Throws validation error if multi-party co-owners or undivided shares do not equal exactly 100.0%.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRequireHundredPercent(!requireHundredPercent)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                requireHundredPercent ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  requireHundredPercent ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Multi-select tag list: Allowed Owner Types */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1.5">
              Allowed Owner Types (Editable Tag List)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {allowedOwnerTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs"
                >
                  {type}
                  <button
                    type="button"
                    onClick={() => removeOwnerType(type)}
                    className="hover:text-red-500"
                    title="Remove tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Add type..."
                  value={newOwnerType}
                  onChange={(e) => setNewOwnerType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOwnerType())}
                  className="h-7 w-24 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={addOwnerType}
                  className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Multi-select tag list: Allowed Tenure Types */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1.5">
              Allowed Tenure Types (Editable Tag List)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {allowedTenureTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs"
                >
                  {type}
                  <button
                    type="button"
                    onClick={() => removeTenureType(type)}
                    className="hover:text-red-500"
                    title="Remove tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Add tenure..."
                  value={newTenureType}
                  onChange={(e) => setNewTenureType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTenureType())}
                  className="h-7 w-28 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={addTenureType}
                  className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
