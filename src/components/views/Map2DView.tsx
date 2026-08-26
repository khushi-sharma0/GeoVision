import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Search,
  Filter,
  Eye,
  Box,
  Building,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { LeafletMapWidget } from '../gis/LeafletMapWidget';

export const Map2DView: React.FC = () => {
  const {
    parcels,
    selectedParcelId,
    selectProperty,
    selectedParcel,
    setActiveTab,
    layers,
    toggleLayer,
  } = useCadastre();

  const [filterText, setFilterText] = useState<string>('');
  const [selectedLandUse, setSelectedLandUse] = useState<string>('ALL');

  const filteredParcels = parcels.filter((p) => {
    const matchText =
      p.localParcelId.toLowerCase().includes(filterText.toLowerCase()) ||
      p.ulpin.toLowerCase().includes(filterText.toLowerCase()) ||
      p.locationName.toLowerCase().includes(filterText.toLowerCase());

    const matchType = selectedLandUse === 'ALL' || p.landUse === selectedLandUse;
    return matchText && matchType;
  });

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950 p-2 md:p-3 gap-3">
      {/* Left Sidebar for 2D Map: Filter and Parcel List */}
      <div className="w-full md:w-80 flex flex-col gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>2D GIS Parcel Browser</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {filteredParcels.length} / {parcels.length}
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search ULPIN or parcel ID..."
              className="w-full h-8 pl-8 pr-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
          </div>

          <select
            value={selectedLandUse}
            onChange={(e) => setSelectedLandUse(e.target.value)}
            className="w-full h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Land Uses</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Mixed Use">Mixed Use</option>
            <option value="Industrial">Industrial</option>
            <option value="Institutional">Institutional</option>
          </select>
        </div>

        {/* Parcel List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredParcels.map((p) => {
            const isSelected = p.id === selectedParcelId;
            return (
              <div
                key={p.id}
                onClick={() => selectProperty(p.id)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {p.localParcelId}
                  </span>
                  <span className="text-slate-500 text-[11px]">{p.areaSqM.toFixed(0)} m²</span>
                </div>
                <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate mt-0.5">
                  {p.ulpin}
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                  <span>{p.landUse}</span>
                  <span className="text-emerald-600 font-semibold">{p.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Parcel Actions */}
        {selectedParcel && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => setActiveTab('viewer3d')}
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Box className="w-4 h-4" />
              <span>Launch 3D Cadastral Model</span>
            </button>
          </div>
        )}
      </div>

      {/* Center 2D Map Canvas */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <span>Cadastral Cartography — Bangalore Urban Grid</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>Projection: EPSG:4326</span>
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <LeafletMapWidget height="100%" interactive={true} />
        </div>
      </div>
    </div>
  );
};
