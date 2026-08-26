import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  minLidarDensity: number;
  setMinLidarDensity: (v: number) => void;
  minDroneResolutionGsd: number;
  setMinDroneResolutionGsd: (v: number) => void;
  maxDataAgeMonths: number;
  setMaxDataAgeMonths: (v: number) => void;
  maxGnssErrorCm: number;
  setMaxGnssErrorCm: (v: number) => void;
}

export const DataSourceFusionSection: React.FC<Props> = ({
  isExpanded,
  onToggle,
  minLidarDensity,
  setMinLidarDensity,
  minDroneResolutionGsd,
  setMinDroneResolutionGsd,
  maxDataAgeMonths,
  setMaxDataAgeMonths,
  maxGnssErrorCm,
  setMaxGnssErrorCm,
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
            Data Source & Fusion Thresholds
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
            Geospatial sensors, point cloud density, orthomosaic resolution & CORS error ceilings
          </p>
        </div>
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-slate-500 font-sans font-semibold mb-1">
                Minimum LiDAR Point Density (pts/m²)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={minLidarDensity}
                onChange={(e) => setMinLidarDensity(parseFloat(e.target.value) || 15)}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
                Required for automated 3D mesh building reconstruction
              </span>
            </div>

            <div>
              <label className="block text-slate-500 font-sans font-semibold mb-1">
                Drone Orthomosaic Resolution (cm GSD)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={minDroneResolutionGsd}
                onChange={(e) => setMinDroneResolutionGsd(parseFloat(e.target.value) || 2.5)}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
                Ground Sampling Distance for parcel perimeter verification
              </span>
            </div>

            <div>
              <label className="block text-slate-500 font-sans font-semibold mb-1">
                Max Data Age Before Flagged Stale (Months)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="60"
                value={maxDataAgeMonths}
                onChange={(e) => setMaxDataAgeMonths(parseInt(e.target.value) || 12)}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
                Surveys older than threshold require re-survey before conveyance
              </span>
            </div>

            <div>
              <label className="block text-slate-500 font-sans font-semibold mb-1">
                Max Acceptable GNSS/CORS Error (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                value={maxGnssErrorCm}
                onChange={(e) => setMaxGnssErrorCm(parseFloat(e.target.value) || 5.0)}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
                Horizontal RMS tolerance for base control station survey points
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
