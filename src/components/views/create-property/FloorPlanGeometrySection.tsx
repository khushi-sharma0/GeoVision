import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Eye,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  Layers,
  Maximize2,
  Compass,
} from 'lucide-react';

interface FloorPlanGeometryProps {
  floorPlanFile: string | null;
  setFloorPlanFile: (file: string | null) => void;
  buildingFootprintFile: string | null;
  setBuildingFootprintFile: (file: string | null) => void;
  onSegmentationComplete?: (detectedUnitsCount: number) => void;
}

export const FloorPlanGeometrySection: React.FC<FloorPlanGeometryProps> = ({
  floorPlanFile,
  setFloorPlanFile,
  buildingFootprintFile,
  setBuildingFootprintFile,
  onSegmentationComplete,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentationStep, setSegmentationStep] = useState<string | null>(null);
  const [segmentationComplete, setSegmentationComplete] = useState(false);
  const [detectedUnits, setDetectedUnits] = useState(24);
  const [confidence, setConfidence] = useState(91);

  const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFloorPlanFile(`${file.name} (${sizeMB} MB)`);
      setSegmentationComplete(false);
    }
  };

  const handleFootprintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeKB = (file.size / 1024).toFixed(0);
      setBuildingFootprintFile(`${file.name} (${sizeKB} KB)`);
    }
  };

  const runAISegmentation = () => {
    setIsSegmenting(true);
    setSegmentationComplete(false);

    const steps = [
      'Analyzing floor plan...',
      'Detecting rooms...',
      'Detecting unit boundaries...',
      'Calculating unit areas...',
    ];

    let currentStep = 0;
    setSegmentationStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setSegmentationStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setIsSegmenting(false);
        setSegmentationStep(null);
        setSegmentationComplete(true);
        setDetectedUnits(24);
        setConfidence(91);
        if (onSegmentationComplete) {
          onSegmentationComplete(24);
        }
      }
    }, 600);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
          05
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Floor Plan & Building Geometry
          </h2>
          <p className="text-[11px] text-slate-500">
            Floor-level spatial data required for vertical property mapping
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Floor Plan Upload & AI Segmentation */}
        <div className="space-y-4 rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Floor Plan</span>
              <p className="text-[11px] text-slate-500">Accepted: PDF / JPG / PNG / CAD</p>
            </div>
            <label className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Floor Plan</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                onChange={handleFloorPlanUpload}
                className="hidden"
              />
            </label>
          </div>

          {floorPlanFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-mono text-xs">{floorPlanFile}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              {/* AI Segmentation Action */}
              <div className="pt-1">
                {isSegmenting ? (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-blue-600" />
                    <span className="font-semibold">{segmentationStep}</span>
                  </div>
                ) : segmentationComplete ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>✓ Floor segmentation completed</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 pl-6">
                      <span>Detected Units: <strong className="text-slate-900 dark:text-white font-mono">{detectedUnits}</strong></span>
                      <span>Confidence: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{confidence}%</strong></span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={runAISegmentation}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Run AI Floor Segmentation</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Upload an architectural floor plan to enable automated AI unit segmentation.
            </div>
          )}
        </div>

        {/* B. Building Footprint Upload & 2D Vector Preview */}
        <div className="space-y-4 rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Building Footprint</span>
              <p className="text-[11px] text-slate-500">Accepted: GeoJSON / SHP</p>
            </div>
            <label className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Footprint</span>
              <input
                type="file"
                accept=".geojson,.json,.shp,.kml"
                onChange={handleFootprintUpload}
                className="hidden"
              />
            </label>
          </div>

          {buildingFootprintFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-mono text-xs">{buildingFootprintFile}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">EPSG:4326</span>
              </div>

              {/* 2D Footprint SVG Preview */}
              <div className="relative h-28 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 p-2 flex items-center justify-center">
                <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-mono text-slate-400">
                  <Compass className="w-3 h-3 text-blue-400" />
                  <span>2D Base Footprint Preview</span>
                </div>
                <svg viewBox="0 0 200 100" className="w-full h-full max-h-24">
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="200" y2="25" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2="200" y2="75" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="100" y1="0" x2="100" y2="100" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="150" y1="0" x2="150" y2="100" stroke="#1e293b" strokeWidth="0.5" />

                  {/* Parcel Boundary */}
                  <polygon
                    points="30,15 170,15 170,85 30,85"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />

                  {/* Building Footprint Polygon */}
                  <polygon
                    points="50,25 150,25 150,75 50,75"
                    fill="#3b82f6"
                    fillOpacity="0.25"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                  />

                  {/* Core / Lift Shaft */}
                  <rect x="90" y="42" width="20" height="16" fill="#1e40af" stroke="#60a5fa" strokeWidth="1" />
                  <text x="100" y="52" fill="#93c5fd" fontSize="5" textAnchor="middle">CORE</text>

                  {/* Dimension Annotations */}
                  <text x="100" y="20" fill="#94a3b8" fontSize="6" textAnchor="middle">48.5 m</text>
                  <text x="156" y="52" fill="#94a3b8" fontSize="6">26.2 m</text>
                </svg>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Upload GeoJSON or Shapefile polygon footprint.
            </div>
          )}
        </div>
      </div>

      {/* Floor Plan Full Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Architectural Floor Plan Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-96 rounded-xl bg-slate-950 p-4 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
              <svg viewBox="0 0 400 240" className="w-full h-full max-h-80">
                {/* Outer Wall */}
                <rect x="20" y="20" width="360" height="200" fill="#0f172a" stroke="#3b82f6" strokeWidth="3" />
                {/* Central Corridor */}
                <rect x="20" y="105" width="360" height="30" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                <text x="200" y="123" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">CENTRAL PASSAGE / COMMON ACCESS</text>

                {/* Unit 1 */}
                <rect x="20" y="20" width="170" height="85" fill="#1e3a8a" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1.5" />
                <text x="105" y="55" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold">UNIT 101 (2BHK)</text>
                <text x="105" y="75" fill="#93c5fd" fontSize="9" textAnchor="middle">112.5 sq.m</text>

                {/* Unit 2 */}
                <rect x="210" y="20" width="170" height="85" fill="#1e3a8a" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1.5" />
                <text x="295" y="55" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold">UNIT 102 (2BHK)</text>
                <text x="295" y="75" fill="#93c5fd" fontSize="9" textAnchor="middle">115.0 sq.m</text>

                {/* Unit 3 */}
                <rect x="20" y="135" width="170" height="85" fill="#1e3a8a" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1.5" />
                <text x="105" y="170" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold">UNIT 103 (3BHK)</text>
                <text x="105" y="190" fill="#93c5fd" fontSize="9" textAnchor="middle">145.0 sq.m</text>

                {/* Unit 4 */}
                <rect x="210" y="135" width="170" height="85" fill="#1e3a8a" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1.5" />
                <text x="295" y="170" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold">UNIT 104 (3BHK)</text>
                <text x="295" y="190" fill="#93c5fd" fontSize="9" textAnchor="middle">148.2 sq.m</text>

                {/* Vertical Core */}
                <rect x="190" y="20" width="20" height="200" fill="#0284c7" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="200" y="110" fill="#ffffff" fontSize="8" textAnchor="middle" transform="rotate(-90 200 110)">ELEVATOR & STAIRWELL CORE</text>
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Layout scale 1:100 • Certified Architectural CAD drawing</span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
