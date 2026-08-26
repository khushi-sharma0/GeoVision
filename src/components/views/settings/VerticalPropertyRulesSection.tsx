import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  minFloorHeight: number;
  setMinFloorHeight: (v: number) => void;
  maxFloorHeight: number;
  setMaxFloorHeight: (v: number) => void;
  maxBasementDepth: number;
  setMaxBasementDepth: (v: number) => void;
  allowDuplexUnits: boolean;
  setAllowDuplexUnits: (v: boolean) => void;
}

export const VerticalPropertyRulesSection: React.FC<Props> = ({
  isExpanded,
  onToggle,
  minFloorHeight,
  setMinFloorHeight,
  maxFloorHeight,
  setMaxFloorHeight,
  maxBasementDepth,
  setMaxBasementDepth,
  allowDuplexUnits,
  setAllowDuplexUnits,
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
            Vertical Property Rules
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
            Volumetric boundaries, height limitations & multi-floor duplex schemas
          </p>
        </div>
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          {/* Numeric range inputs: Min/Max allowed floor height (m) */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Allowed Floor Height Range (m)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block mb-1">Minimum Height (m)</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.8"
                  max="4.0"
                  value={minFloorHeight}
                  onChange={(e) => setMinFloorHeight(parseFloat(e.target.value) || 2.4)}
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block mb-1">Maximum Height (m)</span>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="10.0"
                  value={maxFloorHeight}
                  onChange={(e) => setMaxFloorHeight(parseFloat(e.target.value) || 5.0)}
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Numeric input: Max basement depth allowed */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Max basement depth allowed below ground level (m)
            </label>
            <input
              type="number"
              step="0.5"
              min="3"
              max="50"
              value={maxBasementDepth}
              onChange={(e) => setMaxBasementDepth(parseFloat(e.target.value) || 15.0)}
              className="w-full sm:w-1/2 h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Toggle: Allow multi-floor duplex units */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                Allow multi-floor duplex units in ULPIN schema
              </label>
              <span className="text-[11px] text-slate-400">
                Permits single 3D ULPINs spanning continuous vertical elevation across multiple contiguous floors (e.g. F3-F4-DUP01).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAllowDuplexUnits(!allowDuplexUnits)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                allowDuplexUnits ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  allowDuplexUnits ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
