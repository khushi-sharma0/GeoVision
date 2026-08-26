import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  FileSpreadsheet,
  Building,
  Layers,
  MapPin,
  X,
  Search,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Survey3DState } from './Survey3DDataSection';

interface ParsedUnitRow {
  unitId: string;
  floor: string;
  floorIndex: number;
  unitType: string;
  areaSqM: number;
  usage: string;
}

interface ParsedOwnershipRow {
  unitId: string;
  ownerName: string;
  ownerType: 'Individual' | 'Joint' | 'Corporate' | 'Government';
  ownershipPercentage: number;
  ownershipType: 'Freehold' | 'Leasehold' | 'Condominium' | 'Co-operative Society';
  docRefNo: string;
  verificationStatus: 'Verified' | 'Pending Review' | 'Provisional';
}

interface ValidationPreviewProps {
  parcelId: string;
  existingUlpin: string;
  location: string;
  area: number;
  buildingName: string;
  buildingCode: string;
  floorsAboveGround: number;
  basements: number;
  floorHeight: number;
  floorPlanFile: string | null;
  buildingFootprintFile: string | null;
  parsedUnits: ParsedUnitRow[];
  parsedOwnerships: ParsedOwnershipRow[];
  surveyData: Survey3DState;
  validationRulesPassed: boolean;
  validationErrors: string[];
}

export const ValidationPreviewSection: React.FC<ValidationPreviewProps> = ({
  parcelId,
  existingUlpin,
  location,
  area,
  buildingName,
  buildingCode,
  floorsAboveGround,
  basements,
  floorHeight,
  floorPlanFile,
  buildingFootprintFile,
  parsedUnits,
  parsedOwnerships,
  surveyData,
  validationRulesPassed,
  validationErrors,
}) => {
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isOwnershipModalOpen, setIsOwnershipModalOpen] = useState(false);
  const [unitSearch, setUnitSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');

  const filteredUnits = parsedUnits.filter(
    (u) =>
      u.unitId.toLowerCase().includes(unitSearch.toLowerCase()) ||
      u.floor.toLowerCase().includes(unitSearch.toLowerCase()) ||
      u.usage.toLowerCase().includes(unitSearch.toLowerCase())
  );

  const filteredOwnerships = parsedOwnerships.filter(
    (o) =>
      o.unitId.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      o.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      o.docRefNo.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
          08
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Data Validation & Preview
          </h2>
          <p className="text-[11px] text-slate-500">
            Review submitted information before generating the 3D property
          </p>
        </div>
      </div>

      {/* Grid of Mandatory & Optional Status Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`p-2.5 rounded-xl border ${parcelId ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Parcel Info</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">{parcelId || 'Missing'}</p>
        </div>

        <div className={`p-2.5 rounded-xl border ${buildingName ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Building Info</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{buildingName || 'Missing'}</p>
        </div>

        <div className={`p-2.5 rounded-xl border ${parsedUnits.length > 0 ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Unit CSV</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{parsedUnits.length} Units</p>
        </div>

        <div className={`p-2.5 rounded-xl border ${parsedOwnerships.length > 0 ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ownership CSV</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{parsedOwnerships.length} Records</p>
        </div>

        <div className={`p-2.5 rounded-xl border ${floorPlanFile ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Floor Plan</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{floorPlanFile ? 'Uploaded' : 'Missing'}</p>
        </div>

        <div className={`p-2.5 rounded-xl border ${buildingFootprintFile ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Footprint</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{buildingFootprintFile ? 'Uploaded' : 'Missing'}</p>
        </div>
      </div>

      {/* Optional Survey Status Row */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 border-t border-b border-slate-100 dark:border-slate-800 py-2.5">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Geospatial Survey Layers:</span>
        <span className="inline-flex items-center gap-1">
          {surveyData.droneImagery ? '✓ Drone Imagery' : '⚪ Drone Imagery — Not provided'}
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          {surveyData.lidarCloud ? '✓ LiDAR Cloud' : '⚪ LiDAR — Not provided'}
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          {surveyData.dem || surveyData.dsm ? '✓ DEM/DSM' : '⚪ DEM/DSM — Not provided'}
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          {surveyData.gnssCors ? '✓ GNSS/CORS' : '⚪ GNSS/CORS — Not provided'}
        </span>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Parcel</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">{parcelId}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Building</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{buildingName}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Floors</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{floorsAboveGround}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Basements</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{basements}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Floor Height</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{floorHeight} m</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Units</span>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">{parsedUnits.length}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Ownership</span>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{parsedOwnerships.length}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Land Area</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{area} m²</p>
        </div>
      </div>

      {/* Buttons to view modal data */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsUnitModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>View Unit Data ({parsedUnits.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOwnershipModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Ownership Data ({parsedOwnerships.length})</span>
          </button>
        </div>

        {/* Validation Status Indicator (Section 10) */}
        <div>
          {validationRulesPassed ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>✓ All required data validated</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>⚠ Data validation required ({validationErrors.length} issues)</span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors List if any */}
      {!validationRulesPassed && validationErrors.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
          <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
            Fix the following items to proceed with 3D property generation:
          </div>
          <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 pl-5 list-disc">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal: View Unit Data */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  UNIT DETAILS ({parsedUnits.length} units parsed)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by Unit ID, Floor, or Usage..."
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 sticky top-0">
                  <tr>
                    <th className="p-2.5">Unit ID</th>
                    <th className="p-2.5">Floor</th>
                    <th className="p-2.5">Unit Type</th>
                    <th className="p-2.5">Area (m²)</th>
                    <th className="p-2.5">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {filteredUnits.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">{u.unitId}</td>
                      <td className="p-2.5 text-slate-700 dark:text-slate-300">{u.floor}</td>
                      <td className="p-2.5 font-sans">{u.unitType}</td>
                      <td className="p-2.5 font-bold">{u.areaSqM}</td>
                      <td className="p-2.5 font-sans">{u.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-950">
              <span>Showing {filteredUnits.length} of {parsedUnits.length} units</span>
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Ownership Data */}
      {isOwnershipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  OWNERSHIP DETAILS ({parsedOwnerships.length} records linked)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOwnershipModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by Unit ID, Owner Name, or Doc Reference..."
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 sticky top-0">
                  <tr>
                    <th className="p-2.5">Unit ID</th>
                    <th className="p-2.5">Owner</th>
                    <th className="p-2.5">Owner Type</th>
                    <th className="p-2.5">Share</th>
                    <th className="p-2.5">Tenure</th>
                    <th className="p-2.5">Document Ref</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOwnerships.map((o, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{o.unitId}</td>
                      <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{o.ownerName}</td>
                      <td className="p-2.5 text-slate-500">{o.ownerType}</td>
                      <td className="p-2.5 font-mono font-bold">{o.ownershipPercentage}%</td>
                      <td className="p-2.5">{o.ownershipType}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">{o.docRefNo}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {o.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-950">
              <span>Showing {filteredOwnerships.length} of {parsedOwnerships.length} records</span>
              <button
                type="button"
                onClick={() => setIsOwnershipModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
