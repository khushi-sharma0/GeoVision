import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Parcel,
  Building,
  Floor,
  Unit,
  OwnershipRecord,
  UndergroundUtility,
  OwnershipConflict,
  LayerVisibilityState,
} from '../types/cadastre';
import {
  INITIAL_PARCELS,
  INITIAL_BUILDINGS,
  INITIAL_FLOORS,
  INITIAL_UNITS,
  INITIAL_OWNERSHIPS,
  INITIAL_CONFLICTS,
  INITIAL_UTILITIES,
} from '../data/cadastreData';
import { generateULPIN } from '../utils/ulpinGenerator';

export type ActiveTab =
  | 'dashboard'
  | 'map2d'
  | 'viewer3d'
  | 'create'
  | 'properties'
  | 'explorer'
  | 'ai_analysis'
  | 'validation'
  | 'conflicts'
  | 'reports'
  | 'datasources'
  | 'settings'
  | 'report_boundary'
  | 'apply_correction';

interface CadastreContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  parcels: Parcel[];
  buildings: Building[];
  floors: Floor[];
  units: Unit[];
  ownerships: OwnershipRecord[];
  conflicts: OwnershipConflict[];
  utilities: UndergroundUtility[];

  selectedParcelId: string | null;
  selectedBuildingId: string | null;
  selectedFloorId: string | null;
  selectedUnitId: string | null;

  selectedParcel: Parcel | null;
  selectedBuilding: Building | null;
  selectedFloor: Floor | null;
  selectedUnit: Unit | null;
  selectedOwnership: OwnershipRecord | null;
  selectedConflict: OwnershipConflict | null;

  setSelectedParcelId: (id: string | null) => void;
  setSelectedBuildingId: (id: string | null) => void;
  setSelectedFloorId: (id: string | null) => void;
  setSelectedUnitId: (id: string | null) => void;
  selectProperty: (parcelId: string) => void;
  clearPropertySelection: () => void;
  selectUnitByCode: (code: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;

  layers: LayerVisibilityState;
  toggleLayer: (layerKey: keyof LayerVisibilityState) => void;

  isPropertyCardOpen: boolean;
  setIsPropertyCardOpen: (open: boolean) => void;
  isDocsModalOpen: boolean;
  setIsDocsModalOpen: (open: boolean) => void;
  isFloorPlanModalOpen: boolean;
  setIsFloorPlanModalOpen: (open: boolean) => void;

  isReportBoundaryOpen: boolean;
  setIsReportBoundaryOpen: (open: boolean) => void;
  isCorrectionModalOpen: boolean;
  setIsCorrectionModalOpen: (open: boolean) => void;

  addNewProperty: (payload: any) => string;
  resolveConflict: (conflictId: string, resolutionAction: string) => void;
}

