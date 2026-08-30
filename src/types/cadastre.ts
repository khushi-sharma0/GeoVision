export type LandUseType = 
  | 'Residential' 
  | 'Commercial' 
  | 'Industrial' 
  | 'Mixed Use' 
  | 'Institutional' 
  | 'Special Economic Zone'
  | 'Other';

export type OwnershipType = 'Freehold' | 'Leasehold' | 'Condominium Deed' | 'Government Allocation' | 'Joint Tenancy';
export type OwnerCategory = 'Individual' | 'Joint' | 'Corporate' | 'Government' | 'Trust';
export type VerificationStatus = 'Verified' | 'Pending' | 'Flagged' | 'Draft' | 'Conflict';
export type ConflictSeverity = 'High' | 'Medium' | 'Low';

export interface Parcel {
  id: string;
  ulpin: string;
  localParcelId: string;
  locationName: string;
  city?: string;
  latitude: number;
  longitude: number;
  areaSqM: number;
  landUse: LandUseType;
  buildingCount: number;
  status: VerificationStatus;
  crs: string;
  surveyNumber: string;
  village: string;
  taluk: string;
  district: string;
  boundaryGeoJSON: {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: Record<string, any>;
  };
}

export interface Building {
  id: string;
  parcelId: string;
  buildingCode: string;
  buildingName: string;
  city?: string;
  location?: string;
  buildingType?: string;
  numberOfFloors: number;
  numberOfBasements: number;
  floorHeightM: number;
  buildingHeightM: number;
  footprintAreaSqM: number;
  yearBuilt: number;
  structureType: string;
  footprintGeoJSON?: any;
  
  // 3D Extensions
  parkingSpacesCount?: number;
  elevatedStructuresCount?: number;
  undergroundSpacesCount?: number;
  utilityTunnelsCount?: number;
}

export interface Floor {
  id: string;
  buildingId: string;
  buildingCode: string;
  floorCode: string;
  floorName: string;
  floorIndex: number;
  zLevelM: number;
  totalFloorAreaSqM: number;
  measuredUnitAreaSumSqM: number;
  validationStatus: 'VALID' | 'AREA_MISMATCH' | 'TOPOLOGY_ERROR' | 'UNVERIFIED';
  validationMessage?: string;
  unitCount: number;
  colorHex: string;
  isBasement?: boolean;
  isElevated?: boolean;
  usageType?: 'Residential' | 'Commercial' | 'Basement Parking' | 'Elevated Structure' | 'Underground Storage' | 'Utility Tunnel' | string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  unitCode: string;
  buildingId: string;
  buildingCode: string;
  floorId: string;
  floorCode: string;
  full3DULPIN: string;
  parentParcelULPIN: string;
  unitType: '2BHK' | '3BHK' | 'Penthouse' | 'Commercial Studio' | 'Parking Space' | 'Elevated Structure' | 'Underground Storage Vault' | 'Utility Room' | string;
  carpetAreaSqM: number;
  builtUpAreaSqM: number;
  usage: 'Residential' | 'Commercial' | 'Utility' | 'Common Area' | 'Parking' | 'Elevated Facility' | 'Subterranean Vault' | string;
  sharePercentageOfLand: number;
  status: VerificationStatus;
  colorHex: string;
  
  relativeBounds: {
    x: number;
    y: number;
    w: number;
    d: number;
  };
  polygon: [number, number][];
  rooms?: Array<{ name: string; areaSqM: number }>;

  // Specialized attributes for parking, elevated & underground structures
  parkingSlotNo?: string;
  vehicleType?: '4-Wheeler SUV' | '4-Wheeler Sedan' | '2-Wheeler' | 'EV Charging Slot' | string;
  elevatedStructureType?: 'Elevator Machine Tower' | 'Overhead Water Tank' | 'Rooftop Solar Array' | 'Rooftop Helipad / Skydeck' | 'Skywalk Bridge' | string;
  undergroundSpaceType?: 'Subterranean Storage Vault' | 'Sump Tank & Water Pump Room' | 'Electrical Transformer Substation' | 'Utility Tunnel Shaft' | string;
}

