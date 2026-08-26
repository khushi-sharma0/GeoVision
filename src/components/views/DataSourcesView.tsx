import React from 'react';
import {
  Database,
  UploadCloud,
  FileText,
  Layers,
  MapPin,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const sources = [
    { name: 'Drone Orthomosaic (Bangalore CBD)', file: 'drone_ortho_cbd_2024.tif', size: '1.2 GB', type: 'GeoTIFF / Raster (5cm GSD)', status: 'Fused' },
    { name: 'Airborne LiDAR Point Cloud', file: 'blr_urban_lidar_2024.las', size: '3.4 GB', type: 'LAS / 3D Points (35 pts/m²)', status: 'Fused' },
    { name: 'Digital Elevation Model (DEM)', file: 'karnataka_dem_elevation.tif', size: '420 MB', type: 'GeoTIFF Surface Grid', status: 'Active' },
    { name: 'Digital Surface Model (DSM)', file: 'blr_building_dsm.tif', size: '610 MB', type: 'Building Height Mesh', status: 'Active' },
    { name: 'Karnataka CORS GNSS Network', file: 'cors_station_telemetry.json', size: '15 KB', type: 'Real-Time RTK Stream', status: 'Online' },
    { name: 'Underground Pipe Network (GIS)', file: 'subsurface_utilities_bwssb.shp', size: '85 MB', type: 'Shapefile Vector (3D)', status: 'Active' },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Spatial Data Sources & Geodetic Infrastructure
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage LiDAR point clouds, drone orthomosaics, digital elevation models (DEM/DSM), and CORS networks.
            </p>
          </div>
        </div>

        {/* Data Source Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sources.map((s) => (
            <div
              key={s.name}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {s.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {s.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Name</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{s.file}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payload Size</span>
                    <span className="font-mono">{s.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Type</span>
                    <span>{s.type}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fused in 3D Scene
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
