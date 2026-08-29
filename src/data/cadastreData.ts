import {
  Parcel,
  Building,
  Floor,
  Unit,
  OwnershipRecord,
  UndergroundUtility,
  OwnershipConflict,
  AISegmentationResult,
} from '../types/cadastre';
import { generateULPIN } from '../utils/ulpinGenerator';

// Synthetic Owner Names
const SYNTHETIC_OWNER_NAMES = [
  'Vikram Singh',
  'Sunita Godbole',
  'Aarav Mehta',
  'Pooja Hegde',
  'Rohan Deshmukh',
  'Diya Kapoor',
  'Sameer Khan',
  'Ananya Shah',
  'Karan Malhotra',
  'Priya Nair',
  'Vivaan Patel',
  'Isha Verma',
  'Reyansh Desai',
  'Meera Kulkarni',
  'Aditya Sharma',
  'Sneha Reddy',
  'Nikhil Gokhale',
  'Tanvi Salunkhe',
  'Kabir Joshi',
  'Riddhi Sawant',
  'Siddharth Patil',
  'Kavita Iyer',
  'Rahul Sen',
  'Neha Bhatia',
  'Arjun Chawla',
  'Shruti Mahajan',
  'Manish Tiwari',
  'Deepa Sundaram',
];

interface RawBuildingConfig {
  parcelId: string;
  ulpin: string;
  localParcelId: string;
  locationName: string;
  city: string;
  lat: number;
  lng: number;
  areaSqM: number;
  landUse: 'Residential' | 'Commercial' | 'Mixed Use';
  surveyNumber: string;
  village: string;
  taluk: string;
  district: string;
  buildingId: string;
  buildingCode: string;
  buildingName: string;
  buildingType: string;
  floorsCount: number;
  basementsCount: number;
  floorHeightM: number;
  footprintAreaSqM: number;
  yearBuilt: number;
  structureType: string;
  unitsPerFloor: number;
}

// Exactly 3 Distinct Properties (Mumbai, Pune, Nagpur)
const RAW_PROPERTIES: RawBuildingConfig[] = [
  // 1. Mumbai - Worli
  {
    parcelId: 'parcel-1',
    ulpin: '27101500123456',
    localParcelId: 'MUM-WOR-0001',
    locationName: 'Dr. Annie Besant Road, Worli, Mumbai',
    city: 'Mumbai',
    lat: 19.0178,
    lng: 72.8178,
    areaSqM: 1450.0,
    landUse: 'Residential',
    surveyNumber: 'CS No. 44/2A',
    village: 'Worli',
    taluk: 'Mumbai City',
    district: 'Mumbai',
    buildingId: 'bldg-1',
    buildingCode: 'BA',
    buildingName: 'Harbour Heights',
    buildingType: 'Luxury Apartment Tower',
    floorsCount: 6,
    basementsCount: 2,
    floorHeightM: 3.2,
    footprintAreaSqM: 820.0,
    yearBuilt: 2023,
    structureType: 'RCC Framed Multi-Storey Tower',
    unitsPerFloor: 4,
  },
  // 2. Pune - Hinjewadi
  {
    parcelId: 'parcel-14',
    ulpin: '27101500123469',
    localParcelId: 'PUN-HIN-0014',
    locationName: 'Phase 1, Hinjewadi Infotech Park, Pune',
    city: 'Pune',
    lat: 18.5913,
    lng: 73.7389,
    areaSqM: 2650.0,
    landUse: 'Mixed Use',
    surveyNumber: 'Sy. No. 280/1',
    village: 'Hinjewadi',
    taluk: 'Mulshi',
    district: 'Pune',
    buildingId: 'bldg-14',
    buildingCode: 'BN',
    buildingName: 'Pune Tech Residences',
    buildingType: 'IT Commercial / Mixed-Use',
    floorsCount: 6,
    basementsCount: 2,
    floorHeightM: 3.2,
    footprintAreaSqM: 1150.0,
    yearBuilt: 2023,
    structureType: 'Composite Steel & Glass Curtain Wall',
    unitsPerFloor: 4,
  },
  // 3. Nagpur - Civil Lines
  {
    parcelId: 'parcel-16',
    ulpin: '27101500123471',
    localParcelId: 'NAG-CIV-0016',
    locationName: 'Palm Road, Civil Lines, Nagpur',
    city: 'Nagpur',
    lat: 21.1524,
    lng: 79.0688,
    areaSqM: 1720.0,
    landUse: 'Residential',
    surveyNumber: 'Khasra No. 88/1',
    village: 'Civil Station',
    taluk: 'Nagpur Urban',
    district: 'Nagpur',
    buildingId: 'bldg-16',
    buildingCode: 'BP',
    buildingName: 'Nagpur Central Residency',
    buildingType: 'Residential Complex',
    floorsCount: 5,
    basementsCount: 1,
    floorHeightM: 3.0,
    footprintAreaSqM: 750.0,
    yearBuilt: 2022,
    structureType: 'RCC Framed Multi-Storey',
    unitsPerFloor: 4,
  },
];