export interface ParkingSpace {
  id: string;
  slotNumber: string;
  basementLevel: string;
  vehicleType: string;
  areaSqM: number;
  assignedUnitId?: string;
  full3DULPIN: string;
}

export interface ElevatedStructure {
  id: string;
  name: string;
  type: string;
  elevationHeightM: number;
  footprintAreaSqM: number;
  full3DULPIN: string;
}

export interface UndergroundSpace {
  id: string;
  name: string;
  depthM: number;
  volumeCuM: number;
  full3DULPIN: string;
}

export interface UtilityTunnel {
  id: string;
  tunnelCode: string;
  depthM: number;
  lengthM: number;
  conduitTypes: string[];
  full3DULPIN: string;
}

export interface OwnershipRecord {
  id: string;
  unitId: string;
  unitCode: string;
  ownerName: string;
  ownerType: OwnerCategory;
  ownershipPercentage: number;
  ownershipType: OwnershipType;
  docRefNo: string;
  registrationDate: string;
  verificationStatus: VerificationStatus;
  contactEmail: string;
  nationalIdMasked: string;
  mortgageStatus: 'None' | 'Active Lien - State Bank' | 'Active Lien - HDFC Bank' | 'Active Lien - ICICI Bank' | 'Cleared' | string;
  notes?: string;
}

export interface UndergroundUtility {
  id: string;
  type: 'Water Pipeline' | 'Sewer Line' | 'Electric Cable' | 'Storm Water Drain' | 'Gas Pipeline';
  name: string;
  depthM: number;
  diameterMm: number;
  material: string;
  colorHex: string;
  coordinates: [number, number, number][];
  status: 'Active' | 'Planned' | 'Maintenance';
}

export interface OwnershipConflict {
  id: string;
  unitId: string;
  unitCode: string;
  buildingName: string;
  parentULPIN: string;
  unit3DULPIN: string;
  severity: ConflictSeverity;
  issueType: 'Multiple Ownership Records' | 'Area Discrepancy' | 'Missing Deed Document' | 'Duplicate ULPIN Hash' | 'Boundary Overlap';
  description: string;
  conflictingParties: string[];
  docRefNumbers: string[];
  reportedDate: string;
  status: 'Open' | 'Under Investigation' | 'Resolved';
  resolutionAction?: string;
}

export interface AISegmentationResult {
  floorId: string;
  confidence: number;
  detectedUnitsCount: number;
  processingTimeSeconds: number;
  modelName: string;
  status: 'Completed' | 'Processing' | 'Failed';
  units: Array<{
    unitId: string;
    unitType: string;
    areaSqM: number;
    confidence: number;
    polygon: [number, number][];
    rooms: Array<{ name: string; areaSqM: number }>;
  }>;
}

export interface LayerVisibilityState {
  parcelBoundary: boolean;
  roads: boolean;
  buildings2D: boolean;
  buildings3D: boolean;
  dem: boolean;
  dsm: boolean;
  lidar: boolean;
  utilities: boolean;
  undergroundInfra: boolean;
  waterPipeline: boolean;
  sewerLine: boolean;
  electricCable: boolean;
  stormWater: boolean;
  gasPipeline: boolean;
  cadastralLabels: boolean;
  
  // 3D Extension Layers
  parkingSpaces: boolean;
  elevatedStructures: boolean;
  undergroundSpaces: boolean;
  utilityTunnels: boolean;
}

export function generateULPIN(
  parcelULPIN: string,
  buildingCode: string,
  floorCode: string,
  unitCode: string
): string {
  const cleanFloor = floorCode.startsWith('F') || floorCode.startsWith('B') || floorCode.startsWith('TER') || floorCode.startsWith('E') ? floorCode : `F${floorCode}`;
  const cleanUnit = unitCode.startsWith('U') || unitCode.startsWith('P') || unitCode.startsWith('E') || unitCode.startsWith('V') || unitCode.startsWith('T') ? unitCode : `U${unitCode}`;
  return `${parcelULPIN}-${buildingCode.toUpperCase()}-${cleanFloor}-${cleanUnit}`;
}