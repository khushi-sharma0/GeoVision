import React from 'react';
import {
  UploadCloud,
  CheckCircle2,
  FileCheck,
  Camera,
  Radio,
  Mountain,
  Grid3X3,
  MapPin,
  Trash2,
} from 'lucide-react';

export interface Survey3DState {
  droneImagery: string | null;
  lidarCloud: string | null;
  dem: string | null;
  dsm: string | null;
  gnssCors: string | null;
}

interface Survey3DDataProps {
  surveyData: Survey3DState;
  setSurveyData: React.Dispatch<React.SetStateAction<Survey3DState>>;
}

export const Survey3DDataSection: React.FC<Survey3DDataProps> = ({
  surveyData,
  setSurveyData,
}) => {
  const items = [
    {
      id: 'droneImagery' as keyof Survey3DState,
      label: 'Drone Imagery',
      accepted: 'GeoTIFF / JPG / PNG',
      icon: Camera,
      fileTypes: '.tif,.tiff,.jpg,.jpeg,.png',
    },
    {
      id: 'lidarCloud' as keyof Survey3DState,
      label: 'LiDAR / 3D Point Cloud',
      accepted: 'LAS / LAZ',
      icon: Radio,
      fileTypes: '.las,.laz,.xyz,.ply',
    },
    {
      id: 'dem' as keyof Survey3DState,
      label: 'DEM (Digital Elevation Model)',
      accepted: 'GeoTIFF',
      icon: Mountain,
      fileTypes: '.tif,.tiff,.dem',
    },
    {
      id: 'dsm' as keyof Survey3DState,
      label: 'DSM (Digital Surface Model)',
      accepted: 'GeoTIFF',
      icon: Grid3X3,
      fileTypes: '.tif,.tiff,.dsm',
    },
    {
      id: 'gnssCors' as keyof Survey3DState,
      label: 'GNSS / CORS Coordinates',
      accepted: 'CSV',
      icon: MapPin,
      fileTypes: '.csv,.txt',
    },
  ];

  const handleFileUpload = (
    key: keyof Survey3DState,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;
      setSurveyData((prev) => ({
        ...prev,
        [key]: `${file.name} (${sizeStr})`,
      }));
    }
  };

  const removeFile = (key: keyof Survey3DState) => {
    setSurveyData((prev) => ({
      ...prev,
      [key]: null,
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
            06
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Survey & 3D Data
            </h2>
            <p className="text-[11px] text-slate-500">
              Optional geospatial data for enhanced 3D accuracy
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          OPTIONAL
        </span>
      </div>

      {/* Grid of Survey Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const uploadedValue = surveyData[item.id];

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {item.label}
                    </h3>
                    <p className="text-[10px] text-slate-500">Accepted: {item.accepted}</p>
                  </div>
                </div>

                <label className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors shrink-0">
                  <span>{uploadedValue ? 'Replace' : 'Upload'}</span>
                  <input
                    type="file"
                    accept={item.fileTypes}
                    onChange={(e) => handleFileUpload(item.id, e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Status Box */}
              {uploadedValue ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs">
                  <div className="flex items-center gap-1.5 overflow-hidden text-emerald-700 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate font-mono text-[11px]">{uploadedValue}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors shrink-0"
                    title="Remove File"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Optional — Not provided</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
