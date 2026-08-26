import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Eye,
  FileText,
  Download,
  Building,
  Check,
  Zap,
} from 'lucide-react';
import { useCadastre } from '../../../context/CadastreContext';

interface GeneratePropertySectionProps {
  parcelId: string;
  buildingName: string;
  floorsAboveGround: number;
  basements: number;
  unitsCount: number;
  ownershipCount: number;
  surveyDataSummary: string;
  validationReady: boolean;
  onStartGeneration: () => void;
  isProcessing: boolean;
  processingStep: number;
  generationSuccess: boolean;
  onView3DProperty: () => void;
  onViewPropertyCard: () => void;
  onGenerateReport: () => void;
}

export const GeneratePropertySection: React.FC<GeneratePropertySectionProps> = ({
  parcelId,
  buildingName,
  floorsAboveGround,
  basements,
  unitsCount,
  ownershipCount,
  surveyDataSummary,
  validationReady,
  onStartGeneration,
  isProcessing,
  processingStep,
  generationSuccess,
  onView3DProperty,
  onViewPropertyCard,
  onGenerateReport,
}) => {
  const pipelineSteps = [
    'Parcel Data Validated',
    'Building Data Validated',
    'Floor Plan Processed',
    'Unit Data Imported',
    'Ownership Data Linked',
    'AI Floor Segmentation',
    'Vertical Property Generation',
    '3D ULPIN Generation',
    'Spatial Validation',
    'Property Card Generation',
  ];

  const progressPercentage = Math.round(((processingStep + 1) / pipelineSteps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Ready to Generate Section Card (Section 11) */}
      {!generationSuccess && (
        <div className="bg-gradient-to-br from-white to-blue-50/40 dark:from-slate-900 dark:to-slate-900/80 border border-blue-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Ready to Generate
                </h2>
                <p className="text-xs text-slate-500">
                  Execute 3D Cadastral Ingestion and synthesize ISO 19152 Vertical Property Models
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Validation:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                validationReady
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
              }`}>
                {validationReady ? '✓ Ready' : '⚠ Incomplete'}
              </span>
            </div>
          </div>

          {/* Key Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Parcel</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white truncate">{parcelId}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Building</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">{buildingName}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Floors</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white">{floorsAboveGround}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Basements</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white">{basements}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Units</span>
              <p className="font-mono font-bold text-blue-600 dark:text-blue-400">{unitsCount}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Ownership</span>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{ownershipCount}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">3D Data</span>
              <p className="font-bold text-slate-700 dark:text-slate-300">{surveyDataSummary}</p>
            </div>
          </div>

          {/* Big Action Button */}
          <div className="flex flex-col items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={!validationReady || isProcessing}
              onClick={onStartGeneration}
              className="w-full sm:w-auto min-w-[320px] h-13 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span className="tracking-wide uppercase">GENERATE 3D PROPERTY & ULPIN</span>
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-lg">
              Process submitted cadastral, building, floor and ownership data to generate the 3D property model.
            </p>
          </div>
        </div>
      )}

      {/* Processing Screen Modal (Section 12) */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 animate-pulse">
                <Layers className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Generating 3D Cadastral Property
              </h2>
              <p className="text-xs text-slate-500">
                Synthesizing ISO 19152 3D ULPIN Geometry and Land Registry Links
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-right text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                {progressPercentage}% Completed
              </div>
            </div>

            {/* 10-step pipeline */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {pipelineSteps.map((step, idx) => {
                const isPassed = idx < processingStep;
                const isCurrent = idx === processingStep;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                        : isPassed
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] w-4">{String(idx + 1).padStart(2, '0')}</span>
                      <span>{step}</span>
                    </div>

                    <div>
                      {isPassed ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 block" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* After Generation Success Card (Section 13) */}
      {generationSuccess && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 border-2 border-emerald-500/50 dark:border-emerald-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 dark:border-emerald-900/60 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-black text-emerald-700 dark:text-emerald-400">
                  PUBLICATION CONFIRMED
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  ✓ 3D PROPERTY GENERATED SUCCESSFULLY
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                Validation: Passed
              </span>
            </div>
          </div>

          {/* Generated Property Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-200/60 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">3D ULPINs Generated</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{unitsCount}</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-200/60 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Building</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{buildingName}</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-200/60 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Floors</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{floorsAboveGround}</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-200/60 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Units</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{unitsCount}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onView3DProperty}
              className="flex-1 min-w-[200px] h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>VIEW 3D PROPERTY</span>
            </button>

            <button
              type="button"
              onClick={onViewPropertyCard}
              className="flex-1 min-w-[200px] h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-750 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>VIEW PROPERTY CARD</span>
            </button>

            <button
              type="button"
              onClick={onGenerateReport}
              className="flex-1 min-w-[200px] h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>GENERATE REPORT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