const DEFAULT_LAYERS: LayerVisibilityState = {
  parcelBoundary: true,
  roads: true,
  buildings2D: true,
  buildings3D: true,
  dem: false,
  dsm: false,
  lidar: false,
  utilities: true,
  undergroundInfra: true,
  waterPipeline: true,
  sewerLine: true,
  electricCable: true,
  stormWater: true,
  gasPipeline: true,
  cadastralLabels: true,
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

const CadastreContext = createContext<CadastreContextType | undefined>(undefined);

export const CadastreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('geovision_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  const [activeTabState, setActiveTabState] = useState<ActiveTab>('viewer3d');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [parcels, setParcels] = useState<Parcel[]>(() => loadFromStorage('geovision_parcels', INITIAL_PARCELS));
  const [buildings, setBuildings] = useState<Building[]>(() => loadFromStorage('geovision_buildings', INITIAL_BUILDINGS));
  const [floors, setFloors] = useState<Floor[]>(() => loadFromStorage('geovision_floors', INITIAL_FLOORS));
  const [units, setUnits] = useState<Unit[]>(() => loadFromStorage('geovision_units', INITIAL_UNITS));
  const [ownerships, setOwnerships] = useState<OwnershipRecord[]>(() => loadFromStorage('geovision_ownerships', INITIAL_OWNERSHIPS));
  const [conflicts, setConflicts] = useState<OwnershipConflict[]>(() => loadFromStorage('geovision_conflicts', INITIAL_CONFLICTS));
  const [utilities] = useState<UndergroundUtility[]>(INITIAL_UTILITIES);

  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(() => loadFromStorage('geovision_selected_parcel_id', null));
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layers, setLayers] = useState<LayerVisibilityState>(DEFAULT_LAYERS);

  const [isPropertyCardOpen, setIsPropertyCardOpen] = useState<boolean>(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState<boolean>(false);
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState<boolean>(false);

  const [isReportBoundaryOpen, setIsReportBoundaryOpen] = useState<boolean>(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState<boolean>(false);

  const setActiveTab = (tab: ActiveTab) => {
    if (tab === 'report_boundary') {
      setIsReportBoundaryOpen(true);
      return;
    }
    if (tab === 'apply_correction') {
      setIsCorrectionModalOpen(true);
      return;
    }
    setActiveTabState(tab);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('geovision_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('geovision_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => { localStorage.setItem('geovision_parcels', JSON.stringify(parcels)); }, [parcels]);
  useEffect(() => { localStorage.setItem('geovision_buildings', JSON.stringify(buildings)); }, [buildings]);
  useEffect(() => { localStorage.setItem('geovision_floors', JSON.stringify(floors)); }, [floors]);
  useEffect(() => { localStorage.setItem('geovision_units', JSON.stringify(units)); }, [units]);
  useEffect(() => { localStorage.setItem('geovision_ownerships', JSON.stringify(ownerships)); }, [ownerships]);
  useEffect(() => { localStorage.setItem('geovision_conflicts', JSON.stringify(conflicts)); }, [conflicts]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setTheme = (dark: boolean) => setIsDark(dark);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const toggleLayer = (layerKey: keyof LayerVisibilityState) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const selectProperty = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    const bldg = buildings.find((b) => b.parcelId === parcelId);
    if (bldg) {
      setSelectedBuildingId(bldg.id);
      const bFloors = floors.filter((f) => f.buildingId === bldg.id);
      if (bFloors.length > 0) {
        const targetFloor = bFloors.find((f) => f.floorCode === 'F3') || bFloors[0];
        setSelectedFloorId(targetFloor.id);
        const fUnits = units.filter((u) => u.floorId === targetFloor.id);
        if (fUnits.length > 0) setSelectedUnitId(fUnits[0].id);
      }
    }
  };

  const clearPropertySelection = () => {
    setSelectedParcelId(null);
    setSelectedBuildingId(null);
    setSelectedFloorId(null);
    setSelectedUnitId(null);
  };

  const selectedParcel = selectedParcelId ? parcels.find((p) => p.id === selectedParcelId) || null : null;
  const selectedBuilding = selectedBuildingId ? buildings.find((b) => b.id === selectedBuildingId) || null : null;
  const selectedFloor = selectedFloorId && selectedBuilding ? floors.find((f) => f.id === selectedFloorId && f.buildingId === selectedBuilding.id) || null : null;
  const selectedUnit = selectedUnitId && selectedFloor ? units.find((u) => u.id === selectedUnitId && u.floorId === selectedFloor.id) || null : null;
  const selectedOwnership = selectedUnit ? ownerships.find((o) => o.unitId === selectedUnit.id) || null : null;
  const selectedConflict = selectedUnit ? conflicts.find((c) => c.unitId === selectedUnit.id) || null : null;

  const selectUnitByCode = (code: string) => {
    const found = units.find(
      (u) => u.unitCode.toLowerCase() === code.toLowerCase() || u.full3DULPIN.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      setSelectedUnitId(found.id);
      setSelectedFloorId(found.floorId);
      setSelectedBuildingId(found.buildingId);
      const bldg = buildings.find((b) => b.id === found.buildingId);
      if (bldg) setSelectedParcelId(bldg.parcelId);
    }
  };

  const performSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const unitMatch = units.find(
      (u) => u.full3DULPIN.toLowerCase().includes(q) || u.unitCode.toLowerCase().includes(q)
    );
    if (unitMatch) {
      setSelectedUnitId(unitMatch.id);
      setSelectedFloorId(unitMatch.floorId);
      setSelectedBuildingId(unitMatch.buildingId);
      const bldg = buildings.find((b) => b.id === unitMatch.buildingId);
      if (bldg) setSelectedParcelId(bldg.parcelId);
      setActiveTabState('viewer3d');
    }
  };

  const addNewProperty = (payload: any): string => {
    return 'parcel-new';
  };

  const resolveConflict = (conflictId: string, resolutionAction: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: 'Resolved', resolutionAction } : c))
    );
  };

  return (
    <CadastreContext.Provider
      value={{
        isDark,
        toggleTheme,
        setTheme,
        activeTab: activeTabState,
        setActiveTab,
        isSidebarCollapsed,
        toggleSidebar,
        parcels,
        buildings,
        floors,
        units,
        ownerships,
        conflicts,
        utilities,
        selectedParcelId,
        selectedBuildingId,
        selectedFloorId,
        selectedUnitId,
        selectedParcel,
        selectedBuilding,
        selectedFloor,
        selectedUnit,
        selectedOwnership,
        selectedConflict,
        setSelectedParcelId,
        setSelectedBuildingId,
        setSelectedFloorId,
        setSelectedUnitId,
        selectProperty,
        clearPropertySelection,
        selectUnitByCode,
        searchQuery,
        setSearchQuery,
        performSearch,
        layers,
        toggleLayer,
        isPropertyCardOpen,
        setIsPropertyCardOpen,
        isDocsModalOpen,
        setIsDocsModalOpen,
        isFloorPlanModalOpen,
        setIsFloorPlanModalOpen,
        isReportBoundaryOpen,
        setIsReportBoundaryOpen,
        isCorrectionModalOpen,
        setIsCorrectionModalOpen,
        addNewProperty,
        resolveConflict,
      }}
    >
      {children}
    </CadastreContext.Provider>
  );
};

export const useCadastre = () => {
  const context = useContext(CadastreContext);
  if (!context) throw new Error('useCadastre must be used within a CadastreProvider');
  return context;
};