import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  UploadCloud,
  ArrowRight,
  Database,
  Sparkles,
  Loader2,
  Zap,
  Download,
  AlertCircle,
  Droplets,
  Flame,
  CloudRain,
  Car,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { LandUseType, Unit, OwnershipRecord, Floor, OwnershipType, generateULPIN } from '../../types/cadastre';
import { FloorPlanGeometrySection } from './create-property/FloorPlanGeometrySection';
import { Survey3DDataSection, Survey3DState } from './create-property/Survey3DDataSection';
import { UndergroundInfraSection, UndergroundLayer } from './create-property/UndergroundInfraSection';
import { ValidationPreviewSection } from './create-property/ValidationPreviewSection';
import { parseCSV, findHeaderKey } from '../../utils/csvParser';
import { GeneratePropertySection } from './create-property/GeneratePropertySection';
import { downloadCadastralPDFReport } from '../../utils/reportExporter';

interface ParsedUnitRow {
  unitId: string;
  floor: string;
  floorIndex: number;
  unitType: string;
  areaSqM: number;
  usage: string;
}

interface ParsedOwnershipRow {
  unitId: string;
  ownerName: string;
  ownerType: 'Individual' | 'Joint' | 'Corporate' | 'Government';
  ownershipPercentage: number;
  ownershipType: 'Freehold' | 'Leasehold' | 'Condominium' | 'Co-operative Society';
  docRefNo: string;
  verificationStatus: 'Verified' | 'Pending Review' | 'Provisional';
}

