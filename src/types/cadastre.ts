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
  ulpin: string; // 14-digit / alphanumeric standard 2D ULPIN, e.g., '27101500123456' or 'KA-BLR-2024-0001-0001'
  localParcelId: string; // e.g., 'P-2024-0001'
  locationName: string; // e.g., 'Worli, Mumbai, Maharashtra'
  city?: string; // e.g., 'Mumbai', 'Pune', 'Nagpur'
  latitude: number;
  longitude: number;
  areaSqM: number; // e.g., 1250.00
  landUse: LandUseType;
  buildingCount: number;
  status: VerificationStatus;
  crs: string; // 'EPSG:4326 - WGS84'
  surveyNumber: string; // 'Sy. No. 44/2B'
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
  buildingCode: string; // 'BA', 'BB', 'BC'
  buildingName: string; // 'Harbour Heights'
  city?: string;
  location?: string;
  buildingType?: string; // 'Luxury Apartment Tower', 'High-Rise Residential Tower', etc.
  numberOfFloors: number; // 6 above ground + terrace
  numberOfBasements: number; // 2
  floorHeightM: number; // 3.00
  buildingHeightM: number; // 24.00
  footprintAreaSqM: number; // 820.00
  yearBuilt: number;
  structureType: string; // 'RCC Framed Multi-Storey'
  footprintGeoJSON?: any;
}

export interface Floor {
  id: string;
  buildingId: string;
  buildingCode: string;
  floorCode: string; // 'Terrace', 'F5', 'F4', 'F3', 'F2', 'F1', 'GF', 'B1', 'B2'
  floorName: string; // '3rd Floor', 'Ground Floor', 'Basement 1'
  floorIndex: number; // -2 to 6
  zLevelM: number; // elevation offset in meters
  totalFloorAreaSqM: number; // e.g., 820.00
  measuredUnitAreaSumSqM: number; // sum of units
  validationStatus: 'VALID' | 'AREA_MISMATCH' | 'TOPOLOGY_ERROR' | 'UNVERIFIED';
  validationMessage?: string;
  unitCount: number;
  colorHex: string;
}

export interface Unit {
  id: string;
  unitNumber: string; // '301', '302', '303'
  unitCode: string; // 'F3-301'
  buildingId: string;
  buildingCode: string;
  floorId: string;
  floorCode: string;
  full3DULPIN: string; // '27101500123456-BA-F3-U03' or 'KA-BLR-2024-0001-0001-F3-303'
  parentParcelULPIN: string;
  unitType: string; // '2BHK', '3BHK', 'Penthouse', 'Commercial Studio'
  carpetAreaSqM: number; // 130.00
  builtUpAreaSqM: number; // 142.50
  usage: 'Residential' | 'Commercial' | 'Utility' | 'Common Area';
  sharePercentageOfLand: number; // undivided share of land (UDS) e.g., 4.16%
  status: VerificationStatus;
  colorHex: string;
  
  // 3D relative positioning within floor envelope
  relativeBounds: {
    x: number;
    y: number;
    w: number;
    d: number;
  };
  // 2D floorplan polygon vertices (0-100% normalized)
  polygon: [number, number][];
  rooms?: Array<{ name: string; areaSqM: number }>;
}

export interface OwnershipRecord {
  id: string;
  unitId: string;
  unitCode: string;
  ownerName: string;
  ownerType: OwnerCategory;
  ownershipPercentage: number; // e.g., 100
  ownershipType: OwnershipType;
  docRefNo: string; // 'DOC-2023-KA-8891'
  registrationDate: string; // '2023-04-15'
  verificationStatus: VerificationStatus;
  contactEmail: string;
  nationalIdMasked: string; // 'XXXX-XXXX-4912'
  mortgageStatus: 'None' | 'Active Lien - State Bank' | 'Active Lien - HDFC Bank' | 'Active Lien - ICICI Bank' | 'Cleared' | string;
  notes?: string;
}

export interface UndergroundUtility {
  id: string;
  type: 'Water Pipeline' | 'Sewer Line' | 'Electric Cable' | 'Storm Water Drain' | 'Gas Pipeline';
  name: string;
  depthM: number; // negative value, e.g. -2.5
  diameterMm: number;
  material: string;
  colorHex: string;
  coordinates: [number, number, number][]; // 3D path
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

