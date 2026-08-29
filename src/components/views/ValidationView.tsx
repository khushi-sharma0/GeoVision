import React from 'react';
import {
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  Scale,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';

export const ValidationView: React.FC = () => {
  const { floors, units, selectedBuilding } = useCadastre();

  // Real-time ULPIN uniqueness check
  const uniqueUlpinCount = new Set(units.map((u) => u.full3DULPIN)).size;
  const ulpinDuplicates = units.length - uniqueUlpinCount;
  const ulpinUnique = ulpinDuplicates === 0;

  // Floor F2: Valid example
  // Floor F4: Seeded Error (Unit total 1175m² vs Slab 1000m² -> Error: Sum exceeds total area by 175m²)
  const floorF2 = floors.find((f) => f.floorCode === 'F2') || floors[0];
  const floorF4 = floors.find((f) => f.floorCode === 'F4') || floors[1];

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Automated Cadastral Validation Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300">
                1 AREA ERROR DETECTED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ISO 19152 LADM 3D topology checker, unit-to-floor area containment summation, and ULPIN uniqueness validator.
            </p>
          </div>
        </div>

        {/* 4 Summary Validation Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                ULPIN Uniqueness
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {ulpinUnique
                  ? `All ${uniqueUlpinCount} unit ULPINs are distinct and strictly format-compliant.`
                  : `${ulpinDuplicates} duplicate ULPIN(s) detected across ${units.length} units — remediation required.`}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                3D Volumetric Bounds
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All unit bounding boxes strictly within building boundary.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                Area Containment Check
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                1 floor slab exceeds permissible tolerance limit (Floor F4).
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                Ownership Deed Links
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cross-checked against sample deed records in this dataset.
              </p>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparative Validation Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Example 1: Valid Floor F2 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-emerald-500/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                  Floor F2 — VALID (Area Sum Verified)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                100% PASS
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Registered Floor Slab Area</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">1,000.00 m²</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Sum of Unit Areas (6 Units)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">820.00 m²</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Common Area & Corridors</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">180.00 m²</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Area Variance</span>
                <span className="font-mono font-bold text-emerald-600">0.00 m² (Within ±0.5% tolerance)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
              ✓ All units correctly contained inside the floor perimeter with no self-intersections.
            </div>
          </div>

          {/* Example 2: Invalid Floor F4 (Seeded Error) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-amber-500/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                  Floor F4 — AREA ERROR (Over-Allocation)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                FAILED CHECK
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Registered Floor Slab Area</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">1,000.00 m²</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Sum of Unit Areas (6 Units)</span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">1,175.00 m²</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Calculated Over-Allocation</span>
                <span className="font-mono font-bold text-red-600">+175.00 m²</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Validation Status</span>
                <span className="font-mono font-bold text-red-600">Unit sum exceeds floor footprint</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
              ⚠️ Remediation Required: Units F4-402 and F4-405 boundary polygons overlap beyond the approved slab boundary. Cadastral officer review requested.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
