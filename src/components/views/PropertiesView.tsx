import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Search,
  Box,
  Eye,
  PlusCircle,
  FileText,
  CheckCircle2,
  Filter,
  Layers,
  RotateCcw,
  Building,
  ShieldCheck,
  LayoutGrid,
  ListFilter,
  SlidersHorizontal,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';

export const PropertiesView: React.FC = () => {
  const {
    parcels,
    buildings,
    floors,
    units,
    selectProperty,
    setActiveTab,
  } = useCadastre();

  // Search & Filter States
  const [search, setSearch] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedBuildingType, setSelectedBuildingType] = useState<string>('ALL');
  const [selectedFloorRange, setSelectedFloorRange] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selected3DStatus, setSelected3DStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract unique cities & building types dynamically from data
  const cities = useMemo(() => {
    const set = new Set<string>();
    parcels.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set);
  }, [parcels]);

  const buildingTypes = useMemo(() => {
    const set = new Set<string>();
    buildings.forEach((b) => {
      if (b.buildingType) set.add(b.buildingType);
    });
    return Array.from(set);
  }, [buildings]);

  // Filtered dataset
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const bldg = buildings.find((b) => b.parcelId === p.id);

      // Search match
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        p.localParcelId.toLowerCase().includes(q) ||
        p.ulpin.toLowerCase().includes(q) ||
        p.locationName.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (bldg && bldg.buildingName && bldg.buildingName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // City filter
      if (selectedCity !== 'ALL' && p.city !== selectedCity) return false;

      // Building Type filter
      if (selectedBuildingType !== 'ALL') {
        if (!bldg || bldg.buildingType !== selectedBuildingType) return false;
      }

      // Floors Range filter
      if (selectedFloorRange !== 'ALL') {
        const floorCount = bldg ? bldg.numberOfFloors : 0;
        if (selectedFloorRange === '1-5' && (floorCount < 1 || floorCount > 5)) return false;
        if (selectedFloorRange === '6-15' && (floorCount < 6 || floorCount > 15)) return false;
        if (selectedFloorRange === '16+' && floorCount < 16) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;

      // 3D Availability
      if (selected3DStatus === '3D_ONLY' && !bldg) return false;
      if (selected3DStatus === '2D_ONLY' && bldg) return false;

      return true;
    });
  }, [parcels, buildings, search, selectedCity, selectedBuildingType, selectedFloorRange, selectedStatus, selected3DStatus]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCity('ALL');
    setSelectedBuildingType('ALL');
    setSelectedFloorRange('ALL');
    setSelectedStatus('ALL');
    setSelected3DStatus('ALL');
  };

  const handleOpen3D = (parcelId: string) => {
    selectProperty(parcelId);
    setActiveTab('viewer3d');
  };

  const totalRegisteredUnits = units.length;
  const verifiedParcelsCount = parcels.filter((p) => p.status === 'Verified').length;

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Cadastral Properties & 3D Strata Schemes
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {filteredParcels.length} of {parcels.length} Properties
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore multi-level building developments, registered land parcels, and ISO 19152 LADM 3D property registers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create 3D Property</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Parcels</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">{parcels.length} Registered</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">3D Strata Buildings</span>
            <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{buildings.length} Active</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Volumetric Units</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{totalRegisteredUnits} Units</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Verification Rate</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {((verifiedParcelsCount / parcels.length) * 100).toFixed(0)}% Verified
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Parcel ID, ULPIN, Building Name, Location..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:font-sans"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

          {/* Detailed Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* City */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">City / Region</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Cities ({cities.length})</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Building Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Building Type</label>
              <select
                value={selectedBuildingType}
                onChange={(e) => setSelectedBuildingType(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Building Types</option>
                {buildingTypes.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Floors */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Floors</label>
              <select
                value={selectedFloorRange}
                onChange={(e) => setSelectedFloorRange(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Heights</option>
                <option value="1-5">1 – 5 Floors (Low-Rise)</option>
                <option value="6-15">6 – 15 Floors (Mid-Rise)</option>
                <option value="16+">16+ Floors (High-Rise)</option>
              </select>
            </div>

            {/* Validation Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Under Review">Under Review</option>
                <option value="Pending">Pending</option>
                <option value="Disputed">Disputed</option>
              </select>
            </div>

            {/* 3D Availability */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">3D Availability</label>
              <select
                value={selected3DStatus}
                onChange={(e) => setSelected3DStatus(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Cadastres</option>
                <option value="3D_ONLY">3D Model Available</option>
                <option value="2D_ONLY">2D Parcel Only</option>
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Parcels Content */}
        {filteredParcels.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Box className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No properties match your filter criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your city, building type, floor height, or validation status filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredParcels.map((p) => {
              const bldg = buildings.find((b) => b.parcelId === p.id);
              const bldgFloors = bldg ? floors.filter((f) => f.buildingId === bldg.id) : [];
              const bldgUnits = bldg ? units.filter((u) => u.buildingId === bldg.id) : [];

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                          {p.localParcelId}
                        </span>
                        {p.city && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {p.city}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    {/* Building Name & Type */}
                    {bldg && (
                      <div className="mb-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {bldg.buildingName}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">{bldg.buildingType}</span>
                      </div>
                    )}

                    {/* Details List */}
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">2D Parent ULPIN</span>
                        <p className="font-mono text-slate-900 dark:text-slate-100 font-bold truncate">
                          {p.ulpin}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Location</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={p.locationName}>
                          {p.locationName}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Parcel Area</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {p.areaSqM.toLocaleString()} m²
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Land Use</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{p.landUse}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Row with 3D Info & Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 font-medium">
                      {bldg ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{bldg.numberOfFloors} Floors</span>
                          <span>•</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{bldgUnits.length} Units</span>
                        </div>
                      ) : (
                        <span>Standard 2D Cadastre</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpen3D(p.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>View 3D</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Parcel ID</th>
                  <th className="p-3">City</th>
                  <th className="p-3">2D ULPIN</th>
                  <th className="p-3">Building Name & Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Floors / Units</th>
                  <th className="p-3">Area (m²)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                {filteredParcels.map((p) => {
                  const bldg = buildings.find((b) => b.parcelId === p.id);
                  const bldgUnits = bldg ? units.filter((u) => u.buildingId === bldg.id) : [];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{p.localParcelId}</td>
                      <td className="p-3 font-sans font-medium">{p.city || 'Mumbai'}</td>
                      <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400 font-mono">{p.ulpin}</td>
                      <td className="p-3 font-sans">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{bldg?.buildingName || '—'}</div>
                        <div className="text-[10px] text-slate-400">{bldg?.buildingType}</div>
                      </td>
                      <td className="p-3 font-sans text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{p.locationName}</td>
                      <td className="p-3 font-sans">
                        {bldg ? `${bldg.numberOfFloors}F / ${bldgUnits.length}U` : '2D Only'}
                      </td>
                      <td className="p-3 font-mono">{p.areaSqM.toLocaleString()} m²</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.status === 'Verified'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpen3D(p.id)}
                          className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Box className="w-3.5 h-3.5" />
                          <span>3D</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
