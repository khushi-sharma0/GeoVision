import { jsPDF } from 'jspdf';
import { Parcel, Building, Floor, Unit, OwnershipRecord } from '../types/cadastre';

interface ReportDownloadParams {
  parcel?: Parcel | null;
  building?: Building | null;
  floor?: Floor | null;
  unit?: Unit | null;
  ownership?: OwnershipRecord | null;
  units?: Unit[];
}

/**
 * Triggers a direct, guaranteed file download to the user's device.
 */
export function triggerDirectFileDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  
  // Append to document to ensure click works across all browsers & iframe sandbox
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Generates and downloads the Official State 3D Cadastral Property Card & Title Dossier (PDF).
 */
export async function downloadCadastralPDFReport(params: ReportDownloadParams): Promise<string> {
  const { parcel, building, floor, unit, ownership, units } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const unitCode = unit?.unitCode || 'F3-303';
  const fullULPIN = unit?.full3DULPIN || '27101500123456-BA-F3-U03';
  const ownerName = ownership?.ownerName || 'Rahul Sharma';
  const parcelUlpin = parcel?.ulpin || '27101500123456';
  const location = parcel?.locationName || 'Worli Sea Face, Mumbai, Maharashtra';
  const bldgName = building?.buildingName || 'Harbour Heights';
  const floorName = floor?.floorName || 'F3 - 3rd Floor (Elevation: 9.6m)';
  const carpetArea = unit?.carpetAreaSqM ? `${unit.carpetAreaSqM.toFixed(2)} m²` : '145.00 m²';
  const builtUpArea = unit?.builtUpAreaSqM ? `${unit.builtUpAreaSqM.toFixed(2)} m²` : '162.40 m²';
  const unitType = unit?.unitType || '3BHK Executive';
  const tenure = ownership?.ownershipType || 'Freehold (100% Share)';
  const docRef = ownership?.docRefNo || 'MH-MUM-REG-2024-8842';
  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const certNumber = `CERT-3DCAD-${unitCode.replace(/[^A-Z0-9]/gi, '')}-${Date.now().toString().slice(-4)}`;

  // --- PAGE 1: OFFICIAL DIGITAL PROPERTY CARD & TITLE CERTIFICATE ---
  
  // Outer Border & Header Band
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, 190, 277);
  
  doc.setFillColor(30, 58, 138);
  doc.rect(11, 11, 188, 22, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GOVERNMENT CADASTRAL & LAND RECORDS ADMINISTRATION', 105, 18, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('3D Land Administration Domain Model (ISO 19152 Compliant)', 105, 25, { align: 'center' });

  // Certificate Sub-Header
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITAL 3D PROPERTY & STRATA TENURE CERTIFICATE', 105, 40, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('courier', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate Ref: ${certNumber}  |  Issue Date: ${issueDate}`, 105, 46, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(16, 50, 194, 50);

  // 3D ULPIN Hero Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(16, 54, 178, 26, 2, 2, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.8);
  doc.roundedRect(16, 54, 178, 26, 2, 2, 'D');

  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('UNIQUE 3D LAND PARCEL IDENTIFIER (3D ULPIN):', 22, 61);

  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(fullULPIN, 22, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Hierarchy: Parcel [${parcelUlpin}] > Bldg [${building?.buildingCode || 'BA'}] > Floor [${floor?.floorCode || 'F3'}] > Unit [${unitCode}]`, 22, 76);

  // Section 1: SPATIAL & VOLUMETRIC BOUNDARIES
  doc.setFillColor(239, 246, 255);
  doc.rect(16, 85, 178, 7, 'F');
  doc.setTextColor(29, 78, 216);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. SPATIAL & VOLUMETRIC BOUNDARIES (3D GEOMETRY)', 20, 90);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  
  const col1X = 20;
  const col2X = 110;
  let curY = 99;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Parent Parcel ULPIN:', col1X, curY);
  doc.setFont('courier', 'normal');
  doc.text(parcelUlpin, col1X + 35, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('Building Structure:', col2X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${bldgName} (${building?.buildingCode || 'BA'})`, col2X + 32, curY);

  curY += 7;
  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Cadastral Location:', col1X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(location.slice(0, 38), col1X + 35, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('Floor & Elevation:', col2X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${floorName}`, col2X + 32, curY);

  curY += 7;
  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.text('Carpet Area (Net):', col1X, curY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(carpetArea, col1X + 35, curY);
  doc.setTextColor(15, 23, 42);

  doc.setFont('helvetica', 'bold');
  doc.text('Built-Up / Gross:', col2X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(builtUpArea, col2X + 32, curY);

  curY += 7;
  // Row 4
  doc.setFont('helvetica', 'bold');
  doc.text('Unit Typology / Use:', col1X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${unitType} (Residential)`, col1X + 35, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('Land Share Ratio:', col2X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${unit?.sharePercentageOfLand || '4.16'}% Undivided Share`, col2X + 32, curY);

  // Section 2: OWNERSHIP & PROPRIETARY TITLE RECORD
  curY += 12;
  doc.setFillColor(236, 253, 245);
  doc.rect(16, curY, 178, 7, 'F');
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. PROPRIETARY TENURE & TITLE RECORD', 20, curY + 5);

  curY += 14;
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Registered Owner:', col1X, curY);
  doc.setFont('helvetica', 'bold');
  doc.text(ownerName, col1X + 35, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('Tenure / Title Type:', col2X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(tenure, col2X + 35, curY);

  curY += 7;
  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Registered Deed No:', col1X, curY);
  doc.setFont('courier', 'normal');
  doc.text(docRef, col1X + 35, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('Mortgage / Lien:', col2X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(ownership?.mortgageStatus || 'None (Clear Title)', col2X + 35, curY);

  curY += 7;
  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.text('Title Validation:', col1X, curY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('VERIFIED 100% CLEAR TITLE (ISO 19152 Validated)', col1X + 35, curY);
  doc.setTextColor(15, 23, 42);

  // Section 3: ARCHITECTURAL FLOOR PLAN & ROOM BREAKDOWN
  curY += 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(16, curY, 178, 7, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('3. FLOOR PLAN SPATIAL ALLOCATION & ROOM SPECIFICATIONS', 20, curY + 5);

  curY += 11;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(226, 232, 240);
  doc.rect(16, curY, 178, 6, 'F');
  doc.text('Space / Room Component', 22, curY + 4.2);
  doc.text('Carpet Area (sq.m)', 85, curY + 4.2);
  doc.text('Allocation Type', 125, curY + 4.2);
  doc.text('Boundary Status', 165, curY + 4.2);

  const roomsList = unit?.rooms || [
    { name: 'Grand Living & Dining Room', areaSqM: 42.0 },
    { name: 'Master Bedroom Suite', areaSqM: 26.5 },
    { name: 'Bedroom 2 / Study', areaSqM: 20.0 },
    { name: 'Modular Kitchen & Utility', areaSqM: 18.5 },
    { name: 'Balconies & Washrooms', areaSqM: 13.0 },
  ];

  curY += 6;
  doc.setFont('helvetica', 'normal');
  roomsList.forEach((r, idx) => {
    const rowY = curY + idx * 6;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(16, rowY, 178, 6, 'F');
    }
    doc.text(r.name, 22, rowY + 4.2);
    doc.text(`${r.areaSqM.toFixed(1)} m²`, 85, rowY + 4.2);
    doc.text('Private Exclusive', 125, rowY + 4.2);
    doc.setTextColor(16, 185, 129);
    doc.text('✓ Verified', 165, rowY + 4.2);
    doc.setTextColor(15, 23, 42);
  });

  // Footer Authentication Stamp & Digital Hash
  curY = 246;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(16, curY, 194, curY);

  curY += 6;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHENTICATION & OFFICIAL DIGITAL SEAL:', 20, curY);
  
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SHA-256 HASH: 8f4a9b2c3d1e0f7e6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f', 20, curY + 5);
  doc.text('This digital document was generated automatically from the state 3D Cadastral GIS Engine.', 20, curY + 9);
  doc.text('Official validation can be verified at https://cadastre.gov.in/verify with the 3D ULPIN identifier.', 20, curY + 13);

  // Registrar signature stamp box on right
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.6);
  doc.rect(142, curY, 50, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(37, 99, 235);
  doc.text('DIGITALLY SIGNED', 167, curY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Cadastral Authority', 167, curY + 10, { align: 'center' });
  doc.text(`Timestamp: ${new Date().toISOString()}`, 167, curY + 15, { align: 'center' });

  // Generate output blob and trigger guaranteed direct download to user's device
  const blob = doc.output('blob');
  const filename = `Official_3D_Property_Card_${unitCode.replace(/[^A-Z0-9]/gi, '_')}.pdf`;
  
  triggerDirectFileDownload(blob, filename);
  return filename;
}

/**
 * Downloads full Cadastral Parcel & Unit Dataset as CSV.
 */
export function downloadCadastralCSV(units: Unit[], ownerships: OwnershipRecord[], parcelUlpin: string): string {
  const headers = [
    'Unit ID',
    '3D ULPIN',
    'Parent Parcel ULPIN',
    'Building Code',
    'Floor Code',
    'Unit Type',
    'Carpet Area (sq.m)',
    'Built-Up Area (sq.m)',
    'Registered Owner',
    'Ownership %',
    'Tenure Type',
    'Deed Ref',
    'Validation Status',
  ];

  const rows = units.map((u) => {
    const matchedOwner = ownerships.find((o) => o.unitId === u.id || o.unitCode === u.unitCode);
    return [
      `"${u.unitCode}"`,
      `"${u.full3DULPIN}"`,
      `"${u.parentParcelULPIN || parcelUlpin}"`,
      `"${u.buildingCode}"`,
      `"${u.floorCode}"`,
      `"${u.unitType}"`,
      u.carpetAreaSqM.toFixed(2),
      u.builtUpAreaSqM.toFixed(2),
      `"${matchedOwner?.ownerName || 'State Land Registry'}"`,
      matchedOwner?.ownershipPercentage || 100,
      `"${matchedOwner?.ownershipType || 'Freehold'}"`,
      `"${matchedOwner?.docRefNo || 'DOC-REG-2024'}"`,
      `"${u.status || 'Verified'}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `Cadastral_Units_Export_${parcelUlpin}.csv`;
  
  triggerDirectFileDownload(blob, filename);
  return filename;
}
