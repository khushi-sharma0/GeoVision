import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import { generateBuildingUtilities } from '../utils/pipelineGenerator';

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
  | 'settings';

interface CadastreContextType {
  // Theme
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;

  // Active view
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Data Collections
  parcels: Parcel[];
  buildings: Building[];
  floors: Floor[];
  units: Unit[];
  ownerships: OwnershipRecord[];
  conflicts: OwnershipConflict[];
  utilities: UndergroundUtility[];

  // Selections
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

  // Selection Setters
  setSelectedParcelId: (id: string | null) => void;
  setSelectedBuildingId: (id: string | null) => void;
  setSelectedFloorId: (id: string | null) => void;
  setSelectedUnitId: (id: string | null) => void;
  selectProperty: (parcelId: string) => void;
  clearPropertySelection: () => void;
  selectUnitByCode: (code: string) => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;

  // Layers
  layers: LayerVisibilityState;
  toggleLayer: (layerKey: keyof LayerVisibilityState) => void;

  // Modals
  isPropertyCardOpen: boolean;
  setIsPropertyCardOpen: (open: boolean) => void;
  isDocsModalOpen: boolean;
  setIsDocsModalOpen: (open: boolean) => void;
  isFloorPlanModalOpen: boolean;
  setIsFloorPlanModalOpen: (open: boolean) => void;

  // Mutators
  addNewProperty: (payload: {
    parcel: Partial<Parcel>;
    building: Partial<Building>;
    floorsCount: number;
    unitCountPerFloor: number;
    customUnits?: Unit[];
    customOwnerships?: OwnershipRecord[];
    customFloors?: Floor[];
  }) => string;
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

const CadastreContext = createContext<CadastreContextType | undefined>(undefined);

function generatePreciseParcelGeoJSON(lat: number, lng: number, areaSqM: number) {
  const sideMeters = Math.sqrt(areaSqM > 0 ? areaSqM : 1250);
  const halfSide = sideMeters / 2.0;
  const deltaLat = halfSide / 111320.0;
  const deltaLng = halfSide / (111320.0 * Math.cos((lat * Math.PI) / 180.0));

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [Number((lng - deltaLng).toFixed(6)), Number((lat - deltaLat).toFixed(6))],
          [Number((lng + deltaLng).toFixed(6)), Number((lat - deltaLat).toFixed(6))],
          [Number((lng + deltaLng).toFixed(6)), Number((lat + deltaLat).toFixed(6))],
          [Number((lng - deltaLng).toFixed(6)), Number((lat + deltaLat).toFixed(6))],
          [Number((lng - deltaLng).toFixed(6)), Number((lat - deltaLat).toFixed(6))],
        ],
      ],
    },
    properties: {},
  };
}