let ownerNameIndex = 0;
function getNextUniqueOwnerName(): string {
  const name = SYNTHETIC_OWNER_NAMES[ownerNameIndex % SYNTHETIC_OWNER_NAMES.length];
  ownerNameIndex++;
  return name;
}

export const INITIAL_PARCELS: Parcel[] = [];
export const INITIAL_BUILDINGS: Building[] = [];
export const INITIAL_FLOORS: Floor[] = [];
export const INITIAL_UNITS: Unit[] = [];
export const INITIAL_OWNERSHIPS: OwnershipRecord[] = [];

RAW_PROPERTIES.forEach((prop) => {
  INITIAL_PARCELS.push({
    id: prop.parcelId,
    ulpin: prop.ulpin,
    localParcelId: prop.localParcelId,
    locationName: prop.locationName,
    city: prop.city,
    latitude: prop.lat,
    longitude: prop.lng,
    areaSqM: prop.areaSqM,
    landUse: prop.landUse,
    buildingCount: 1,
    status: 'Verified',
    crs: 'EPSG:4326 - WGS84',
    surveyNumber: prop.surveyNumber,
    village: prop.village,
    taluk: prop.taluk,
    district: prop.district,
    boundaryGeoJSON: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [prop.lng - 0.0008, prop.lat - 0.0006],
            [prop.lng + 0.0008, prop.lat - 0.0005],
            [prop.lng + 0.0006, prop.lat + 0.0007],
            [prop.lng - 0.0007, prop.lat + 0.0006],
            [prop.lng - 0.0008, prop.lat - 0.0006],
          ],
        ],
      },
      properties: { name: `${prop.buildingName} Land Parcel` },
    },
  });

  INITIAL_BUILDINGS.push({
    id: prop.buildingId,
    parcelId: prop.parcelId,
    buildingCode: prop.buildingCode,
    buildingName: prop.buildingName,
    city: prop.city,
    location: prop.locationName,
    buildingType: prop.buildingType,
    numberOfFloors: prop.floorsCount,
    numberOfBasements: prop.basementsCount,
    floorHeightM: prop.floorHeightM,
    buildingHeightM: prop.floorsCount * prop.floorHeightM,
    footprintAreaSqM: prop.footprintAreaSqM,
    yearBuilt: prop.yearBuilt,
    structureType: prop.structureType,
  });

  for (let f = 1; f <= prop.floorsCount; f++) {
    const floorId = `floor-${prop.buildingId}-${f}`;
    const fCode = `F${f}`;
    const floorArea = prop.footprintAreaSqM * 0.95;

    INITIAL_FLOORS.push({
      id: floorId,
      buildingId: prop.buildingId,
      buildingCode: prop.buildingCode,
      floorCode: fCode,
      floorName: `Floor ${f}`,
      floorIndex: f,
      zLevelM: (f - 1) * prop.floorHeightM,
      totalFloorAreaSqM: floorArea,
      measuredUnitAreaSumSqM: floorArea,
      validationStatus: 'VALID',
      unitCount: prop.unitsPerFloor,
      colorHex: f % 2 === 0 ? '#3b82f6' : '#22c55e',
    });

    for (let u = 1; u <= prop.unitsPerFloor; u++) {
      const unitId = `unit-${prop.buildingId}-${f}-${u}`;
      const unitNum = `${f}0${u}`;
      const unitCode = `${fCode}-${unitNum}`;
      const fullUlpin = generateULPIN(prop.ulpin, prop.buildingCode, fCode, `U0${u}`);
      const carpet = floorArea / prop.unitsPerFloor - 12;

      INITIAL_UNITS.push({
        id: unitId,
        unitNumber: unitNum,
        unitCode: unitCode,
        buildingId: prop.buildingId,
        buildingCode: prop.buildingCode,
        floorId: floorId,
        floorCode: fCode,
        full3DULPIN: fullUlpin,
        parentParcelULPIN: prop.ulpin,
        unitType: u % 2 === 0 ? '3BHK Executive' : '2BHK Luxury',
        carpetAreaSqM: Math.round(carpet),
        builtUpAreaSqM: Math.round(carpet * 1.15),
        usage: 'Residential',
        sharePercentageOfLand: +(100 / (prop.floorsCount * prop.unitsPerFloor)).toFixed(2),
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

      const ownerName = getNextUniqueOwnerName();
      INITIAL_OWNERSHIPS.push({
        id: `own-${unitId}`,
        unitId: unitId,
        unitCode: unitCode,
        ownerName: ownerName,
        ownerType: 'Individual',
        ownershipPercentage: 100,
        ownershipType: 'Freehold',
        docRefNo: `DOC-2023-MH-${Math.floor(10000 + Math.random() * 90000)}`,
        registrationDate: '2023-04-15',
        verificationStatus: 'Verified',
        contactEmail: `${ownerName.toLowerCase().replace(/\s+/g, '.')}@geovision.gov.in`,
        nationalIdMasked: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        mortgageStatus: 'None',
      });
    }
  }
});

