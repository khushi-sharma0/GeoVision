import { Building, UndergroundUtility } from '../types/cadastre';

export function generateBuildingUtilities(building: Building): UndergroundUtility[] {
  const bldgId = building.id || 'bldg-1';
  const code = building.buildingCode || 'BA';
  const basements = building.numberOfBasements || 2;
  const footprint = building.footprintAreaSqM || 800;

  // Calculate building footprint half-dimensions (width & depth in meters)
  const sideLength = Math.sqrt(footprint);
  const halfW = Math.max(4.5, Math.min(12, sideLength / 2.2));
  const halfD = Math.max(4.5, Math.min(12, sideLength / 2.2));

  // Determine sewer depth based on basement count
  const maxSewerDepth = -Math.max(3.0, basements * 2.4);

  // Hash building code & name to create distinct entry routes and rotational offsets per building
  let hash = 0;
  const seedString = `${code}-${bldgId}-${building.buildingName}`;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const xShift = ((absHash % 7) - 3) * 0.9;
  const zShift = (((absHash >> 3) % 7) - 3) * 0.9;
  const entrySide = absHash % 4; // 0: North, 1: East, 2: South, 3: West

  // Water pipeline route varies by entry side
  let waterCoords: [number, number, number][];
  if (entrySide === 0) {
    waterCoords = [
      [-(halfW + 4) + xShift, -2.0, -(halfD + 3) + zShift],
      [0 + xShift, -2.0, -(halfD + 1) + zShift],
      [0 + xShift, -2.0, -halfD + zShift],
      [0 + xShift, -0.8, -(halfD - 2) + zShift],
    ];
  } else if (entrySide === 1) {
    waterCoords = [
      [(halfW + 4) + xShift, -2.2, 0 + zShift],
      [(halfW + 1) + xShift, -2.2, 0 + zShift],
      [halfW + xShift, -2.2, 0 + zShift],
      [(halfW - 2) + xShift, -0.8, 0 + zShift],
    ];
  } else if (entrySide === 2) {
    waterCoords = [
      [0 + xShift, -2.0, (halfD + 4) + zShift],
      [0 + xShift, -2.0, halfD + zShift],
      [0 + xShift, -0.8, (halfD - 2) + zShift],
    ];
  } else {
    waterCoords = [
      [-(halfW + 4) + xShift, -2.4, 2 + zShift],
      [-(halfW + 1) + xShift, -2.4, 2 + zShift],
      [-halfW + xShift, -2.4, 2 + zShift],
      [-(halfW - 2) + xShift, -0.8, 2 + zShift],
    ];
  }

  // Sewer pipeline route (runs from lowest basement out to main drain)
  const sewerCoords: [number, number, number][] = [
    [halfW - 2 + xShift, maxSewerDepth + 0.8, halfD - 2 + zShift],
    [halfW + 0.5 + xShift, maxSewerDepth, halfD + 0.5 + zShift],
    [halfW + 4.5 + xShift, maxSewerDepth - 0.6, halfD + 3.5 + zShift],
  ];

  // High Voltage Electrical conduit route
  const elecCoords: [number, number, number][] = [
    [-(halfW + 3) + xShift, -1.5, halfD + 3 + zShift],
    [-halfW + xShift, -1.5, halfD + zShift],
    [-(halfW - 2.5) + xShift, -1.5, halfD - 2.5 + zShift],
  ];

  // Storm Water Drain perimeter box loop matching exact building footprint bounds
  const stormCoords: [number, number, number][] = [
    [-halfW - 1 + xShift, -3.2, -halfD - 1 + zShift],
    [halfW + 1 + xShift, -3.2, -halfD - 1 + zShift],
    [halfW + 1 + xShift, -3.2, halfD + 1 + zShift],
    [-halfW - 1 + xShift, -3.2, halfD + 1 + zShift],
    [-halfW - 1 + xShift, -3.2, -halfD - 1 + zShift],
  ];

  // Gas pipeline PNG route
  const gasCoords: [number, number, number][] = [
    [halfW + 3 + xShift, -1.8, -(halfD + 3) + zShift],
    [halfW + xShift, -1.8, -halfD + zShift],
    [halfW - 2.5 + xShift, -1.8, -(halfD - 2.5) + zShift],
  ];

  return [
    {
      id: `util-water-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Water Pipeline',
      name: `${building.buildingName} Potable Water Supply (${code}-W300)`,
      depthM: -2.2,
      diameterMm: 300,
      material: 'Ductile Iron Class K9',
      colorHex: '#0284c7',
      coordinates: waterCoords,
      status: 'Active',
    },
    {
      id: `util-sewer-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Sewer Line',
      name: `${building.buildingName} Sanitary Sewer Outlet (${code}-S450)`,
      depthM: maxSewerDepth,
      diameterMm: 450,
      material: 'Reinforced Concrete Pipe (RCC NP3)',
      colorHex: '#ea580c',
      coordinates: sewerCoords,
      status: 'Active',
    },
    {
      id: `util-elec-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Electric Cable',
      name: `${building.buildingName} 11kV Power Feeder (${code}-E150)`,
      depthM: -1.5,
      diameterMm: 150,
      material: 'HDPE Double-Wall Corrugated Conduit',
      colorHex: '#eab308',
      coordinates: elecCoords,
      status: 'Active',
    },
    {
      id: `util-storm-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Storm Water Drain',
      name: `${building.buildingName} Foundation Perimeter Drain (${code}-SW900)`,
      depthM: -3.2,
      diameterMm: 900,
      material: 'Precast Concrete Box Culvert',
      colorHex: '#10b981',
      coordinates: stormCoords,
      status: 'Active',
    },
    {
      id: `util-gas-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Gas Pipeline',
      name: `${building.buildingName} PNG Natural Gas Supply (${code}-G100)`,
      depthM: -1.8,
      diameterMm: 100,
      material: 'Carbon Steel PE Coated Pipe',
      colorHex: '#8b5cf6',
      coordinates: gasCoords,
      status: 'Active',
    },
  ];
}