export const CadastreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('geovision_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Core Data State
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [floors, setFloors] = useState<Floor[]>(INITIAL_FLOORS);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [ownerships, setOwnerships] = useState<OwnershipRecord[]>(INITIAL_OWNERSHIPS);
  const [conflicts, setConflicts] = useState<OwnershipConflict[]>(INITIAL_CONFLICTS);

  // Selections
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layers, setLayers] = useState<LayerVisibilityState>(DEFAULT_LAYERS);

  // Modals
  const [isPropertyCardOpen, setIsPropertyCardOpen] = useState<boolean>(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState<boolean>(false);
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState<boolean>(false);

  // Sync theme class with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('geovision_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('geovision_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setTheme = (dark: boolean) => setIsDark(dark);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const toggleLayer = (layerKey: keyof LayerVisibilityState) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  // Helper to select a property by parcel ID
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
        setSelectedUnitId(fUnits.length > 0 ? fUnits[0].id : null);
      } else {
        setSelectedFloorId(null);
        setSelectedUnitId(null);
      }
    } else {
      setSelectedBuildingId(null);
      setSelectedFloorId(null);
      setSelectedUnitId(null);
    }
  };

  const clearPropertySelection = () => {
    setSelectedParcelId(null);
    setSelectedBuildingId(null);
    setSelectedFloorId(null);
    setSelectedUnitId(null);
  };

  // Derived entities
  const selectedParcel = selectedParcelId ? parcels.find((p) => p.id === selectedParcelId) || null : null;
  const selectedBuilding = selectedBuildingId ? buildings.find((b) => b.id === selectedBuildingId) || null : null;
  const selectedFloor =
    selectedFloorId && selectedBuilding
      ? floors.find((f) => f.id === selectedFloorId && f.buildingId === selectedBuilding.id) ||
        floors.find((f) => f.buildingId === selectedBuilding.id) || null
      : selectedBuilding ? floors.find((f) => f.buildingId === selectedBuilding.id) || null : null;

  const selectedUnit =
    selectedUnitId && selectedFloor
      ? units.find((u) => u.id === selectedUnitId && u.floorId === selectedFloor.id) ||
        units.find((u) => u.floorId === selectedFloor.id) || null
      : selectedFloor ? units.find((u) => u.floorId === selectedFloor.id) || null : null;

  const selectedOwnership = selectedUnit ? ownerships.find((o) => o.unitId === selectedUnit.id) || null : null;
  const selectedConflict = selectedUnit ? conflicts.find((c) => c.unitId === selectedUnit.id) || null : null;

  // DYNAMIC UTILITIES: Generate building-specific pipelines whenever selected building changes
  const utilities = useMemo<UndergroundUtility[]>(() => {
    if (selectedBuilding) {
      return generateBuildingUtilities(selectedBuilding);
    }
    return INITIAL_UTILITIES;
  }, [selectedBuilding]);

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
      setActiveTab('viewer3d');
      return;
    }

    const ownerMatch = ownerships.find((o) => o.ownerName.toLowerCase().includes(q));
    if (ownerMatch) {
      const u = units.find((un) => un.id === ownerMatch.unitId);
      if (u) {
        setSelectedUnitId(u.id);
        setSelectedFloorId(u.floorId);
        setSelectedBuildingId(u.buildingId);
        const bldg = buildings.find((b) => b.id === u.buildingId);
        if (bldg) setSelectedParcelId(bldg.parcelId);
        setActiveTab('viewer3d');
        return;
      }
    }

    const parcelMatch = parcels.find(
      (p) =>
        p.ulpin.toLowerCase().includes(q) ||
        p.localParcelId.toLowerCase().includes(q) ||
        p.locationName.toLowerCase().includes(q)
    );
    if (parcelMatch) {
      setSelectedParcelId(parcelMatch.id);
      const bldg = buildings.find((b) => b.parcelId === parcelMatch.id);
      if (bldg) {
        setSelectedBuildingId(bldg.id);
        const bldgFloors = floors.filter((f) => f.buildingId === bldg.id);
        if (bldgFloors.length > 0) {
          const targetFloor = bldgFloors.find((f) => f.floorCode === 'F3') || bldgFloors[0];
          setSelectedFloorId(targetFloor.id);
          const fUnits = units.filter((u) => u.floorId === targetFloor.id);
          if (fUnits.length > 0) setSelectedUnitId(fUnits[0].id);
        }
      }
      setActiveTab('viewer3d');
    }
  };

  const addNewProperty = (payload: {
    parcel: Partial<Parcel>;
    building: Partial<Building>;
    floorsCount: number;
    unitCountPerFloor: number;
    customUnits?: Unit[];
    customOwnerships?: OwnershipRecord[];
    customFloors?: Floor[];
  }): string => {
    const newParcelId = `parcel-${Date.now()}`;
    const newBldgId = `bldg-${Date.now()}`;
    const newUlpin = payload.parcel.ulpin || `27101500${Math.floor(100000 + Math.random() * 900000)}`;
    const bldgCode = payload.building.buildingCode || 'BD';

    const newParcel: Parcel = {
      id: newParcelId,
      ulpin: newUlpin,
      localParcelId: payload.parcel.localParcelId || `P-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      locationName: payload.parcel.locationName || 'Worli, Mumbai, Maharashtra',
      city: payload.parcel.city || 'Mumbai',
      latitude: payload.parcel.latitude || 19.0178,
      longitude: payload.parcel.longitude || 72.8178,
      areaSqM: payload.parcel.areaSqM || 1400.0,
      landUse: payload.parcel.landUse || 'Residential',
      buildingCount: 1,
      status: 'Verified',
      crs: 'EPSG:4326 - WGS84',
      surveyNumber: payload.parcel.surveyNumber || 'CS No. 92/1',
      village: payload.parcel.village || 'Worli',
      taluk: payload.parcel.taluk || 'Mumbai City',
      district: payload.parcel.district || 'Mumbai',
      boundaryGeoJSON:
        payload.parcel.boundaryGeoJSON ||
        generatePreciseParcelGeoJSON(
          payload.parcel.latitude || 19.0178,
          payload.parcel.longitude || 72.8178,
          payload.parcel.areaSqM || 1400.0
        ),
    };

    const newBuilding: Building = {
      id: newBldgId,
      parcelId: newParcelId,
      buildingCode: bldgCode,
      buildingName: payload.building.buildingName || `Nova Tower - Block ${bldgCode}`,
      city: payload.parcel.city || 'Mumbai',
      location: payload.parcel.locationName || 'Worli, Mumbai',
      buildingType: payload.building.buildingType || 'High-Rise Residential Tower',
      numberOfFloors: payload.floorsCount || 6,
      numberOfBasements: payload.building.numberOfBasements || 2,
      floorHeightM: payload.building.floorHeightM || 3.0,
      buildingHeightM: (payload.floorsCount || 6) * (payload.building.floorHeightM || 3.0),
      footprintAreaSqM: payload.parcel.areaSqM ? payload.parcel.areaSqM * 0.65 : 850.0,
      yearBuilt: 2024,
      structureType: 'RCC Framed Multi-Storey',
    };

    let generatedFloors: Floor[] = [];
    let generatedUnits: Unit[] = [];
    let generatedOwnerships: OwnershipRecord[] = [];

    if (payload.customUnits && payload.customUnits.length > 0) {
      generatedUnits = payload.customUnits.map((u) => ({
        ...u,
        buildingId: newBldgId,
        buildingCode: bldgCode,
        parentParcelULPIN: newUlpin,
      }));

      if (payload.customOwnerships) generatedOwnerships = payload.customOwnerships;

      if (payload.customFloors && payload.customFloors.length > 0) {
        generatedFloors = payload.customFloors.map((f) => ({
          ...f,
          buildingId: newBldgId,
          buildingCode: bldgCode,
        }));
      }
    } else {
      const floorCount = payload.floorsCount || 6;
      for (let f = 1; f <= floorCount; f++) {
        const floorId = `floor-${newBldgId}-${f}`;
        const fCode = `F${f}`;
        const floorArea = 820.0;

        generatedFloors.push({
          id: floorId,
          buildingId: newBldgId,
          buildingCode: bldgCode,
          floorCode: fCode,
          floorName: `${f}th Floor - Residential`,
          floorIndex: f,
          zLevelM: f * 3.0,
          totalFloorAreaSqM: floorArea,
          measuredUnitAreaSumSqM: floorArea,
          validationStatus: 'VALID',
          unitCount: payload.unitCountPerFloor || 4,
          colorHex: f % 2 === 0 ? '#3b82f6' : '#22c55e',
        });

        for (let u = 1; u <= (payload.unitCountPerFloor || 4); u++) {
          const unitId = `unit-${newBldgId}-${f}-${u}`;
          const unitNum = `${f}0${u}`;
          const unitCode = `${fCode}-${unitNum}`;
          const fullUlpin = generateULPIN(newUlpin, bldgCode, fCode, `U0${u}`);
          const carpet = 120.0;

          generatedUnits.push({
            id: unitId,
            unitNumber: unitNum,
            unitCode: unitCode,
            buildingId: newBldgId,
            buildingCode: bldgCode,
            floorId: floorId,
            floorCode: fCode,
            full3DULPIN: fullUlpin,
            parentParcelULPIN: newUlpin,
            unitType: u % 2 === 0 ? '3BHK Executive' : '2BHK Luxury',
            carpetAreaSqM: carpet,
            builtUpAreaSqM: carpet * 1.12,
            usage: 'Residential',
            sharePercentageOfLand: +(100 / (floorCount * 4)).toFixed(2),
            status: 'Verified',
            colorHex: '#3b82f6',
            relativeBounds: {
              x: (u - 1) % 2 === 0 ? 0.05 : 0.52,
              y: u > 2 ? 0.52 : 0.05,
              w: 0.43,
              d: 0.43,
            },
            polygon: [[10, 10], [90, 10], [90, 90], [10, 90]],
          });

          const oName = `Owner ${f}-${u}`;
          generatedOwnerships.push({
            id: `own-${unitId}`,
            unitId: unitId,
            unitCode: unitCode,
            ownerName: oName,
            ownerType: 'Individual',
            ownershipPercentage: 100,
            ownershipType: 'Freehold',
            docRefNo: `DOC-2024-MH-${Math.floor(10000 + Math.random() * 90000)}`,
            registrationDate: '2024-08-15',
            verificationStatus: 'Verified',
            contactEmail: `${oName.toLowerCase().replace(/\s+/g, '.')}@cadastre.gov.in`,
            nationalIdMasked: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
            mortgageStatus: 'None',
          });
        }
      }
    }

    setParcels((prev) => [newParcel, ...prev]);
    setBuildings((prev) => [newBuilding, ...prev]);
    setFloors((prev) => [...generatedFloors, ...prev]);
    setUnits((prev) => [...generatedUnits, ...prev]);
    setOwnerships((prev) => [...generatedOwnerships, ...prev]);

    setSelectedParcelId(newParcelId);
    setSelectedBuildingId(newBldgId);
    if (generatedFloors.length > 0) setSelectedFloorId(generatedFloors[0].id);
    if (generatedUnits.length > 0) setSelectedUnitId(generatedUnits[0].id);

    return newParcelId;
  };

  const resolveConflict = (conflictId: string, resolutionAction: string) => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId
          ? { ...c, status: 'Resolved', resolutionAction }
          : c
      )
    );
  };

  return (
    <CadastreContext.Provider
      value={{
        isDark,
        toggleTheme,
        setTheme,
        activeTab,
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
  if (!context) {
    throw new Error('useCadastre must be used within a CadastreProvider');
  }
  return context;
};