export const INITIAL_CONFLICTS: OwnershipConflict[] = [
  {
    id: 'conf-1',
    unitId: 'unit-bldg-1-3-3',
    unitCode: 'F3-303',
    buildingName: 'Harbour Heights',
    parentULPIN: '27101500123456',
    unit3DULPIN: '27101500123456-BA-F3-U03',
    severity: 'High',
    issueType: 'Multiple Ownership Records',
    description: 'Double conveyance claim registered on unit F3-303 by rival deeds.',
    conflictingParties: ['Aarav Mehta', 'Rohan Deshmukh'],
    docRefNumbers: ['DOC-2023-MH-8891', 'DOC-2023-MH-9942'],
    reportedDate: '2024-02-10',
    status: 'Open',
  },
];

export const INITIAL_UTILITIES: UndergroundUtility[] = [
  {
    id: 'util-1',
    type: 'Water Pipeline',
    name: 'Municipal Water Main',
    depthM: -2.5,
    diameterMm: 400,
    material: 'Ductile Iron',
    colorHex: '#3b82f6',
    coordinates: [[-20, -2.5, 0], [20, -2.5, 0]],
    status: 'Active',
  },
];

export const MOCK_AI_SEGMENTATION_RESULT: AISegmentationResult = {
  floorId: 'floor-bldg-1-3',
  confidence: 0.94,
  detectedUnitsCount: 4,
  processingTimeSeconds: 1.8,
  modelName: 'GeoVision-Gemini-Spatial-v2',
  status: 'Completed',
  units: [],
};