import { Building, UndergroundUtility } from '../types/cadastre';

export function generateBuildingUtilities(building: Building): UndergroundUtility[] {
  const bldgId = building.id;
  const code = building.buildingCode || 'BD';
  const basements = building.numberOfBasements || 2;
  const footprint = building.footprintAreaSqM || 800;

  // Calculate building footprint dimensions (half width & depth in meters)
  const sideLength = Math.sqrt(footprint);
  const halfW = Math.max(5, Math.min(10, sideLength / 2));
  const halfD = Math.max(5, Math.min(10, sideLength / 2));

  // Determine subterranean depth based on basement count
  const maxSewerDepth = -Math.max(3.5, basements * 2.5);

  // Deterministic seed offset based on building code to ensure distinct routing per building
  const seed = (code.charCodeAt(0) || 65) + (code.charCodeAt(1) || 66);
  const xOffset = ((seed % 5) - 2) * 0.8;
  const zOffset = (((seed * 3) % 5) - 2) * 0.8;

  return [
    {
      id: `util-water-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Water Pipeline',
      name: `${building.buildingName} Potable Water Main Line (${code}-W300)`,
      depthM: -2.2,
      diameterMm: 300,
      material: 'Ductile Iron Class K9',
      colorHex: '#0284c7',
      coordinates: [
        [-(halfW + 3) + xOffset, -2.2, -(halfD + 2) + zOffset],
        [-halfW + xOffset, -2.2, -halfD + zOffset],
        [0 + xOffset, -2.2, -halfD + zOffset],
        [0 + xOffset, -1.0, -(halfD - 2) + zOffset], // Basement intake riser
      ],
      status: 'Active',
    },
    {
      id: `util-sewer-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Sewer Line',
      name: `${building.buildingName} Sanitary Sewer Discharge Trunk (${code}-S450)`,
      depthM: maxSewerDepth,
      diameterMm: 450,
      material: 'Reinforced Concrete Pipe (RCC NP3)',
      colorHex: '#ea580c',
      coordinates: [
        [halfW - 2 + xOffset, maxSewerDepth + 1, halfD - 2 + zOffset], // Outlet from lowest basement
        [halfW + xOffset, maxSewerDepth, halfD + zOffset],
        [halfW + 4 + xOffset, maxSewerDepth - 0.5, halfD + 3 + zOffset],
      ],
      status: 'Active',
    },
    {
      id: `util-elec-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Electric Cable',
      name: `${building.buildingName} High Voltage Substation Feeder (${code}-E11kV)`,
      depthM: -1.5,
      diameterMm: 150,
      material: 'HDPE Double-Wall Corrugated Conduit',
      colorHex: '#eab308',
      coordinates: [
        [-(halfW + 4) + xOffset, -1.5, halfD + 2 + zOffset],
        [-halfW + xOffset, -1.5, halfD + zOffset],
        [-(halfW - 2) + xOffset, -1.5, halfD - 2 + zOffset],
      ],
      status: 'Active',
    },
    {
      id: `util-storm-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Storm Water Drain',
      name: `${building.buildingName} Perimeter Foundation Drainage (${code}-SW900)`,
      depthM: -3.2,
      diameterMm: 900,
      material: 'Precast Concrete Box Culvert',
      colorHex: '#10b981',
      coordinates: [
        [-halfW - 1 + xOffset, -3.2, -halfD - 1 + zOffset],
        [halfW + 1 + xOffset, -3.2, -halfD - 1 + zOffset],
        [halfW + 1 + xOffset, -3.2, halfD + 1 + zOffset],
        [-halfW - 1 + xOffset, -3.2, halfD + 1 + zOffset],
        [-halfW - 1 + xOffset, -3.2, -halfD - 1 + zOffset], // Perimeter foundation loop
      ],
      status: 'Active',
    },
    {
      id: `util-gas-${bldgId}`,
      buildingId: bldgId,
      parcelId: building.parcelId,
      type: 'Gas Pipeline',
      name: `${building.buildingName} Natural Gas PNG Line (${code}-G100)`,
      depthM: -1.8,
      diameterMm: 100,
      material: 'Carbon Steel PE Coated Pipe',
      colorHex: '#8b5cf6',
      coordinates: [
        [halfW + 3 + xOffset, -1.8, -(halfD + 3) + zOffset],
        [halfW + xOffset, -1.8, -halfD + zOffset],
        [halfW - 3 + xOffset, -1.8, -(halfD - 2) + zOffset],
      ],
      status: 'Active',
    },
  ];
}