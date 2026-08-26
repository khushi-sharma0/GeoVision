import React, { useState, useMemo, useRef } from 'react';
import {
  Layers,
  Building,
  Box,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  FileCheck,
  UploadCloud,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Info,
  X,
  FileText,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { Unit, Floor } from '../../types/cadastre';
import { parseCSV, findHeaderKey } from '../../utils/csvParser';

interface ImportedUnitRecord {
  baseUlpin: string;
  buildingId: string;
  floor: string;
  unitId: string;
  unitType: string;
  carpetAreaSqM: number;
  ownerName: string;
  deedNumber: string;
  verificationStatus: string;
  areaSource: 'Calculated from geometry' | 'Imported from dataset';
}

export const FloorUnitExplorerView: React.FC = () => {
  const {
    floors,
    units,
    selectedBuilding,
    selectedFloor,
    selectedUnit,
    selectedOwnership,
    setSelectedFloorId,
    setSelectedUnitId,
    setActiveTab,
    setIsPropertyCardOpen,
    ownerships,
  } = useCadastre();

  // Custom Dataset State (allows user to upload CSV or enter parameters dynamically)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [customUnitsData, setCustomUnitsData] = useState<ImportedUnitRecord[] | null>(null);
  const [selectedCustomFloor, setSelectedCustomFloor] = useState<string | null>(null);
  const [selectedCustomUnitId, setSelectedCustomUnitId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive active floors from dataset
  const activeFloorsList = useMemo(() => {
    if (customUnitsData && customUnitsData.length > 0) {
      const distinctFloors: string[] = Array.from(new Set(customUnitsData.map((u) => u.floor)));
      // Sort floors numerically
      distinctFloors.sort((a: string, b: string) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      return distinctFloors.map((fCode) => {
        const floorUnits = customUnitsData.filter((u) => u.floor === fCode);
        const totalArea = floorUnits.reduce((sum, u) => sum + u.carpetAreaSqM, 0);
        return {
          id: `custom-floor-${fCode}`,
          floorCode: fCode,
          floorName: `${fCode} – Residential`,
          totalFloorAreaSqM: totalArea,
          unitCount: floorUnits.length,
          units: floorUnits,
        };
      });
    }

    // Default to currently selected building's real floors in state
    if (selectedBuilding) {
      const bldgFloors = floors
        .filter((f) => f.buildingId === selectedBuilding.id)
        .sort((a, b) => {
          const aIndex = a.floorIndex !== undefined ? a.floorIndex : 0;
          const bIndex = b.floorIndex !== undefined ? b.floorIndex : 0;
          return aIndex - bIndex;
        });
      return bldgFloors.map((f) => {
        const fUnits = units.filter((u) => u.floorId === f.id);
        return {
          id: f.id,
          floorCode: f.floorCode,
          floorName: f.floorName,
          totalFloorAreaSqM: f.totalFloorAreaSqM,
          unitCount: fUnits.length,
          units: fUnits,
        };
      });
    }

    return [];
  }, [customUnitsData, floors, units, selectedBuilding]);

  // Determine current active floor object
  const currentFloorData = useMemo(() => {
    if (customUnitsData && customUnitsData.length > 0) {
      const targetFloorCode = selectedCustomFloor || activeFloorsList[0]?.floorCode;
      return activeFloorsList.find((f) => f.floorCode === targetFloorCode) || activeFloorsList[0] || null;
    }

    if (selectedFloor) {
      const fUnits = units.filter((u) => u.floorId === selectedFloor.id);
      return {
        id: selectedFloor.id,
        floorCode: selectedFloor.floorCode,
        floorName: selectedFloor.floorName,
        totalFloorAreaSqM: selectedFloor.totalFloorAreaSqM,
        unitCount: fUnits.length,
        units: fUnits,
      };
    }

    return activeFloorsList[0] || null;
  }, [customUnitsData, selectedCustomFloor, activeFloorsList, selectedFloor, units]);

  // Determine current active unit object with robust owner name resolution
  const currentActiveUnit = useMemo(() => {
    if (customUnitsData && customUnitsData.length > 0) {
      if (!currentFloorData) return null;
      const floorUnits = customUnitsData.filter((u) => u.floor === currentFloorData.floorCode);
      if (floorUnits.length === 0) return null;

      if (selectedCustomUnitId) {
        return floorUnits.find((u) => u.unitId === selectedCustomUnitId) || floorUnits[0] || null;
      }
      return floorUnits[0] || null;
    }

    // Standard state selection from global CadastreContext
    if (selectedUnit) {
      const matchedOwnership = ownerships.find(
        (o) =>
          o.unitId === selectedUnit.id ||
          o.unitCode === selectedUnit.unitCode ||
          o.unitCode?.toLowerCase() === selectedUnit.unitCode?.toLowerCase() ||
          o.unitId === `unit-gen-${selectedUnit.unitCode}`
      );

      return {
        baseUlpin: selectedUnit.parentParcelULPIN || '27101500123456',
        buildingId: selectedUnit.buildingCode || 'BA',
        floor: selectedUnit.floorCode,
        unitId: selectedUnit.unitCode,
        unitType: selectedUnit.unitType,
        carpetAreaSqM: selectedUnit.carpetAreaSqM,
        ownerName: matchedOwnership?.ownerName || 'Not Available',
        deedNumber: matchedOwnership?.docRefNo || 'Not Available',
        verificationStatus: selectedUnit.status || 'Verified',
        areaSource: 'Imported from dataset' as const,
      };
    }

    return null;
  }, [customUnitsData, currentFloorData, selectedCustomUnitId, selectedUnit, ownerships]);

  // Handle CSV Upload / Parse using robust parser
  const handleParseCsv = (content: string) => {
    try {
      const { headers, rows } = parseCSV(content);
      if (headers.length === 0 || rows.length === 0) return;

      const baseUlpinCol = findHeaderKey(headers, ['Base ULPIN', 'BaseULPIN', 'ULPIN', 'Parcel ULPIN']);
      const buildingIdCol = findHeaderKey(headers, ['Building ID', 'BuildingID', 'Building Code', 'Building']);
      const floorCol = findHeaderKey(headers, ['Floor', 'Floor Code', 'Floor Level', 'Level']);
      const unitIdCol = findHeaderKey(headers, ['Unit ID', 'UnitID', 'Unit Code', 'Unit_ID', 'Unit']);
      const unitTypeCol = findHeaderKey(headers, ['Unit Type', 'UnitType', 'Usage', 'Type']);
      const areaCol = findHeaderKey(headers, ['Area', 'Carpet Area', 'Area (sq.m)', 'AreaSqM', 'CarpetAreaSqM', 'Carpet Area (sq.m)']);
      const ownerCol = findHeaderKey(headers, ['Owner Name', 'OwnerName', 'Owner', 'Full Name', 'Owner Full Name']);
      const deedCol = findHeaderKey(headers, ['Deed Number', 'DeedNo', 'Document Ref', 'DocRefNo', 'Doc Number']);
      const statusCol = findHeaderKey(headers, ['Verification Status', 'Status', 'Verification']);

      const parsed: ImportedUnitRecord[] = [];

      rows.forEach((row, idx) => {
        // Fallback to positional mapping if named columns aren't matched
        const colKeys = Object.keys(row);
        const baseUlpin = (baseUlpinCol ? row[baseUlpinCol] : row[colKeys[0]]) || '27101500984123';
        const buildingId = (buildingIdCol ? row[buildingIdCol] : row[colKeys[1]]) || 'SB';
        const rawFloor = (floorCol ? row[floorCol] : row[colKeys[2]]) || 'F1';
        const floor = rawFloor.startsWith('F') ? rawFloor : `F${rawFloor}`;
        const unitId = (unitIdCol ? row[unitIdCol] : row[colKeys[3]]) || `U${101 + idx}`;
        const unitType = (unitTypeCol ? row[unitTypeCol] : row[colKeys[4]]) || 'Residential Flat';
        const rawArea = areaCol ? row[areaCol] : row[colKeys[5]];
        const carpetArea = parseFloat(rawArea) || 115.0;
        const ownerName = (ownerCol ? row[ownerCol] : row[colKeys[6]]) || 'Not Available';
        const deedNumber = (deedCol ? row[deedCol] : row[colKeys[7]]) || 'Not Available';
        const verificationStatus = (statusCol ? row[statusCol] : row[colKeys[8]]) || 'Verified';

        parsed.push({
          baseUlpin,
          buildingId,
          floor,
          unitId,
          unitType,
          carpetAreaSqM: carpetArea,
          ownerName,
          deedNumber,
          verificationStatus,
          areaSource: 'Imported from dataset',
        });
      });

      if (parsed.length > 0) {
        setCustomUnitsData(parsed);
        setSelectedCustomFloor(parsed[0].floor);
        setSelectedCustomUnitId(parsed[0].unitId);
        setIsImportModalOpen(false);
      }
    } catch (e) {
      console.error('Error parsing CSV', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          setCsvText(text);
          handleParseCsv(text);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleResetToDefault = () => {
    setCustomUnitsData(null);
    setSelectedCustomFloor(null);
    setSelectedCustomUnitId(null);
  };

  // Generate 3D ULPIN formula: BASE ULPIN – BUILDING ID – FLOOR – UNIT ID
  const calculated3DUlpin = currentActiveUnit
    ? `${currentActiveUnit.baseUlpin}-${currentActiveUnit.buildingId}-${currentActiveUnit.floor}-${currentActiveUnit.unitId}`
    : 'Not Available';

  // Render SVG Units on Floor Plan
  const unitsOnCurrentFloor = useMemo(() => {
    if (customUnitsData && currentFloorData) {
      return customUnitsData.filter((u) => u.floor === currentFloorData.floorCode);
    }
    if (selectedFloor) {
      return units.filter((u) => u.floorId === selectedFloor.id);
    }
    return [];
  }, [customUnitsData, currentFloorData, selectedFloor, units]);

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Floor & Unit Explorer (2D Architectural Cadastre)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive 2D floor plan unit segmentation with volumetric 3D ULPIN tenure synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Import Property / Floor Data</span>
            </button>

            {customUnitsData && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Reset to default dataset"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('viewer3d')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <Box className="w-4 h-4" />
              <span>Switch to 3D View</span>
            </button>
          </div>
        </div>

        {/* Dynamic Floor Selection Tabs */}
        {activeFloorsList.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {activeFloorsList.map((f) => {
              const isSelected = customUnitsData
                ? (selectedCustomFloor || activeFloorsList[0]?.floorCode) === f.floorCode
                : f.id === selectedFloor?.id || (currentFloorData && f.floorCode === currentFloorData.floorCode);

              return (
                <button
                  key={f.id || f.floorCode}
                  type="button"
                  onClick={() => {
                    if (customUnitsData) {
                      setSelectedCustomFloor(f.floorCode);
                      const firstUnit = customUnitsData.find((u) => u.floor === f.floorCode);
                      if (firstUnit) setSelectedCustomUnitId(firstUnit.unitId);
                    } else {
                      setSelectedFloorId(f.id);
                      const firstFloorUnit = units.find((u) => u.floorId === f.id);
                      if (firstFloorUnit) setSelectedUnitId(firstFloorUnit.id);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl font-mono text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {f.floorCode} – Residential ({f.unitCount} Units)
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            No property data available. Import a dataset or generate floor-plan data first.
          </div>
        )}

        {/* Main Grid: 2D Floor Plan Canvas + Selected Cadastral Unit Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* 2D Architectural Floor Plan Interactive Canvas */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>
                  FLOOR PLAN — {currentFloorData?.floorCode || 'F1'} — ARCHITECTURAL CAD VECTOR
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Total Area: {currentFloorData?.totalFloorAreaSqM?.toFixed(1) || '0.0'} m²
              </span>
            </div>

            {/* Interactive Architectural CAD Floor Plan Canvas */}
            <div className="h-[420px] w-full rounded-xl bg-slate-950 border border-slate-800 p-4 relative flex items-center justify-center select-none overflow-hidden">
              {unitsOnCurrentFloor.length === 0 ? (
                <div className="text-center text-slate-500 text-xs">
                  No units detected for this floor.
                </div>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 820 440">
                  {/* Grid Lines for CAD feel */}
                  <defs>
                    <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="820" height="440" fill="url(#cadGrid)" />

                  {/* External Structural Perimeter Wall */}
                  <rect
                    x="20"
                    y="20"
                    width="780"
                    height="400"
                    rx="8"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                  />
                  
                  {/* External Wall Thick Cavity */}
                  <rect
                    x="24"
                    y="24"
                    width="772"
                    height="392"
                    rx="6"
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />

                  {/* Central Corridor / Common Core Passageway */}
                  <rect
                    x="24"
                    y="180"
                    width="772"
                    height="80"
                    fill="#1e293b"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Vertical Lift / Staircase Core */}
                  <rect
                    x="370"
                    y="185"
                    width="80"
                    height="70"
                    rx="4"
                    fill="#0284c7"
                    fillOpacity="0.4"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <text
                    x="410"
                    y="225"
                    fill="#e0f2fe"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    LIFT / CORE
                  </text>

                  {/* Corridor Labels */}
                  <text
                    x="200"
                    y="225"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    WEST COMMON CORRIDOR
                  </text>
                  <text
                    x="620"
                    y="225"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    EAST COMMON CORRIDOR
                  </text>

                  {/* Render Units on Top Row & Bottom Row dynamically */}
                  {unitsOnCurrentFloor.map((u, idx) => {
                    const count = unitsOnCurrentFloor.length;
                    const isTop = idx < Math.ceil(count / 2);
                    const colIndex = isTop ? idx : idx - Math.ceil(count / 2);
                    const colsCount = Math.max(1, Math.ceil(count / 2));
                    
                    const availableWidth = 772 - 32;
                    const gap = 16;
                    const unitWidth = (availableWidth - (colsCount - 1) * gap) / colsCount;

                    const uX = 24 + 16 + colIndex * (unitWidth + gap);
                    const uY = isTop ? 32 : 268;
                    const uW = unitWidth;
                    const uH = 140;

                    const uId = 'unitId' in u ? u.unitId : u.unitCode;
                    const uArea = 'carpetAreaSqM' in u ? u.carpetAreaSqM : 120;
                    const uType = 'unitType' in u ? u.unitType : 'Residential';
                    
                    // Retrieve full owner name
                    let uOwnerName = 'ownerName' in u ? u.ownerName : '';
                    if (!uOwnerName) {
                      const matchedOwn = ownerships.find(
                        (o) =>
                          o.unitId === (u as Unit).id ||
                          o.unitCode === (u as Unit).unitCode ||
                          o.unitCode === uId ||
                          o.unitId === `unit-gen-${uId}`
                      );
                      uOwnerName = matchedOwn?.ownerName || '';
                    }

                    const isCurrentSelected = customUnitsData
                      ? currentActiveUnit?.unitId === uId
                      : selectedUnit?.unitCode === uId || selectedUnit?.id === (u as Unit).id;

                    const unitPalette = [
                      { fill: '#1e3a8a', stroke: '#60a5fa', text: '#93c5fd' },
                      { fill: '#064e3b', stroke: '#34d399', text: '#a7f3d0' },
                      { fill: '#581c87', stroke: '#c084fc', text: '#e9d5ff' },
                      { fill: '#701a75', stroke: '#f472b6', text: '#fbcfe8' },
                      { fill: '#7c2d12', stroke: '#fb923c', text: '#fed7aa' },
                    ];
                    const theme = unitPalette[idx % unitPalette.length];

                    return (
                      <g
                        key={uId}
                        onClick={() => {
                          if (customUnitsData) {
                            setSelectedCustomUnitId(uId);
                          } else {
                            setSelectedUnitId((u as Unit).id);
                          }
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Unit Box */}
                        <rect
                          x={uX}
                          y={uY}
                          width={uW}
                          height={uH}
                          rx="6"
                          fill={isCurrentSelected ? '#2563eb' : theme.fill}
                          fillOpacity={isCurrentSelected ? 0.85 : 0.4}
                          stroke={isCurrentSelected ? '#93c5fd' : theme.stroke}
                          strokeWidth={isCurrentSelected ? 3 : 1.5}
                        />

                        {/* Door Opening Indicator */}
                        <path
                          d={
                            isTop
                              ? `M ${uX + uW / 2 - 15} ${uY + uH} A 15 15 0 0 1 ${uX + uW / 2} ${uY + uH - 15}`
                              : `M ${uX + uW / 2 - 15} ${uY} A 15 15 0 0 0 ${uX + uW / 2} ${uY + 15}`
                          }
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />

                        {/* Unit Identifier */}
                        <text
                          x={uX + uW / 2}
                          y={uY + 36}
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          UNIT {uId}
                        </text>

                        {/* Area & Type */}
                        <text
                          x={uX + uW / 2}
                          y={uY + 58}
                          fill={theme.text}
                          fontSize="12"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {uArea.toFixed(1)} m² • {uType}
                        </text>

                        {/* Owner Full Name Badge */}
                        {uOwnerName && (
                          <g>
                            <rect
                              x={uX + 10}
                              y={uY + 76}
                              width={uW - 20}
                              height={24}
                              rx="4"
                              fill="#0f172a"
                              fillOpacity="0.75"
                              stroke="#334155"
                              strokeWidth="0.8"
                            />
                            <text
                              x={uX + uW / 2}
                              y={uY + 92}
                              fill="#f8fafc"
                              fontSize="11"
                              fontWeight="600"
                              textAnchor="middle"
                            >
                              👤 {uOwnerName}
                            </text>
                          </g>
                        )}

                        {/* 3D Spatial Tag */}
                        <text
                          x={uX + uW / 2}
                          y={uY + 120}
                          fill="#94a3b8"
                          fontSize="9.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          3D Spatial Unit Parcel
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 font-mono">
              <span>Standard ISO 19152 Floor Spatial Unit Segmentation</span>
              <span>Click any unit polygon to inspect full ownership records</span>
            </div>
          </div>

          {/* Unit Inspector Card */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Selected Cadastral Unit
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                    {currentActiveUnit?.unitId || 'Not Available'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {currentActiveUnit?.verificationStatus || 'Verified'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] font-medium">
                    3D ULPIN (Hierarchical Standard)
                  </span>
                  <p className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-blue-600 dark:text-blue-400 break-all select-all mt-1">
                    {calculated3DUlpin}
                  </p>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Unit Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentActiveUnit?.unitType || 'Not Available'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Carpet Area</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {currentActiveUnit?.carpetAreaSqM ? `${currentActiveUnit.carpetAreaSqM.toFixed(2)} m²` : 'Not Available'}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      ({currentActiveUnit?.areaSource || 'Imported from dataset'})
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Owner Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">
                    {currentActiveUnit?.ownerName || 'Not Available'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Deed/Reg No.</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {currentActiveUnit?.deedNumber || 'Not Available'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Floor Code</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {currentActiveUnit?.floor || 'Not Available'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Building ID</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {currentActiveUnit?.buildingId || 'Not Available'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => setIsPropertyCardOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Generate Digital Property Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* IMPORT PROPERTY / FLOOR DATA MODAL */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Import Property / Floor Dataset
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-slate-500">
                  Import CSV/Excel data or paste raw cadastral table rows. The system will use this imported dataset as the single source of truth for floors, units, areas, owner names, and 3D ULPIN generation.
                </p>

                {/* Upload File Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl text-center cursor-pointer bg-slate-50 dark:bg-slate-850"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Click to upload CSV / text file
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Format: BaseULPIN, BuildingId, Floor, UnitId, UnitType, AreaSqM, OwnerName, DeedNo, Status
                  </span>
                </div>

                {/* Or Paste CSV Text */}
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Or Paste CSV Data Directly
                  </label>
                  <textarea
                    rows={5}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={`Base ULPIN, Building ID, Floor, Unit ID, Unit Type, Area (sq.m), Owner Name, Document Ref, Verification Status
27101500984123, SB, F1, U101, 2BHK Luxury, 120.0, Rajesh Verma, MH-MUM-REG-2024-101, Verified
27101500984123, SB, F1, U102, 2BHK Executive, 110.0, Ananya Sharma, MH-MUM-REG-2024-102, Verified
27101500984123, SB, F2, U201, 3BHK Grand, 135.0, Vikramaditya Rao, MH-MUM-REG-2024-201, Verified
27101500984123, SB, F2, U202, 3BHK Grand, 130.0, Sunita Deshmukh, MH-MUM-REG-2024-202, Verified`}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleParseCsv(csvText)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                >
                  Apply Dataset
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
