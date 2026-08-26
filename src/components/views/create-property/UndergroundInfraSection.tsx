import React from 'react';
import {
  Droplets,
  Zap,
  Flame,
  CloudRain,
  Car,
  Layers,
  UploadCloud,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export interface UndergroundLayer {
  id: string;
  name: string;
  enabled: boolean;
  file: string | null;
  icon: any;
  depthM: number;
}

interface UndergroundInfraProps {
  layers: UndergroundLayer[];
  setLayers: React.Dispatch<React.SetStateAction<UndergroundLayer[]>>;
}

export const UndergroundInfraSection: React.FC<UndergroundInfraProps> = ({
  layers,
  setLayers,
}) => {
  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;
      setLayers((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, file: `${file.name} (${sizeStr})`, enabled: true } : l
        )
      );
    }
  };

  const removeFile = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, file: null, enabled: false } : l))
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
            07
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Underground Infrastructure
            </h2>
            <p className="text-[11px] text-slate-500">
              Optional subsurface property and utility mapping
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          OPTIONAL
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Accepted formats: GeoJSON / SHP / DWG. Subsurface assets and basements will be positioned at negative elevation (Z &lt; 0) directly below the building envelope.
      </p>

      {/* Grid of Subsurface Layers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {layers.map((layer) => {
          const Icon = layer.icon;

          return (
            <div
              key={layer.id}
              className={`p-3.5 rounded-xl border transition-all ${
                layer.enabled
                  ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
              } space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`check-${layer.id}`}
                    checked={layer.enabled}
                    onChange={() => toggleLayer(layer.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <label
                    htmlFor={`check-${layer.id}`}
                    className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer select-none flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{layer.name}</span>
                  </label>
                </div>

                <label className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors shrink-0">
                  <span>{layer.file ? 'Change' : 'Upload'}</span>
                  <input
                    type="file"
                    accept=".geojson,.shp,.dwg,.json"
                    onChange={(e) => handleFileUpload(layer.id, e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded status */}
              {layer.file ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs">
                  <div className="flex items-center gap-1.5 overflow-hidden text-emerald-700 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate font-mono text-[11px]">{layer.file}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(layer.id)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors shrink-0"
                    title="Remove layer file"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                  <span>Target depth: -{layer.depthM}m</span>
                  <span>Not uploaded</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
