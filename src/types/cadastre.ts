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
  unitType: string;
  carpetAreaSqM: number;
  builtUpAreaSqM: number;
  usage: 'Residential' | 'Commercial' | 'Utility' | 'Common Area';
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
  buildingId?: string;
  parcelId?: string;
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
}

export function generateULPIN(
  parcelULPIN: string,
  buildingCode: string,
  floorCode: string,
  unitCode: string
): string {
  const cleanFloor = floorCode.startsWith('F') ? floorCode : `F${floorCode}`;
  const cleanUnit = unitCode.startsWith('U') ? unitCode : `U${unitCode}`;
  return `${parcelULPIN}-${buildingCode.toUpperCase()}-${cleanFloor}-${cleanUnit}`;
}