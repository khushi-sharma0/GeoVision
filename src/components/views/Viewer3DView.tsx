import React, { useState, useMemo } from 'react';
import {
  Layers,
  MapPin,
  Building,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  FileCheck,
  Eye,
  Maximize2,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  RotateCcw,
  Box,
  Compass,
  ArrowUpRight,
  Download,
  KeyRound,
  PlusCircle,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { useAuth } from '../../context/AuthContext';
import { CadastreScene3D } from '../3d/CadastreScene3D';
import { UndergroundScene3D } from '../3d/UndergroundScene3D';
import { LeafletMapWidget } from '../gis/LeafletMapWidget';
import { copyToClipboard } from '../../utils/ulpinGenerator';
import { UlpinAssemblyReveal } from '../common/UlpinAssemblyReveal';

export const Viewer3DView: React.FC = () => {
  const {
    isDark,
    parcels,
    buildings,
    selectedParcel,
    selectedBuilding,
    selectedFloor,
    selectedUnit,
    selectedOwnership,
    selectedConflict,
    floors,
    units,
    setSelectedFloorId,
    setSelectedUnitId,
    selectProperty,
    clearPropertySelection,
    layers,
    toggleLayer,
    setIsPropertyCardOpen,
    setIsDocsModalOpen,
    setIsFloorPlanModalOpen,
    setActiveTab,
  } = useCadastre();

  const { user } = useAuth();
  const isCitizen =
    !user ||
    user.role?.toLowerCase().includes('citizen') ||
    user.name?.toLowerCase().includes('aarav') ||
    localStorage.getItem('geovision_user_role') === 'citizen';

  const [copied, setCopied] = useState<boolean>(false);
  const [showUnderground, setShowUnderground] = useState<boolean>(false);
  const [show2DMapModal, setShow2DMapModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const bldgFloors = floors
    .filter((f) => f.buildingId === selectedBuilding?.id)
    .sort((a, b) => b.floorIndex - a.floorIndex);

  const currentFloorUnits = units.filter((u) => u.floorId === selectedFloor?.id);

  // Filtered parcels for the empty/selector state
  const availableProperties = useMemo(() => {
    return parcels.filter((p) => {
      const bldg = buildings.find((b) => b.parcelId === p.id);
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        p.localParcelId.toLowerCase().includes(q) ||
        p.ulpin.toLowerCase().includes(q) ||
        p.locationName.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (bldg && bldg.buildingName && bldg.buildingName.toLowerCase().includes(q))
      );
    });
  }, [parcels, buildings, searchQuery]);

  const handleCopyULPIN = async () => {
    if (selectedUnit?.full3DULPIN) {
      await copyToClipboard(selectedUnit.full3DULPIN);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ========================================================
  // 1. EMPTY / SELECTION STATE: When NO Property is selected
  // ========================================================
  if (!selectedBuilding) {
    return (
      <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 select-none">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Box className="w-5 h-5" />
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  3D Cadastral Property Visualizer
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  AWAITING SELECTION
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                {isCitizen
                  ? 'No 3D property is currently active. Select an existing registered property from the catalog below to render its 3D volumetric model.'
                  : 'No 3D property is currently active. Select an existing registered property from the catalog below to render its 3D volumetric model, or generate a new 3D spatial twin.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Create 3D Property Button: Hidden in Citizen Mode */}
              {!isCitizen && (
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create / Generate 3D Property</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>All Properties Registry</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered properties by building name, 2D ULPIN, location, or parcel ID..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs font-mono"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Grid of Registered Properties to choose from */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProperties.map((p) => {
              const bldg = buildings.find((b) => b.parcelId === p.id);
              const pFloors = floors.filter((f) => f.buildingId === bldg?.id);
              const pUnits = units.filter((u) => u.buildingId === bldg?.id);

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                          {p.localParcelId}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                          {bldg?.buildingName || 'Multi-Storey Complex'}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {p.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                        <span>2D ULPIN:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.ulpin}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                        <span>Location:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-sans truncate max-w-[160px]">
                          {p.locationName}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Floors</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {bldg?.numberOfFloors || pFloors.length || 6}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Units</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {pUnits.length || 24}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Land Use</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">
                          {p.landUse}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => selectProperty(p.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <Box className="w-4 h-4" />
                      <span>Load in 3D Viewer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {availableProperties.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No properties match your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting the search terms</p>
              {!isCitizen && (
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Create New Property
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  // ========================================================
  // 2. ACTIVE 3D WORKSPACE: When a Property IS Selected
  // ========================================================
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-100 dark:bg-slate-950 select-none">
      {/* Upper Main Workspace (3D Canvas + Right Explorer Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ======================================================== */}
        {/* 3D VIEWPORT CANVAS WITH RADIAL GRADIENT & OVERLAYS       */}
        {/* ======================================================== */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          
          {/* Main 3D Canvas rendering */}
          <div className="w-full h-full absolute inset-0">
            {showUnderground ? <UndergroundScene3D /> : <CadastreScene3D />}
          </div>

          {/* Floating Top-Left Card: Active Property & Layer Checkboxes */}
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 w-64 z-20 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Active 3D Property
                </span>
              </div>
              <button
                type="button"
                onClick={clearPropertySelection}
                title="Change or Deselect Property"
                className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Switch</span>
              </button>
            </div>
            
            {/* Property Quick Switcher Dropdown */}
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Selected Structure
              </label>
              <select
                value={selectedParcel?.id || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    selectProperty(e.target.value);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
              >
                {parcels.map((p) => {
                  const bldg = buildings.find((b) => b.parcelId === p.id);
                  return (
                    <option key={p.id} value={p.id}>
                      {bldg?.buildingName || p.localParcelId} ({p.ulpin})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
              📍 {selectedParcel?.locationName || 'Bangalore Urban'}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Visibility Layers
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                {[
                  { key: 'parcelBoundary', label: 'Parcel' },
                  { key: 'buildings3D', label: 'Building' },
                  { key: 'cadastralLabels', label: 'Units' },
                  { key: 'undergroundInfra', label: 'Sewerage' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(layers[item.key as keyof typeof layers])}
                      onChange={() => toggleLayer(item.key as keyof typeof layers)}
                      className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Subterranean / Viewport Mode Switcher Pill */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              onClick={() => setShowUnderground((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer ${
                showUnderground
                  ? 'bg-cyan-600 text-white border-cyan-500'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showUnderground ? 'bg-white animate-pulse' : 'bg-cyan-500'}`} />
              <span>{showUnderground ? 'Subterranean (B1) Active' : 'View Underground Infra'}</span>
            </button>
          </div>

          {/* Bottom Floating 3D Toolbar with Report Incorrect Boundary Redirection Button */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('properties')}
                title="All Properties Registry"
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <Building className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
              <button
                onClick={() => setIsFloorPlanModalOpen(true)}
                title="View 2D Floor Plan & AI Polygons"
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Floor Plan</span>
              </button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
              <button
                onClick={() => setActiveTab('ai_analysis')}
                title="AI Analysis"
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">AI Mesh</span>
              </button>
            </div>

            {/* Report Incorrect Boundary Button -> Redirects to Reports Dispute Page */}
            {isCitizen && (
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Incorrect Boundary</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Floor / Unit Explorer & Unit Details       */}
        {/* ======================================================== */}
        <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 shadow-sm">
          
          {/* Top Floor Selection */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              Floor / Unit Explorer
            </div>
            <select
              value={selectedFloor?.id || ''}
              onChange={(e) => setSelectedFloorId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {bldgFloors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.floorCode} — {f.floorName} ({f.totalFloorAreaSqM} m²)
                </option>
              ))}
            </select>
          </div>

          {/* Unit List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {currentFloorUnits.map((u) => {
              const isSelected = u.id === selectedUnit?.id;
              const hasConflict = u.unitCode === 'F3-303' || selectedConflict?.unitId === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: u.colorHex || '#22c55e' }}
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white font-mono block">
                        Unit {u.unitCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {u.carpetAreaSqM.toFixed(1)} m² • {u.unitType}
                      </span>
                    </div>
                  </div>

                  {hasConflict ? (
                    <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Conflict
                    </span>
                  ) : isSelected ? (
                    <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Selected
                    </span>
                  ) : (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Owned
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unit Details Box at Bottom */}
          <div className="h-[340px] bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Unit Details
                </span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                  LADM ISO 19152
                </span>
              </div>

              {/* 3D ULPIN Assembly Reveal */}
              <div className="mb-3">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">
                  Generated 3D ULPIN
                </span>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded flex items-center justify-between overflow-hidden">
                  <UlpinAssemblyReveal
                    ulpin={selectedUnit?.full3DULPIN || 'KA-BLR-2024-0001-0001-BA-F3-U303'}
                    size="sm"
                    showCopy={true}
                  />
                </div>
              </div>

              {/* 2x2 Grid of Key Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Owner</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                    {selectedOwnership?.ownerName || 'Rahul Sharma'}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Carpet Area</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                    {selectedUnit?.carpetAreaSqM.toFixed(2) || '145.00'} m²
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Usage / Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate block">
                    {selectedUnit?.unitType || 'Residential'}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setIsPropertyCardOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download 3D Report / Card</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDocsModalOpen(true)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Manage Ownership & Docs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM FOOTER: AI PROCESSING PIPELINE & TOPOLOGY STATUS  */}
      {/* ======================================================== */}
      <div className="h-24 md:h-28 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row shrink-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 z-20">
        
        {/* Left: AI Processing Pipeline Progress */}
        <div className="flex-1 p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-blue-600" />
              AI Processing Pipeline
            </span>
            <span className="text-[10px] text-blue-600 font-bold font-mono">
              91% Overall Confidence
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[
              { title: '1. Parcel Validated', sub: 'Boundary & GPS', status: 'done' },
              { title: '2. Building Sync', sub: 'Extrusion & Footprint', status: 'done' },
              { title: '3. Segmentation', sub: 'Floor Slicing', status: 'done' },
              { title: '4. Unit Map', sub: '3D Polygons', status: 'done' },
              { title: '5. Validation', sub: 'Topology Check', status: 'warning' },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-1.5 rounded text-center border transition-all ${
                  step.status === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                }`}
              >
                <div className="text-[10px] font-bold truncate leading-tight">{step.title}</div>
                <div className="text-[8px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">{step.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Topology Status Alert Banner */}
        <div className="w-full md:w-80 p-3 bg-amber-50/70 dark:bg-amber-950/20 flex flex-col justify-center shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              Topology Status
            </span>
            <button
              onClick={() => setActiveTab(isCitizen ? 'reports' : 'validation')}
              className="text-[10px] text-amber-700 dark:text-amber-300 font-bold hover:underline cursor-pointer"
            >
              {isCitizen ? 'Report Boundary →' : 'Details →'}
            </button>
          </div>

          <p className="text-[10px] text-amber-900 dark:text-amber-200 font-bold leading-tight">
            AREA MISMATCH: UNIT TOTALS EXCEED FLOOR
          </p>
          <p className="text-[9px] text-amber-700 dark:text-amber-400 leading-tight mt-0.5">
            Floor F4: Registered 1,000 m² | Sum of Units: 1,175 m² (+17.5% overlap).
          </p>
        </div>
      </div>
    </div>
  );
};