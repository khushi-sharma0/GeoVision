import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useCadastre } from '../../context/CadastreContext';
import {
  RotateCcw,
  Layers,
  Maximize2,
  Minimize2,
  Box,
  Compass,
  Sparkles,
} from 'lucide-react';

interface CadastreScene3DProps {
  onSelectUnit?: (unitId: string) => void;
  onSelectFloor?: (floorId: string) => void;
  isExploded?: boolean;
}

export const CadastreScene3D: React.FC<CadastreScene3DProps> = ({
  onSelectUnit,
  onSelectFloor,
  isExploded: externalExploded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isDark,
    selectedBuilding,
    floors,
    units,
    selectedFloorId,
    selectedUnitId,
    setSelectedFloorId,
    setSelectedUnitId,
    layers,
  } = useCadastre();

  const [isExploded, setIsExploded] = useState<boolean>(externalExploded || false);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqAnimRef = useRef<number | null>(null);
  const interactiveMeshesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraOrbitRef = useRef<{ theta: number; phi: number; radius: number; target: THREE.Vector3 }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 38,
    target: new THREE.Vector3(0, 8, 0),
  });

  const bldgFloors = useMemo(() => {
    return floors
      .filter((f) => f.buildingId === (selectedBuilding?.id || 'bldg-1'))
      .sort((a, b) => b.floorIndex - a.floorIndex);
  }, [floors, selectedBuilding]);

  // Handle camera update helper
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius, target } = cameraOrbitRef.current;
    
    // Clamp phi to prevent flip
    const clampedPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi));
    cameraOrbitRef.current.phi = clampedPhi;

    const x = target.x + radius * Math.sin(clampedPhi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(clampedPhi);
    const z = target.z + radius * Math.sin(clampedPhi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  };

  // Reset Camera
  const resetCamera = () => {
    cameraOrbitRef.current = {
      theta: Math.PI / 3.8,
      phi: Math.PI / 3.2,
      radius: 36,
      target: new THREE.Vector3(0, 8, 0),
    };
    updateCameraPosition();
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDark ? 0x090d16 : 0xebf1f8);
    scene.fog = new THREE.FogExp2(isDark ? 0x090d16 : 0xebf1f8, 0.012);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x334155 : 0xffffff, isDark ? 1.4 : 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(25, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x93c5fd, 0.8);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // Dynamic building dimensions based on selected property details
    const footprint = selectedBuilding?.footprintAreaSqM || 250;
    const bWidth = Math.min(35, Math.max(10, Math.sqrt(footprint)));
    const bDepth = bWidth;
    const floorHeight = selectedBuilding?.floorHeightM || 3.0;

    // 5. Environment & Cadastral Terrain
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0xe2e8f0,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    // Roads & Urban Grids
    const roadGroup = new THREE.Group();
    const roadMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0xcbd5e1,
      roughness: 0.9,
    });
    
    // Main Avenue
    const road1 = new THREE.Mesh(new THREE.PlaneGeometry(160, 12), roadMat);
    road1.rotation.x = -Math.PI / 2;
    road1.position.set(0, 0.01, -22);
    roadGroup.add(road1);

    // Cross Street
    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 160), roadMat);
    road2.rotation.x = -Math.PI / 2;
    road2.position.set(24, 0.01, 0);
    roadGroup.add(road2);

    // Road markings
    const lineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x64748b : 0xffffff });
    for (let i = -70; i < 70; i += 10) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.4), lineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(i, 0.02, -22);
      roadGroup.add(dash);
    }
    scene.add(roadGroup);

    // Surrounding context buildings
    const contextGroup = new THREE.Group();
    const contextMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0xd1d5db,
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.65,
    });

    const contextCoords = [
      { x: -28, z: -8, w: 14, h: 18, d: 14 },
      { x: -30, z: 18, w: 16, h: 26, d: 16 },
      { x: 2, z: 28, w: 18, h: 12, d: 12 },
      { x: -22, z: -38, w: 20, h: 22, d: 16 },
      { x: 38, z: -15, w: 14, h: 30, d: 14 },
      { x: 38, z: 18, w: 16, h: 15, d: 18 },
    ];

    contextCoords.forEach((c) => {
      const bGeo = new THREE.BoxGeometry(c.w, c.h, c.d);
      const bMesh = new THREE.Mesh(bGeo, contextMat);
      bMesh.position.set(c.x, c.h / 2, c.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      contextGroup.add(bMesh);

      const edges = new THREE.EdgesGeometry(bGeo);
      const edgeLine = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: isDark ? 0x334155 : 0x94a3b8, transparent: true, opacity: 0.4 })
      );
      bMesh.add(edgeLine);
    });
    scene.add(contextGroup);

    // Dynamic Cadastral Parcel Boundary based on Parcel Land Area
    const pSize = Math.max(bWidth + 6, Math.sqrt(selectedBuilding ? (selectedBuilding.footprintAreaSqM ? selectedBuilding.footprintAreaSqM / 0.6 : 1250) : 1250));
    const parcelGeo = new THREE.BoxGeometry(pSize, 0.05, pSize);
    const parcelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.18,
    });
    const parcelMesh = new THREE.Mesh(parcelGeo, parcelMat);
    parcelMesh.position.set(0, 0.03, 0);
    scene.add(parcelMesh);

    // Parcel border outline
    const parcelEdgeGeo = new THREE.EdgesGeometry(parcelGeo);
    const parcelEdgeLine = new THREE.LineSegments(
      parcelEdgeGeo,
      new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 })
    );
    parcelEdgeLine.position.set(0, 0.05, 0);
    scene.add(parcelEdgeLine);

    // 6. Tree clusters for realism
    const treeMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x15803d : 0x22c55e, roughness: 0.9 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const treePositions = [
      [-10, 0, -14], [-12, 0, 12], [11, 0, -14], [12, 0, 12],
      [-14, 0, -5], [14, 0, 5], [-8, 0, 14], [10, 0, 14]
    ];
    treePositions.forEach(([tx, _, tz]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6), trunkMat);
      trunk.position.set(tx, 0.75, tz);
      trunk.castShadow = true;
      scene.add(trunk);

      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.8, 6), treeMat);
      crown.position.set(tx, 2.5, tz);
      crown.castShadow = true;
      scene.add(crown);
    });

    // 7. Interactive 3D Building Floor & Unit Assembly
    interactiveMeshesRef.current = {};
    const buildingGroup = new THREE.Group();
    buildingGroup.name = 'CadastreBuilding';

    const slabThickness = 0.2;

    const aboveGroundFloors = bldgFloors.filter((f) => f.floorIndex > 0).sort((a, b) => a.floorIndex - b.floorIndex);
    const maxAboveIndex = aboveGroundFloors.length > 0 ? Math.max(...aboveGroundFloors.map((f) => f.floorIndex)) : 6;

    // Auto calculate camera target & radius to frame building perfectly
    const totalBuildingHeight = maxAboveIndex * floorHeight;
    const centerY = Math.max(3.5, totalBuildingHeight / 2);
    cameraOrbitRef.current.target.set(0, centerY, 0);
    cameraOrbitRef.current.radius = Math.max(28, totalBuildingHeight * 1.6);
    updateCameraPosition();

    const animatedFloorGroups: Array<{ group: THREE.Group; targetY: number; floorIndex: number }> = [];
    const sortedFloors = [...bldgFloors].sort((a, b) => a.floorIndex - b.floorIndex);

    sortedFloors.forEach((fl) => {
      const floorIndex = fl.floorIndex;
      const isBasement = floorIndex < 0;

      let baseY: number;
      if (isBasement) {
        const explodeOffset = isExploded ? Math.abs(floorIndex) * 1.8 : 0;
        baseY = floorIndex * floorHeight - explodeOffset;
      } else {
        const floorStep = floorIndex - 1;
        const explodeOffset = isExploded ? floorStep * 2.5 : 0;
        baseY = floorStep * floorHeight + explodeOffset;
      }

      const floorLevelGroup = new THREE.Group();
      floorLevelGroup.position.set(0, baseY, 0);

      const isSelectedFloor = fl.id === selectedFloorId;
      const floorUnits = units.filter((u) => u.floorId === fl.id);

      // 1. Dynamic Floor Plan Architectural Canvas Texture for the Slab
      const slabCanvas = document.createElement('canvas');
      slabCanvas.width = 512;
      slabCanvas.height = 512;
      const ctx = slabCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = isDark ? (isSelectedFloor ? '#1e3a8a' : '#0f172a') : (isSelectedFloor ? '#dbeafe' : '#f8fafc');
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(59, 130, 246, 0.12)';
        ctx.lineWidth = 1;
        for (let i = 20; i < 512; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 512);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(512, i);
          ctx.stroke();
        }

        ctx.strokeStyle = isDark ? '#38bdf8' : '#2563eb';
        ctx.lineWidth = 4;
        ctx.strokeRect(16, 16, 480, 480);

        ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
        ctx.fillRect(16, 226, 480, 60);
        ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(16, 226, 480, 60);
        ctx.setLineDash([]);

        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CENTRAL ACCESS CORRIDOR & PASSAGEWAY', 256, 261);

        ctx.fillStyle = isDark ? '#0284c7' : '#3b82f6';
        ctx.fillRect(216, 16, 80, 480);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.strokeRect(216, 16, 80, 480);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('LIFT 1', 256, 120);
        ctx.fillText('LIFT 2', 256, 150);
        ctx.fillText('STAIRS', 256, 370);
        ctx.fillText('CORE', 256, 400);

        // Dynamic Unit Zones drawn on slab blueprint canvas based on actual floor units
        const uCount = floorUnits.length;
        const cols = uCount <= 2 ? Math.max(1, uCount) : Math.ceil(Math.sqrt(uCount));
        const rows = Math.ceil(uCount / (cols || 1));
        const pad = 24;
        const availW = 512 - pad * 2;
        const availH = 512 - pad * 2;
        const unitCanvasW = (availW / cols) - 10;
        const unitCanvasH = (availH / rows) - 10;

        floorUnits.forEach((u, idx) => {
          const r = Math.floor(idx / cols);
          const c = idx % cols;
          const qx = pad + c * (unitCanvasW + 10);
          const qy = pad + r * (unitCanvasH + 10);
          const unitLabel = `UNIT ${u.unitCode}`;
          const carpetLabel = `${u.carpetAreaSqM.toFixed(1)} m²`;
          const isSelected = u.id === selectedUnitId;

          ctx.fillStyle = isSelected
            ? 'rgba(59, 130, 246, 0.4)'
            : isDark
            ? 'rgba(30, 41, 59, 0.7)'
            : 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(qx, qy, unitCanvasW, unitCanvasH);

          ctx.strokeStyle = isSelected ? '#3b82f6' : isDark ? '#475569' : '#cbd5e1';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.strokeRect(qx, qy, unitCanvasW, unitCanvasH);

          ctx.fillStyle = isSelected ? '#ffffff' : isDark ? '#e2e8f0' : '#1e293b';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(unitLabel, qx + unitCanvasW / 2, qy + 22);

          ctx.font = '10px sans-serif';
          ctx.fillStyle = isDark ? '#93c5fd' : '#2563eb';
          ctx.fillText(carpetLabel, qx + unitCanvasW / 2, qy + 38);

          ctx.font = '8px sans-serif';
          ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
          ctx.fillText((u.unitType || 'RESIDENTIAL').toUpperCase(), qx + unitCanvasW / 2, qy + Math.max(50, unitCanvasH - 12));
        });
      }

      const slabTexture = new THREE.CanvasTexture(slabCanvas);
      slabTexture.anisotropy = 4;

      const slabGeo = new THREE.BoxGeometry(bWidth + 0.6, slabThickness, bDepth + 0.6);
      const slabMaterials = [
        new THREE.MeshStandardMaterial({ color: isDark ? 0x1e293b : 0xcbd5e1, roughness: 0.5 }),
        new THREE.MeshStandardMaterial({ color: isDark ? 0x1e293b : 0xcbd5e1, roughness: 0.5 }),
        new THREE.MeshStandardMaterial({ map: slabTexture, roughness: 0.2, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: isDark ? 0x0f172a : 0x94a3b8, roughness: 0.6 }),
        new THREE.MeshStandardMaterial({ color: isDark ? 0x1e293b : 0xcbd5e1, roughness: 0.5 }),
        new THREE.MeshStandardMaterial({ color: isDark ? 0x1e293b : 0xcbd5e1, roughness: 0.5 }),
      ];

      const slabMesh = new THREE.Mesh(slabGeo, slabMaterials);
      slabMesh.position.set(0, slabThickness / 2, 0);
      slabMesh.castShadow = !isBasement;
      slabMesh.receiveShadow = true;
      floorLevelGroup.add(slabMesh);

      // Core Column
      const coreWidth = 2.4;
      const coreDepth = bDepth * 0.95;
      const coreHeight = floorHeight - slabThickness;
      const coreColGeo = new THREE.BoxGeometry(coreWidth, coreHeight, coreDepth);
      const coreColMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x0284c7 : 0x3b82f6,
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: isSelectedFloor ? 0.85 : 0.6,
      });
      const coreColMesh = new THREE.Mesh(coreColGeo, coreColMat);
      coreColMesh.position.set(0, slabThickness + coreHeight / 2, 0);
      coreColMesh.castShadow = true;
      floorLevelGroup.add(coreColMesh);

      // Corridor
      const corridorWidth = bWidth * 0.95;
      const corridorDepth = 1.8;
      const corridorGeo = new THREE.BoxGeometry(corridorWidth, 0.08, corridorDepth);
      const corridorMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x334155 : 0x94a3b8,
        roughness: 0.6,
        transparent: true,
        opacity: 0.5,
      });
      const corridorMesh = new THREE.Mesh(corridorGeo, corridorMat);
      corridorMesh.position.set(0, floorHeight - 0.05, 0);
      floorLevelGroup.add(corridorMesh);

      // Outer Structural Enclosure
      const enclosureGeo = new THREE.BoxGeometry(bWidth, floorHeight, bDepth);
      
      let floorColor = new THREE.Color(fl.colorHex || '#1d4ed8');
      if (isSelectedFloor) {
        floorColor = new THREE.Color(isDark ? '#6366f1' : '#1d4ed8');
      }

      const enclosureMat = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: isSelectedFloor ? 0.38 : isBasement ? 0.45 : 0.22,
        wireframe: wireframeMode,
      });

      const floorMesh = new THREE.Mesh(enclosureGeo, enclosureMat);
      floorMesh.position.set(0, floorHeight / 2, 0);
      floorMesh.castShadow = !isBasement;
      floorMesh.userData = { type: 'floor', floorId: fl.id, floorCode: fl.floorCode };
      floorLevelGroup.add(floorMesh);
      interactiveMeshesRef.current[`floor-${fl.id}`] = floorMesh;

      const edges = new THREE.EdgesGeometry(enclosureGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: isSelectedFloor ? (isDark ? 0x22d3ee : 0x1d4ed8) : isDark ? 0x475569 : 0x94a3b8,
          linewidth: isSelectedFloor ? 2 : 1,
        })
      );
      floorMesh.add(line);

      // 4. Floor Unit Compartments
      if (floorUnits.length > 0) {
        floorUnits.forEach((u, uIdx) => {
          const isSelectedUnit = u.id === selectedUnitId;
          
          // Compute precise dynamic spatial bounding box conforming to actual floor unit count
          const fUnitCount = floorUnits.length;
          const fCols = fUnitCount <= 2 ? Math.max(1, fUnitCount) : Math.ceil(Math.sqrt(fUnitCount));
          const fRows = Math.ceil(fUnitCount / (fCols || 1));
          const gridC = uIdx % fCols;
          const gridR = Math.floor(uIdx / fCols);

          const rawW = u.relativeBounds?.w || +(0.86 / fCols).toFixed(2);
          const rawD = u.relativeBounds?.d || +(0.86 / fRows).toFixed(2);
          const rawX = u.relativeBounds?.x !== undefined ? u.relativeBounds.x : +(0.05 + gridC * (0.90 / fCols)).toFixed(2);
          const rawY = u.relativeBounds?.y !== undefined ? u.relativeBounds.y : +(0.05 + gridR * (0.90 / fRows)).toFixed(2);

          const uWidth = (bWidth - 1.2) * rawW;
          const uDepth = (bDepth - 1.2) * rawD;
          const uHeight = (floorHeight - slabThickness) * 0.92;

          const uX = -bWidth / 2 + 0.6 + rawX * (bWidth - 1.2) + uWidth / 2;
          const uZ = -bDepth / 2 + 0.6 + rawY * (bDepth - 1.2) + uDepth / 2;
          const uY = slabThickness + uHeight / 2;

          const unitGeo = new THREE.BoxGeometry(uWidth, uHeight, uDepth);
          const unitColor = isSelectedUnit
            ? new THREE.Color(isDark ? 0x22d3ee : 0x1d4ed8)
            : new THREE.Color(u.colorHex || '#0f766e');

          const unitMat = new THREE.MeshStandardMaterial({
            color: unitColor,
            roughness: 0.25,
            metalness: 0.15,
            transparent: true,
            opacity: isSelectedUnit ? 0.95 : isSelectedFloor ? 0.72 : 0.48,
            emissive: isSelectedUnit ? new THREE.Color(isDark ? 0x22d3ee : 0x1d4ed8) : new THREE.Color(0x000000),
            emissiveIntensity: isSelectedUnit ? 0.45 : 0.0,
            wireframe: wireframeMode,
          });

          const unitMesh = new THREE.Mesh(unitGeo, unitMat);
          unitMesh.position.set(uX, uY, uZ);
          unitMesh.castShadow = true;
          unitMesh.userData = {
            type: 'unit',
            unitId: u.id,
            unitCode: u.unitCode,
            floorId: fl.id,
            ulpin: u.full3DULPIN,
          };

          const unitEdge = new THREE.LineSegments(
            new THREE.EdgesGeometry(unitGeo),
            new THREE.LineBasicMaterial({
              color: isSelectedUnit ? 0xffffff : 0x000000,
              transparent: true,
              opacity: isSelectedUnit ? 1 : 0.4,
            })
          );
          unitMesh.add(unitEdge);

          // Interior Room Partition Walls
          const roomPartitionGeo = new THREE.BoxGeometry(uWidth * 0.9, uHeight * 0.85, 0.12);
          const partitionMat = new THREE.MeshStandardMaterial({
            color: isDark ? 0x334155 : 0xe2e8f0,
            roughness: 0.7,
            transparent: true,
            opacity: isSelectedUnit ? 0.9 : 0.4,
          });
          const partitionMesh = new THREE.Mesh(roomPartitionGeo, partitionMat);
          partitionMesh.position.set(0, 0, -uDepth * 0.1);
          unitMesh.add(partitionMesh);

          // External Balcony
          const balconyGeo = new THREE.BoxGeometry(uWidth * 0.75, 0.1, 1.2);
          const balconyMat = new THREE.MeshStandardMaterial({
            color: isDark ? 0x1e293b : 0xcbd5e1,
            roughness: 0.4,
          });
          const balconyMesh = new THREE.Mesh(balconyGeo, balconyMat);
          const balconyZOffset = rawY > 0.5 ? uDepth / 2 + 0.6 : -uDepth / 2 - 0.6;
          balconyMesh.position.set(0, -uHeight / 2 + 0.05, balconyZOffset);
          unitMesh.add(balconyMesh);

          // Balcony Glass Railing
          const railingGeo = new THREE.BoxGeometry(uWidth * 0.75, 0.7, 0.05);
          const railingMat = new THREE.MeshStandardMaterial({
            color: isDark ? 0x38bdf8 : 0x60a5fa,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
          });
          const railingMesh = new THREE.Mesh(railingGeo, railingMat);
          railingMesh.position.set(0, 0.4, rawY > 0.5 ? 0.6 : -0.6);
          balconyMesh.add(railingMesh);

          floorLevelGroup.add(unitMesh);
          interactiveMeshesRef.current[`unit-${u.id}`] = unitMesh;
        });
      }

      // Floor Level Text Badge
      const indicatorGeo = new THREE.BoxGeometry(0.2, 0.6, 1.4);
      const indicatorMat = new THREE.MeshBasicMaterial({
        color: isSelectedFloor ? (isDark ? 0x22d3ee : 0x1d4ed8) : isDark ? 0x334155 : 0x64748b,
      });
      const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
      indicator.position.set(bWidth / 2 + 0.3, floorHeight / 2, 0);
      floorLevelGroup.add(indicator);

      buildingGroup.add(floorLevelGroup);
      animatedFloorGroups.push({
        group: floorLevelGroup,
        targetY: baseY,
        floorIndex: floorIndex,
      });
    });

    // Terrace Roof Fixtures
    const roofBaseY = maxAboveIndex * floorHeight + (isExploded ? (maxAboveIndex - 1) * 2.5 : 0);
    const coreGeo = new THREE.BoxGeometry(4.5, 2.8, 4.5);
    const coreMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x334155 : 0x94a3b8 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, roofBaseY + 1.4, 0);
    buildingGroup.add(coreMesh);

    scene.add(buildingGroup);

    // 8. Underground Utilities
    if (layers.undergroundInfra) {
      const utilGroup = new THREE.Group();
      utilGroup.name = 'UndergroundPipes';

      const pipeConfigs = [
        { color: 0x1d4ed8, radius: 0.35, y: -2.5, z: -8, label: 'Water' },
        { color: 0xd97706, radius: 0.45, y: -5.0, z: -3, label: 'Sewer' },
        { color: 0xca8a04, radius: 0.25, y: -1.8, z: 4, label: 'Electric' },
        { color: 0x0f766e, radius: 0.55, y: -3.5, z: 8, label: 'Stormwater' },
        { color: 0x7c3aed, radius: 0.22, y: -2.0, z: -12, label: 'Gas' },
      ];

      pipeConfigs.forEach((p) => {
        const pipeGeo = new THREE.CylinderGeometry(p.radius, p.radius, 32, 16);
        const pipeMat = new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: 0.2,
          metalness: 0.5,
          emissive: new THREE.Color(p.color),
          emissiveIntensity: 0.25,
        });
        const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
        pipeMesh.rotation.z = Math.PI / 2;
        pipeMesh.position.set(0, p.y, p.z);
        utilGroup.add(pipeMesh);
      });
      scene.add(utilGroup);
    }

    // 9. Animation & Render Loop
    const animStartTime = performance.now();
    const animate = () => {
      reqAnimRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = now - animStartTime;

      animatedFloorGroups.forEach(({ group, targetY, floorIndex }) => {
        const normalizedIndex = floorIndex < 0 ? 0 : floorIndex;
        const staggerDelay = normalizedIndex * 80;
        const duration = 450;
        const progress = Math.min(1, Math.max(0, (elapsed - staggerDelay) / duration));
        const easeOut = 1 - Math.pow(1 - progress, 3);

        if (targetY > 0) {
          group.position.y = targetY * easeOut;
        } else {
          group.position.y = targetY;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      renderer.dispose();
      scene.clear();
    };
  }, [
    isDark,
    selectedBuilding,
    bldgFloors,
    units,
    selectedFloorId,
    selectedUnitId,
    isExploded,
    wireframeMode,
    layers.undergroundInfra,
  ]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraOrbitRef.current.theta -= deltaX * 0.008;
      cameraOrbitRef.current.phi += deltaY * 0.008;
      updateCameraPosition();

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    let foundLabel = null;

    for (const hit of intersects) {
      const uData = hit.object.userData;
      if (uData?.type === 'unit') {
        foundLabel = `Unit ${uData.unitCode} (${uData.ulpin})`;
        break;
      } else if (uData?.type === 'floor') {
        foundLabel = `Floor ${uData.floorCode}`;
        break;
      }
    }
    setHoveredEntity(foundLabel);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    for (const hit of intersects) {
      const uData = hit.object.userData;
      if (uData?.type === 'unit') {
        setSelectedUnitId(uData.unitId);
        setSelectedFloorId(uData.floorId);
        onSelectUnit?.(uData.unitId);
        return;
      }
      if (uData?.type === 'floor') {
        setSelectedFloorId(uData.floorId);
        onSelectFloor?.(uData.floorId);
        return;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraOrbitRef.current.radius = Math.max(12, Math.min(80, cameraOrbitRef.current.radius + e.deltaY * 0.03));
    updateCameraPosition();
  };

  return (
    <div
      className={`relative w-full h-full select-none overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
      />

      {/* Top Billboard Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 backdrop-blur-md transition-all border border-blue-400/40">
        <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
        <span className="font-mono tracking-wide">
          {selectedBuilding?.buildingName || 'Astra Heights'} (ULPIN: {selectedBuilding?.parcelId ? 'KA-BLR-2024-0001-0001' : '27101500123456'})
        </span>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredEntity && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded bg-slate-900/90 text-cyan-300 text-xs font-mono shadow-md border border-slate-700 backdrop-blur">
          {hoveredEntity}
        </div>
      )}

      {/* Bottom 3D Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/85 text-slate-200 border border-slate-700/80 shadow-xl backdrop-blur-md">
        <button
          onClick={resetCamera}
          title="Reset Camera"
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-700" />

        <button
          onClick={() => setIsExploded((prev) => !prev)}
          title="Explode Floors View"
          className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-medium ${
            isExploded ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Explode</span>
        </button>

        <button
          onClick={() => setWireframeMode((prev) => !prev)}
          title="Toggle Wireframe / Solid"
          className={`p-1.5 rounded transition-colors ${
            wireframeMode ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Box className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-700" />

        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          title="Fullscreen Toggle"
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Compass / Orientation badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/70 text-slate-300 text-[11px] font-mono border border-slate-700 backdrop-blur">
        <Compass className="w-3.5 h-3.5 text-blue-400" />
        <span>N 38° E</span>
      </div>

      {/* Legend for Floor Levels on Left */}
      <div className="absolute top-4 left-4 hidden md:flex flex-col gap-1 p-2 rounded-lg bg-slate-900/80 border border-slate-800 backdrop-blur text-[11px] text-slate-300">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Levels
        </span>
        {bldgFloors.slice(0, 9).map((fl) => (
          <button
            key={fl.id}
            onClick={() => {
              setSelectedFloorId(fl.id);
              onSelectFloor?.(fl.id);
            }}
            className={`flex items-center justify-between gap-2 px-2 py-0.5 rounded text-left transition-colors ${
              fl.id === selectedFloorId
                ? 'bg-blue-600 text-white font-semibold'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span>{fl.floorCode}</span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: fl.colorHex || '#38bdf8' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};