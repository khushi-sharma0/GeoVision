/**
 * GeoVision Cadastral 3D ULPIN Generation & Parsing Suite
 * Conforms to ISO 19152 LADM (Land Administration Domain Model)
 * and Indian Unique Land Parcel Identification Number standards.
 */

export function formatFloorCode(floor: string | number): string {
  const str = String(floor).trim().toUpperCase();
  if (str === 'TERRACE' || str === 'T') return 'TER';
  if (str === 'GROUND' || str === 'GROUND FLOOR' || str === 'GF' || str === '0') return 'GF';
  if (str.startsWith('B') || str.startsWith('BASEMENT')) {
    const num = str.replace(/\D/g, '') || '1';
    return `B${num}`;
  }
  const num = str.replace(/\D/g, '');
  return num ? `F${num}` : str;
}

export function formatUnitCode(unit: string | number): string {
  const str = String(unit).trim().toUpperCase();
  if (str.startsWith('U')) return str;
  const num = str.replace(/\D/g, '');
  if (num.length <= 2) {
    return `U${num.padStart(2, '0')}`;
  }
  return `U${num}`;
}

export function formatBuildingCode(building: string): string {
  const str = building.trim().toUpperCase();
  if (str.length <= 3 && /^[A-Z0-9]+$/.test(str)) return str;
  // If building is like "Building A" or "Tower 1"
  const match = str.match(/BUILDING\s*([A-Z0-9]+)|TOWER\s*([A-Z0-9]+)|BLOCK\s*([A-Z0-9]+)/i);
  if (match) {
    const code = match[1] || match[2] || match[3];
    return `B${code}`;
  }
  return str.slice(0, 3).replace(/[^A-Z0-9]/g, 'A');
}

/**
 * Main 3D ULPIN Generator according to specification
 * Example: 27101500123456 + BA + F3 + U03 => 27101500123456-BA-F3-U03
 */
export function generateULPIN(
  existingULPIN: string,
  buildingCode: string,
  floorNumber: string | number,
  unitNumber: string | number
): string {
  const cleanParcel = existingULPIN.trim();
  const bCode = formatBuildingCode(buildingCode);
  const fCode = formatFloorCode(floorNumber);
  const uCode = formatUnitCode(unitNumber);

  return `${cleanParcel}-${bCode}-${fCode}-${uCode}`;
}

export interface ParsedULPIN {
  raw: string;
  parcelULPIN: string;
  buildingCode?: string;
  floorCode?: string;
  unitCode?: string;
  is3D: boolean;
  isValid: boolean;
}

export function parse3DULPIN(ulpin: string): ParsedULPIN {
  const trimmed = ulpin.trim();
  const parts = trimmed.split('-');
  
  if (parts.length >= 4) {
    // E.g., 27101500123456-BA-F3-U03 or KA-BLR-2024-0001-0001-F3-303
    return {
      raw: trimmed,
      parcelULPIN: parts[0],
      buildingCode: parts[1],
      floorCode: parts[2],
      unitCode: parts[3],
      is3D: true,
      isValid: true,
    };
  }

  return {
    raw: trimmed,
    parcelULPIN: trimmed,
    is3D: false,
    isValid: trimmed.length >= 6,
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