export const CreatePropertyView: React.FC = () => {
  const { addNewProperty, setActiveTab } = useCadastre();

  // 1. Parcel Details Form State (Clean Blank State)
  const [parcelId, setParcelId] = useState<string>('');
  const [existingUlpin, setExistingUlpin] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [area, setArea] = useState<number>(0);
  const [landUse, setLandUse] = useState<LandUseType>('Residential');

  // 2. Building Details Form State (Clean Blank State)
  const [buildingName, setBuildingName] = useState<string>('');
  const [buildingCode, setBuildingCode] = useState<string>('');
  const [buildingType, setBuildingType] = useState<string>('High-Rise Residential Tower');
  const [floorsAboveGround, setFloorsAboveGround] = useState<number>(0);
  const [basements, setBasements] = useState<number>(0);
  const [floorHeight, setFloorHeight] = useState<number>(3.0);

  // 3. Floor Plan & Geometry Files (Blank / Unselected)
  const [floorPlanFile, setFloorPlanFile] = useState<string | null>(null);
  const [buildingFootprintFile, setBuildingFootprintFile] = useState<string | null>(null);

  // 4. Survey & 3D Data State
  const [surveyData, setSurveyData] = useState<Survey3DState>({
    droneImagery: null,
    lidarCloud: null,
    dem: null,
    dsm: null,
    gnssCors: null,
  });

  // 5. Underground Infrastructure State (All disabled by default)
  const [undergroundLayers, setUndergroundLayers] = useState<UndergroundLayer[]>([
    { id: 'water', name: 'Water Supply Network', enabled: false, file: null, icon: Droplets, depthM: 2.5 },
    { id: 'sewer', name: 'Sewer Network', enabled: false, file: null, icon: Layers, depthM: 4.0 },
    { id: 'electric', name: 'Electricity & Cable Network', enabled: false, file: null, icon: Zap, depthM: 1.8 },
    { id: 'gas', name: 'Gas Pipeline', enabled: false, file: null, icon: Flame, depthM: 1.5 },
    { id: 'stormwater', name: 'Stormwater Network', enabled: false, file: null, icon: CloudRain, depthM: 3.2 },
    { id: 'basement', name: 'Basement & Parking Layout', enabled: false, file: null, icon: Car, depthM: 6.0 },
  ]);

  // 6. CSV Data States (Blank CSV Uploads)
  const [unitCsvFileName, setUnitCsvFileName] = useState<string | null>(null);
  const [parsedUnits, setParsedUnits] = useState<ParsedUnitRow[]>([]);
  const [unitCsvError, setUnitCsvError] = useState<string | null>(null);

  const [ownershipCsvFileName, setOwnershipCsvFileName] = useState<string | null>(null);
  const [parsedOwnerships, setParsedOwnerships] = useState<ParsedOwnershipRow[]>([]);
  const [ownershipCsvError, setOwnershipCsvError] = useState<string | null>(null);

  // Cross-Validation Warnings
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isCrossValidated, setIsCrossValidated] = useState<boolean>(false);

  // Pipeline processing animation & Generation
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);

  const unitFileInputRef = useRef<HTMLInputElement>(null);
  const ownershipFileInputRef = useRef<HTMLInputElement>(null);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, []);

  const pipelineStages = [
    'Parcel Details',
    'Building Details',
    'Floor Plan Upload',
    'Unit CSV Upload',
    'Ownership CSV Upload',
    'Validate Data',
    'AI Floor Segmentation',
    'Floor → Unit Mapping',
    'Vertical Property Mapping',
    'Generate 3D ULPIN',
    'Generate 3D Building',
    'Validation',
    'Property Card',
    'Report',
  ];

  // Process Unit CSV
  const processUnitCSVContent = (content: string, fileName: string) => {
    setUnitCsvError(null);
    try {
      const { headers, rows } = parseCSV(content);
      if (headers.length === 0 || rows.length === 0) {
        setUnitCsvError('Invalid CSV structure: Empty file or no data rows found.');
        return;
      }

      const unitIdCol = findHeaderKey(headers, ['Unit ID', 'UnitID', 'Unit_ID', 'Unit Code', 'Unit']);
      const floorCol = findHeaderKey(headers, ['Floor', 'Floor Code', 'Floor Index', 'Level', 'Floor Level']);
      const areaCol = findHeaderKey(headers, ['Area', 'Carpet Area', 'Area (sq.m)', 'CarpetArea', 'AreaSqM', 'Carpet Area (sq.m)']);
      const usageCol = findHeaderKey(headers, ['Usage', 'Unit Type', 'Type', 'Land Use', 'UnitType']);

      const missing: string[] = [];
      if (!unitIdCol) missing.push('Unit ID');
      if (!floorCol) missing.push('Floor');
      if (!areaCol) missing.push('Area');
      if (!usageCol) missing.push('Usage');

      if (missing.length > 0) {
        setUnitCsvError(`Invalid CSV structure. Missing column(s): ${missing.join(', ')}`);
        return;
      }

      const parsed: ParsedUnitRow[] = rows.map((r, idx) => {
        const uId = r[unitIdCol!] || `U-${idx + 1}`;
        const fStr = r[floorCol!] || 'F1';
        const cleanFloor = fStr.startsWith('F') || fStr.startsWith('B') || fStr.startsWith('G') ? fStr : `F${fStr}`;
        const fIndexMatch = cleanFloor.match(/\d+/);
        const fIdx = fIndexMatch ? parseInt(fIndexMatch[0], 10) : 1;
        const areaNum = parseFloat(r[areaCol!]) || 110.0;
        const usageVal = r[usageCol!] || 'Residential';

        return {
          unitId: uId,
          floor: cleanFloor,
          floorIndex: fIdx,
          unitType: usageVal.includes('BHK') || usageVal.includes('Penthouse') ? usageVal : '2BHK Luxury',
          areaSqM: areaNum,
          usage: usageVal,
        };
      });

      setParsedUnits(parsed);
      setUnitCsvFileName(fileName);
      setUnitCsvError(null);
      runCrossValidation(parsed, parsedOwnerships);
    } catch (err: any) {
      setUnitCsvError(`Failed to parse CSV: ${err.message}`);
    }
  };

  // Process Ownership CSV
  const processOwnershipCSVContent = (content: string, fileName: string) => {
    setOwnershipCsvError(null);
    try {
      const { headers, rows } = parseCSV(content);
      if (headers.length === 0 || rows.length === 0) {
        setOwnershipCsvError('Invalid CSV structure: Empty file or no data rows found.');
        return;
      }

      const unitIdCol = findHeaderKey(headers, ['Unit ID', 'UnitID', 'Unit_ID', 'Unit Code', 'Unit']);
      const ownerNameCol = findHeaderKey(headers, ['Owner Name', 'Owner', 'Full Name', 'Name', 'Primary Owner']);
      const shareCol = findHeaderKey(headers, ['Ownership %', 'Share %', 'OwnershipPercentage', 'Share', 'Percentage']);
      const ownershipTypeCol = findHeaderKey(headers, ['Ownership Type', 'Tenure', 'Tenure Type', 'Title Type', 'Type']);
      const docCol = findHeaderKey(headers, ['Document Reference', 'Doc Ref', 'DocRefNo', 'Doc Number', 'Deed Number', 'DeedNo']);
      const statusCol = findHeaderKey(headers, ['Verification Status', 'Status', 'Verification']);
      const ownerTypeCol = findHeaderKey(headers, ['Owner Type', 'OwnerType', 'Entity Type']);

      const missing: string[] = [];
      if (!unitIdCol) missing.push('Unit ID');
      if (!ownerNameCol) missing.push('Owner Name');
      if (!ownershipTypeCol) missing.push('Ownership Type');
      if (!shareCol) missing.push('Ownership %');

      if (missing.length > 0) {
        setOwnershipCsvError(`Invalid CSV structure. Missing column(s): ${missing.join(', ')}`);
        return;
      }

      const parsed: ParsedOwnershipRow[] = rows.map((r, idx) => {
        const uId = r[unitIdCol!] || `U-${idx + 1}`;
        const oName = r[ownerNameCol!] || 'Unassigned';
        const oType = (r[ownerTypeCol!] as any) || (oName.includes('Ltd') || oName.includes('Corp') ? 'Corporate' : oName.includes('&') ? 'Joint' : 'Individual');
        const share = parseFloat(r[shareCol!]) || 100;
        const tenure = (r[ownershipTypeCol!] as any) || 'Freehold';
        const docRef = r[docCol!] || `MH-MUM-REG-${2024}-${1000 + idx}`;
        const stat = (r[statusCol!] as any) || 'Verified';

        return {
          unitId: uId,
          ownerName: oName,
          ownerType: oType,
          ownershipPercentage: share,
          ownershipType: tenure,
          docRefNo: docRef,
          verificationStatus: stat,
        };
      });

      setParsedOwnerships(parsed);
      setOwnershipCsvFileName(fileName);
      setOwnershipCsvError(null);
      runCrossValidation(parsedUnits, parsed);
    } catch (err: any) {
      setOwnershipCsvError(`Failed to parse CSV: ${err.message}`);
    }
  };

  const runCrossValidation = (unitsList: ParsedUnitRow[], ownershipsList: ParsedOwnershipRow[]) => {
    const issues: string[] = [];

    if (unitsList.length > 0 && ownershipsList.length > 0) {
      const unitIdSet = new Set(unitsList.map((u) => u.unitId.toLowerCase().trim()));
      const ownershipUnitIdSet = new Set(ownershipsList.map((o) => o.unitId.toLowerCase().trim()));

      ownershipsList.forEach((o) => {
        if (!unitIdSet.has(o.unitId.toLowerCase().trim())) {
          issues.push(`Ownership record found for unknown Unit ID: ${o.unitId} (${o.ownerName})`);
        }
      });

      unitsList.forEach((u) => {
        if (!ownershipUnitIdSet.has(u.unitId.toLowerCase().trim())) {
          issues.push(`Ownership information missing for Unit ID: ${u.unitId} (Floor ${u.floor})`);
        }
      });
    }

    setValidationIssues(issues);
    setIsCrossValidated(true);
  };

  const handleUnitFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processUnitCSVContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleOwnershipFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processOwnershipCSVContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleUnitCSV = () => {
    const sampleUnitCSV = `Unit ID,Floor,Unit Type,Area,Usage
SB-F1-101,F1,2BHK Luxury,112.5,Residential
SB-F1-102,F1,2BHK Luxury,115.0,Residential
SB-F1-103,F1,3BHK Executive,145.0,Residential
SB-F1-104,F1,3BHK Executive,148.2,Residential
SB-F2-201,F2,2BHK Luxury,112.5,Residential
SB-F2-202,F2,2BHK Luxury,115.0,Residential
SB-F2-203,F2,3BHK Executive,145.0,Residential
SB-F2-204,F2,3BHK Executive,148.2,Residential
SB-F3-301,F3,2BHK Luxury,112.5,Residential
SB-F3-302,F3,2BHK Luxury,115.0,Residential
SB-F3-303,F3,3BHK Executive,145.0,Residential
SB-F3-304,F3,3BHK Executive,148.2,Residential
SB-F4-401,F4,2BHK Luxury,112.5,Residential
SB-F4-402,F4,2BHK Luxury,115.0,Residential
SB-F4-403,F4,3BHK Executive,145.0,Residential
SB-F4-404,F4,3BHK Executive,148.2,Residential
SB-F5-501,F5,3BHK Luxury Penthouse,175.0,Residential
SB-F5-502,F5,3BHK Luxury Penthouse,178.5,Residential
SB-F5-503,F5,4BHK Royal Suite,210.0,Residential
SB-F5-504,F5,4BHK Royal Suite,215.0,Residential
SB-F6-601,F6,3BHK Luxury Penthouse,175.0,Residential
SB-F6-602,F6,3BHK Luxury Penthouse,178.5,Residential
SB-F6-603,F6,4BHK Royal Suite,210.0,Residential
SB-F6-604,F6,4BHK Royal Suite,215.0,Residential`;

    processUnitCSVContent(sampleUnitCSV, 'worli_sea_breeze_units.csv');
  };

  const handleLoadSampleOwnershipCSV = () => {
    const sampleOwnershipCSV = `Unit ID,Owner Name,Owner Type,Ownership %,Ownership Type,Document Reference,Verification Status
SB-F1-101,Aditya Singhania,Individual,100,Freehold,MH-MUM-REG-2024-1011,Verified
SB-F1-102,Pooja Kulkarni,Individual,100,Freehold,MH-MUM-REG-2024-1012,Verified
SB-F1-103,Vikramaditya Deshmukh & Sunita Deshmukh,Joint,100,Freehold,MH-MUM-REG-2024-1013,Verified
SB-F1-104,Rashmi Iyer,Individual,100,Freehold,MH-MUM-REG-2024-1014,Verified
SB-F2-201,Karan Johar-Mehta,Individual,100,Freehold,MH-MUM-REG-2024-1021,Verified
SB-F2-202,Snehalata Patil,Individual,100,Freehold,MH-MUM-REG-2024-1022,Verified
SB-F2-203,Rohan Varma & Ananya Varma,Joint,100,Freehold,MH-MUM-REG-2024-1023,Verified
SB-F2-204,Ananya Bhattacharya,Individual,100,Freehold,MH-MUM-REG-2024-1024,Verified
SB-F3-301,Dr. Farhan Merchant,Individual,100,Freehold,MH-MUM-REG-2024-1031,Verified
SB-F3-302,Sunil Gavaskar Trusts,Corporate,100,Freehold,MH-MUM-REG-2024-1032,Verified
SB-F3-303,Tanya & Devendra Rao,Joint,100,Freehold,MH-MUM-REG-2024-1033,Verified
SB-F3-304,Nikhil Shenoy,Individual,100,Freehold,MH-MUM-REG-2024-1034,Verified
SB-F4-401,Kavita Oberoi,Individual,100,Freehold,MH-MUM-REG-2024-1041,Verified
SB-F4-402,Siddharth Godrej,Individual,100,Freehold,MH-MUM-REG-2024-1042,Verified
SB-F4-403,Alok Nath Parekh & Gauri Parekh,Joint,100,Freehold,MH-MUM-REG-2024-1043,Verified
SB-F4-404,Gauri Shinde,Individual,100,Freehold,MH-MUM-REG-2024-1044,Verified
SB-F5-501,Zoya Akhtar-Kapoor,Individual,100,Freehold,MH-MUM-REG-2024-1051,Verified
SB-F5-502,Hrishikesh Mukherjee,Individual,100,Freehold,MH-MUM-REG-2024-1052,Verified
SB-F5-503,Deepa Merchant,Individual,100,Freehold,MH-MUM-REG-2024-1053,Verified
SB-F5-504,Rajeshwari Gaikwad,Individual,100,Freehold,MH-MUM-REG-2024-1054,Verified
SB-F6-601,Sameer Wankhede,Individual,100,Freehold,MH-MUM-REG-2024-1061,Verified
SB-F6-602,Pavitra Sundaram,Individual,100,Freehold,MH-MUM-REG-2024-1062,Verified
SB-F6-603,Vivek Agnihotri,Individual,100,Freehold,MH-MUM-REG-2024-1063,Verified
SB-F6-604,Natasha Poonawalla Ltd,Corporate,100,Freehold,MH-MUM-REG-2024-1064,Verified`;

    processOwnershipCSVContent(sampleOwnershipCSV, 'worli_sea_breeze_ownership.csv');
  };

  const downloadCSVTemplate = (type: 'unit' | 'ownership') => {
    let csv = '';
    let fileName = '';
    if (type === 'unit') {
      csv = `Unit ID,Floor,Unit Type,Area,Usage\nU-101,F1,2BHK Luxury,115.0,Residential\nU-102,F1,3BHK Executive,145.0,Residential\nU-201,F2,2BHK Luxury,115.0,Residential\nU-202,F2,3BHK Executive,145.0,Residential`;
      fileName = 'cadastre_unit_template.csv';
    } else {
      csv = `Unit ID,Owner Name,Owner Type,Ownership %,Ownership Type,Document Reference,Verification Status\nU-101,Aarav Mehta,Individual,100,Freehold,DOC-2024-001,Verified\nU-102,Pooja Hegde,Individual,100,Freehold,DOC-2024-002,Verified\nU-201,Rohan Deshmukh,Individual,100,Freehold,DOC-2024-003,Verified\nU-202,Ananya Shah,Individual,100,Freehold,DOC-2024-004,Verified`;
      fileName = 'cadastre_ownership_template.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // 12-rule validation check
  const validationErrors: string[] = [];
  if (!parcelId.trim()) validationErrors.push('Parcel ID is required');
  if (!existingUlpin.trim()) validationErrors.push('Existing ULPIN is required');
  if (!location.trim()) validationErrors.push('Location is required');
  if (!buildingName.trim()) validationErrors.push('Building Name is required');
  if (!buildingCode.trim()) validationErrors.push('Building Code is required');
  if (floorsAboveGround <= 0) validationErrors.push('Floors must be greater than 0');
  if (floorHeight <= 0) validationErrors.push('Floor height must be greater than 0');
  if (parsedUnits.length === 0) validationErrors.push('Unit data is required (Upload CSV or load sample)');
  if (parsedOwnerships.length === 0) validationErrors.push('Ownership data is required (Upload CSV or load sample)');
  if (validationIssues.length > 0) validationErrors.push(`${validationIssues.length} unit-to-ownership mismatches detected`);

  const validationRulesPassed = validationErrors.length === 0;

  // Execute 3D Property Generation
  const handleStartGeneration = () => {
    if (!validationRulesPassed) return;

    setIsProcessing(true);
    setProcessingStep(0);
    setGenerationSuccess(false);

    let currentStep = 0;
    if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);

    processingIntervalRef.current = setInterval(() => {
      currentStep++;
      if (currentStep < 10) {
        setProcessingStep(currentStep);
      } else {
        if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);
        finalizeAndIngestProperty();
      }
    }, 450);
  };

  const finalizeAndIngestProperty = () => {
    const distinctFloorCodes: string[] = Array.from(new Set(parsedUnits.map((u) => u.floor)));
    
    distinctFloorCodes.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    // Custom Floors
    const customFloors: Floor[] = distinctFloorCodes.map((fCode, idx) => {
      const fUnits = parsedUnits.filter((u) => u.floor === fCode);
      const areaSum = fUnits.reduce((acc, curr) => acc + curr.areaSqM, 0);
      const fNumMatch = fCode.match(/\d+/);
      const fIdx = fNumMatch ? parseInt(fNumMatch[0], 10) : idx + 1;

      return {
        id: `floor-gen-${fCode}`,
        buildingId: '',
        buildingCode: buildingCode,
        floorCode: fCode,
        floorName: `${fCode} - Residential`,
        floorIndex: fIdx,
        zLevelM: (fIdx - 1) * (floorHeight || 3.0),
        totalFloorAreaSqM: areaSum * 1.15,
        measuredUnitAreaSumSqM: areaSum,
        validationStatus: 'VALID',
        unitCount: fUnits.length,
        colorHex: fIdx % 2 === 0 ? '#3b82f6' : '#22c55e',
      };
    });

        // Custom Units grouped by floor to calculate exact per-floor relative bounds
    const customUnits: Unit[] = [];
    distinctFloorCodes.forEach((fCode) => {
      const fUnits = parsedUnits.filter((u) => u.floor === fCode);
      const uCount = fUnits.length;
      const cols = uCount <= 2 ? Math.max(1, uCount) : Math.ceil(Math.sqrt(uCount));
      const rows = Math.ceil(uCount / (cols || 1));

      fUnits.forEach((u, fIdx) => {
        const uFloor = customFloors.find((f) => f.floorCode === u.floor);
        const uFloorId = uFloor ? uFloor.id : `floor-gen-${u.floor}`;
        const uIdent = `U${String(fIdx + 1).padStart(2, '0')}`;
        const fulpin = generateULPIN(existingUlpin, buildingCode, u.floor, uIdent);

        const r = Math.floor(fIdx / cols);
        const c = fIdx % cols;
        const w = +(0.86 / cols).toFixed(2);
        const d = +(0.86 / (rows || 1)).toFixed(2);
        const x = +(0.05 + c * (0.90 / cols)).toFixed(2);
        const y = +(0.05 + r * (0.90 / (rows || 1))).toFixed(2);

        customUnits.push({
          id: `unit-gen-${u.unitId}`,
          unitNumber: u.unitId,
          unitCode: u.unitId,
          buildingId: '',
          buildingCode: buildingCode,
          floorId: uFloorId,
          floorCode: u.floor,
          full3DULPIN: fulpin,
          parentParcelULPIN: existingUlpin,
          unitType: u.unitType,
          carpetAreaSqM: u.areaSqM,
          builtUpAreaSqM: +(u.areaSqM * 1.12).toFixed(2),
          usage: u.usage as any,
          sharePercentageOfLand: +(100 / (parsedUnits.length || 1)).toFixed(2),
          status: 'Verified',
          colorHex: fIdx % 3 === 0 ? '#3b82f6' : fIdx % 3 === 1 ? '#10b981' : '#f59e0b',
          relativeBounds: { x, y, w, d },
          polygon: [[10, 10], [90, 10], [90, 90], [10, 90]],
        });
      });
    });

    // Custom Ownerships
    const customOwnerships: OwnershipRecord[] = parsedUnits.map((u, idx) => {
      const matchedOwner = parsedOwnerships.find(
        (o) => o.unitId.toLowerCase().trim() === u.unitId.toLowerCase().trim()
      );

      let mappedOwnershipType: OwnershipType = 'Freehold';
      if (matchedOwner) {
        if (matchedOwner.ownershipType === 'Condominium') mappedOwnershipType = 'Condominium Deed';
        else if (matchedOwner.ownershipType === 'Co-operative Society') mappedOwnershipType = 'Joint Tenancy';
        else if (['Freehold', 'Leasehold', 'Government Allocation', 'Joint Tenancy'].includes(matchedOwner.ownershipType)) {
          mappedOwnershipType = matchedOwner.ownershipType as OwnershipType;
        }
      }

      return {
        id: `own-gen-${u.unitId}`,
        unitId: `unit-gen-${u.unitId}`,
        unitCode: u.unitId,
        ownerName: matchedOwner ? matchedOwner.ownerName : 'Aditya Singhania',
        ownerType: matchedOwner ? matchedOwner.ownerType : 'Individual',
        ownershipPercentage: matchedOwner ? matchedOwner.ownershipPercentage : 100,
        ownershipType: mappedOwnershipType,
        docRefNo: matchedOwner ? matchedOwner.docRefNo : `DOC-MH-2024-${1000 + idx}`,
        registrationDate: new Date().toISOString().split('T')[0],
        verificationStatus: matchedOwner ? (matchedOwner.verificationStatus === 'Pending Review' ? 'Pending' : matchedOwner.verificationStatus === 'Provisional' ? 'Draft' : 'Verified') : 'Verified',
        contactEmail: `${(matchedOwner?.ownerName || 'owner').toLowerCase().replace(/[^a-z0-9]/g, '.')}@cadastre.gov.in`,
        nationalIdMasked: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        mortgageStatus: 'None',
      };
    });

    // Ingest into Cadastre Global Context
    addNewProperty({
      parcel: {
        ulpin: existingUlpin,
        localParcelId: parcelId,
        locationName: location,
        city: city,
        latitude: latitude,
        longitude: longitude,
        areaSqM: area,
        landUse: landUse,
      },
      building: {
        buildingName: buildingName,
        buildingCode: buildingCode,
        buildingType: buildingType,
        floorHeightM: floorHeight,
        numberOfBasements: basements,
      },
      floorsCount: distinctFloorCodes.length,
      unitCountPerFloor: Math.ceil(parsedUnits.length / (distinctFloorCodes.length || 1)),
      customUnits: customUnits,
      customOwnerships: customOwnerships,
      customFloors: customFloors,
    });

    setIsProcessing(false);
    setGenerationSuccess(true);
  };

  const surveyDataSummary = [
    surveyData.droneImagery ? 'Drone' : null,
    surveyData.lidarCloud ? 'LiDAR' : null,
    surveyData.dem || surveyData.dsm ? 'DEM/DSM' : null,
    surveyData.gnssCors ? 'GNSS' : null,
  ].filter(Boolean).join(', ') || 'Standard Cadastral Datum';

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Cadastral Ingestion Pipeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Create 3D ULPIN & Vertical Property
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Ingest 2D parcel boundaries, structural footprints, architectural floor plans, and verify CSV unit & ownership datasets to construct verified ISO 19152 3D ULPINs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={!validationRulesPassed || isProcessing}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate 3D Property</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Stages Stepper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {pipelineStages.map((stage, idx) => {
            const isCompleted =
              (idx <= 1) ||
              (idx === 2 && floorPlanFile) ||
              (idx === 3 && parsedUnits.length > 0) ||
              (idx === 4 && parsedOwnerships.length > 0) ||
              (idx === 5 && validationRulesPassed) ||
              (idx > 5 && generationSuccess);

            return (
              <div key={idx} className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                  isCompleted
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-white dark:bg-slate-900 shadow-xs">
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <span>{stage}</span>
                </div>
                {idx < pipelineStages.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Sections Grid: 01 & 02 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Parcel / Land Attributes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Parcel & Spatial Datum</h2>
              <p className="text-[11px] text-slate-500">2D Cadastre Ground Boundary Specifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Existing Parcel ULPIN</label>
              <input
                type="text"
                value={existingUlpin}
                placeholder="e.g., 27101500984123"
                onChange={(e) => setExistingUlpin(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Local Parcel ID</label>
              <input
                type="text"
                value={parcelId}
                placeholder="e.g., P-2024-MH-0842"
                onChange={(e) => setParcelId(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cadastral Location Address</label>
              <input
                type="text"
                value={location}
                placeholder="e.g., Worli Sea Face, Mumbai, Maharashtra"
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Latitude (° N)</label>
              <input
                type="number"
                step="0.0001"
                value={latitude || ''}
                placeholder="19.0178"
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Longitude (° E)</label>
              <input
                type="number"
                step="0.0001"
                value={longitude || ''}
                placeholder="72.8178"
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Parcel Land Area (sq.m)</label>
              <input
                type="number"
                value={area || ''}
                placeholder="1850"
                onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Zoning / Land Use</label>
              <select
                value={landUse}
                onChange={(e) => setLandUse(e.target.value as LandUseType)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed Use">Mixed Use</option>
                <option value="Industrial">Industrial</option>
                <option value="Public / Infrastructure">Public / Infrastructure</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Building Physical Envelope */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Building Structure & Elevation</h2>
              <p className="text-[11px] text-slate-500">Vertical Dimensioning & 3D Envelope</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Building Name</label>
              <input
                type="text"
                value={buildingName}
                placeholder="e.g., Sea Breeze Heights"
                onChange={(e) => setBuildingName(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Building Code</label>
              <input
                type="text"
                value={buildingCode}
                maxLength={4}
                placeholder="e.g., SB"
                onChange={(e) => setBuildingCode(e.target.value.toUpperCase())}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Building Typology</label>
              <input
                type="text"
                value={buildingType}
                placeholder="e.g., High-Rise Residential Tower"
                onChange={(e) => setBuildingType(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Floors (Above Ground)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={floorsAboveGround || ''}
                placeholder="6"
                onChange={(e) => setFloorsAboveGround(parseInt(e.target.value, 10) || 0)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Basement Levels</label>
              <input
                type="number"
                min={0}
                max={5}
                value={basements || ''}
                placeholder="0"
                onChange={(e) => setBasements(parseInt(e.target.value, 10) || 0)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Floor Height (m)</label>
              <input
                type="number"
                step="0.1"
                min={2}
                max={10}
                value={floorHeight || ''}
                placeholder="3.0"
                onChange={(e) => setFloorHeight(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sections 03 & 04: CSV Datasets Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 03: Unit CSV Upload */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Unit Details CSV</h2>
                <p className="text-[11px] text-slate-500">Unit ID | Floor | Unit Type | Area | Usage</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadCSVTemplate('unit')}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Template</span>
            </button>
          </div>

          {unitCsvError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{unitCsvError}</span>
            </div>
          )}

          <div
            onClick={() => unitFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl p-4 text-center cursor-pointer transition-colors"
          >
            <input
              ref={unitFileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUnitFileUpload}
              className="hidden"
            />
            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {unitCsvFileName ? `Selected: ${unitCsvFileName}` : 'Click to Upload Unit CSV File'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Supports .CSV format (Unit ID, Floor, Area, Usage)</p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Parsed Units: <strong className="text-slate-900 dark:text-white">{parsedUnits.length}</strong></span>
            <button
              type="button"
              onClick={handleLoadSampleUnitCSV}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Load Sample Unit Data
            </button>
          </div>
        </div>

        {/* Section 04: Ownership CSV Upload */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ownership CSV</h2>
                <p className="text-[11px] text-slate-500">Unit ID | Owner Name | Owner Type | Share % | Tenure</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadCSVTemplate('ownership')}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Template</span>
            </button>
          </div>

          {ownershipCsvError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{ownershipCsvError}</span>
            </div>
          )}

          <div
            onClick={() => ownershipFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl p-4 text-center cursor-pointer transition-colors"
          >
            <input
              ref={ownershipFileInputRef}
              type="file"
              accept=".csv"
              onChange={handleOwnershipFileUpload}
              className="hidden"
            />
            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {ownershipCsvFileName ? `Selected: ${ownershipCsvFileName}` : 'Click to Upload Ownership CSV File'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Supports .CSV format (Unit ID, Owner Name, Tenure, Share)</p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Parsed Ownership Records: <strong className="text-slate-900 dark:text-white">{parsedOwnerships.length}</strong></span>
            <button
              type="button"
              onClick={handleLoadSampleOwnershipCSV}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Load Sample Ownership Data
            </button>
          </div>
        </div>
      </div>

      {/* Section 05: Architectural Floor Plan Upload */}
      <FloorPlanGeometrySection
        floorPlanFile={floorPlanFile}
        setFloorPlanFile={setFloorPlanFile}
        buildingFootprintFile={buildingFootprintFile}
        setBuildingFootprintFile={setBuildingFootprintFile}
      />

      {/* Section 06: Survey & 3D Data */}
      <Survey3DDataSection
        surveyData={surveyData}
        setSurveyData={setSurveyData}
      />

      {/* Section 07: Underground Infrastructure */}
      <UndergroundInfraSection
        layers={undergroundLayers}
        setLayers={setUndergroundLayers}
      />

      {/* Section 08, 09, 10: Data Validation & Preview */}
      <ValidationPreviewSection
        parcelId={parcelId}
        existingUlpin={existingUlpin}
        location={location}
        area={area}
        buildingName={buildingName}
        buildingCode={buildingCode}
        floorsAboveGround={floorsAboveGround}
        basements={basements}
        floorHeight={floorHeight}
        floorPlanFile={floorPlanFile}
        buildingFootprintFile={buildingFootprintFile}
        parsedUnits={parsedUnits}
        parsedOwnerships={parsedOwnerships}
        surveyData={surveyData}
        validationRulesPassed={validationRulesPassed}
        validationErrors={validationErrors}
      />

      {/* Section 11, 12, 13: Ready to Generate, Processing & Success */}
      <GeneratePropertySection
        parcelId={parcelId}
        buildingName={buildingName}
        floorsAboveGround={floorsAboveGround}
        basements={basements}
        unitsCount={parsedUnits.length}
        ownershipCount={parsedOwnerships.length}
        surveyDataSummary={surveyDataSummary}
        validationReady={validationRulesPassed}
        onStartGeneration={handleStartGeneration}
        isProcessing={isProcessing}
        processingStep={processingStep}
        generationSuccess={generationSuccess}
        onView3DProperty={() => setActiveTab('viewer3d')}
        onViewPropertyCard={() => setActiveTab('properties')}
        onGenerateReport={async () => {
          try {
            await downloadCadastralPDFReport({
              parcel: {
                id: `parcel-${parcelId}`,
                ulpin: existingUlpin,
                localParcelId: parcelId,
                locationName: location,
                city: city,
                latitude: latitude,
                longitude: longitude,
                areaSqM: area,
                landUse: landUse,
                buildingCount: 1,
                status: 'Verified',
                crs: 'EPSG:4326',
                surveyNumber: 'CS-101',
                village: 'Worli',
                taluk: 'Mumbai',
                district: 'Mumbai',
                boundaryGeoJSON: {
                  type: 'Feature',
                  geometry: { type: 'Polygon', coordinates: [] },
                  properties: {},
                },
              },
              building: {
                id: 'bldg-gen',
                parcelId: parcelId,
                buildingCode: buildingCode,
                buildingName: buildingName,
                buildingType: buildingType,
                numberOfFloors: floorsAboveGround,
                numberOfBasements: basements,
                floorHeightM: floorHeight,
                buildingHeightM: floorsAboveGround * floorHeight,
                footprintAreaSqM: area * 0.6,
                yearBuilt: 2024,
                structureType: 'RCC Framed Multi-Storey',
              },
              floor: {
                id: 'floor-gen-F1',
                buildingId: 'bldg-gen',
                buildingCode: buildingCode,
                floorCode: 'F1',
                floorName: 'Floor 1 - Residential',
                floorIndex: 1,
                zLevelM: 0,
                totalFloorAreaSqM: area * 0.6,
                measuredUnitAreaSumSqM: area * 0.5,
                validationStatus: 'VALID',
                unitCount: parsedUnits.length || 1,
                colorHex: '#3b82f6',
              },
              unit: {
                id: `unit-gen-${parsedUnits[0]?.unitId || '101'}`,
                unitNumber: parsedUnits[0]?.unitId || '101',
                unitCode: parsedUnits[0]?.unitId || '101',
                buildingId: 'bldg-gen',
                buildingCode: buildingCode,
                floorId: 'floor-gen-F1',
                floorCode: 'F1',
                full3DULPIN: `${existingUlpin}-${buildingCode}-F1-${parsedUnits[0]?.unitId || '101'}`,
                parentParcelULPIN: existingUlpin,
                unitType: parsedUnits[0]?.unitType || '2BHK Luxury',
                carpetAreaSqM: parsedUnits[0]?.areaSqM || 112.5,
                builtUpAreaSqM: (parsedUnits[0]?.areaSqM || 112.5) * 1.12,
                usage: 'Residential',
                sharePercentageOfLand: 100,
                status: 'Verified',
                colorHex: '#3b82f6',
                relativeBounds: { x: 0.05, y: 0.05, w: 0.43, d: 0.43 },
                polygon: [[10, 10], [90, 10], [90, 90], [10, 90]],
              },
              ownership: {
                id: 'own-gen-101',
                unitId: `unit-gen-${parsedUnits[0]?.unitId || '101'}`,
                unitCode: parsedUnits[0]?.unitId || '101',
                ownerName: parsedOwnerships[0]?.ownerName || 'Property Owner',
                ownerType: 'Individual',
                ownershipPercentage: 100,
                ownershipType: 'Freehold',
                docRefNo: parsedOwnerships[0]?.docRefNo || 'DOC-REG-2024-001',
                registrationDate: new Date().toISOString().split('T')[0],
                verificationStatus: 'Verified',
                contactEmail: 'owner@cadastre.gov.in',
                nationalIdMasked: 'XXXX-XXXX-1234',
                mortgageStatus: 'None',
              },
            });
          } catch (e) {
            console.error('PDF generation error:', e);
          }
        }}
      />
    </div>
  );
};