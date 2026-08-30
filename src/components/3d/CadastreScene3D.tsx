import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useCadastre } from '../../context/CadastreContext';

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
    utilities,
    selectedFloorId,
    selectedUnitId,
    setSelectedFloorId,
    setSelectedUnitId,
    layers,
  } = useCadastre();

  const [isExploded] = useState<boolean>(externalExploded || false);
  const [wireframeMode] = useState<boolean>(false);

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
    radius: 42,
    target: new THREE.Vector3(0, 4, 0),
  });

  const bldgFloors = useMemo(() => {
    return floors
      .filter((f) => f.buildingId === (selectedBuilding?.id || 'bldg-1'))
      .sort((a, b) => b.floorIndex - a.floorIndex);
  }, [floors, selectedBuilding]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius, target } = cameraOrbitRef.current;
    
    const clampedPhi = Math.max(-Math.PI / 3, Math.min(Math.PI / 2 - 0.05, phi));
    cameraOrbitRef.current.phi = clampedPhi;

    const x = target.x + radius * Math.sin(clampedPhi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(clampedPhi);
    const z = target.z + radius * Math.sin(clampedPhi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
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
    scene.fog = new THREE.FogExp2(isDark ? 0x090d16 : 0xebf1f8, 0.01);

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
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x93c5fd, 0.8);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // 5. Environment Ground & Roads
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0xe2e8f0,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    // Roads
    const roadMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x1e293b : 0xcbd5e1, roughness: 0.9 });
    const road1 = new THREE.Mesh(new THREE.PlaneGeometry(160, 12), roadMat);
    road1.rotation.x = -Math.PI / 2;
    road1.position.set(0, 0.01, -22);
    scene.add(road1);

    // Cadastral Parcel Boundary Highlight
    const parcelGeo = new THREE.BoxGeometry(18, 0.05, 18);
    const parcelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.18 });
    const parcelMesh = new THREE.Mesh(parcelGeo, parcelMat);
    parcelMesh.position.set(0, 0.03, 0);
    scene.add(parcelMesh);

    // =========================================================================
    // 6. SUBTERRANEAN EXCAVATION CUT-OUT & BASEMENTS (B1, B2)
    // =========================================================================
    const bWidth = 14;
    const bDepth = 14;
    const floorHeight = 2.8;
    const slabThickness = 0.2;

    const basementFloors = bldgFloors.filter((f) => f.floorIndex < 0 || f.isBasement);
    const numBasements = Math.max(2, basementFloors.length);
    const subDepthM = numBasements * floorHeight + 1.0;

    // Glass Excavation Foundation Box
    const excavationGeo = new THREE.BoxGeometry(bWidth + 1.2, subDepthM, bDepth + 1.2);
    const excavationMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const excavationMesh = new THREE.Mesh(excavationGeo, excavationMat);
    excavationMesh.position.set(0, -subDepthM / 2, 0);
    scene.add(excavationMesh);

    // Concrete Foundation Piles at the bottom
    for (let px = -5; px <= 5; px += 10) {
      for (let pz = -5; pz <= 5; pz += 10) {
        const pileGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 12);
        const pileMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
        const pileMesh = new THREE.Mesh(pileGeo, pileMat);
        pileMesh.position.set(px, -subDepthM - 2, pz);
        scene.add(pileMesh);
      }
    }

    // =========================================================================
    // 7. UTILITY TUNNELS & ACCESS SHAFTS
    // =========================================================================
    if (layers.utilityTunnels || layers.undergroundInfra) {
      const tunnelGroup = new THREE.Group();
      
      // Main Horizontal Utility Conduit Tunnel
      const tunnelGeo = new THREE.CylinderGeometry(1.2, 1.2, 34, 16);
      const tunnelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.6,
        metalness: 0.4,
        wireframe: false,
      });
      const tunnelMesh = new THREE.Mesh(tunnelGeo, tunnelMat);
      tunnelMesh.rotation.z = Math.PI / 2;
      tunnelMesh.position.set(0, -subDepthM + 0.6, -6);
      tunnelGroup.add(tunnelMesh);

      // Utility Access Shaft (Vertical ventilation tower)
      const shaftGeo = new THREE.BoxGeometry(1.8, subDepthM + 2, 1.8);
      const shaftMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.6,
        wireframe: true,
      });
      const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
      shaftMesh.position.set(-bWidth / 2 - 1.5, -subDepthM / 2 + 1, -6);
      tunnelGroup.add(shaftMesh);

      scene.add(tunnelGroup);
    }

    // =========================================================================
    // 8. 3D PIPELINE NETWORK OUTPUT (Water, Sewer, Gas, Electric, Stormwater)
    // =========================================================================
    if (layers.utilities || layers.undergroundInfra) {
      const pipeGroup = new THREE.Group();

      const defaultPipes = [
        { color: 0x0284c7, radius: 0.35, y: -2.0, z: -7, label: 'Main Water Feeder' },
        { color: 0xea580c, radius: 0.45, y: -4.5, z: -3, label: 'Sewer Trunk Line' },
        { color: 0x8b5cf6, radius: 0.22, y: -1.5, z: 5, label: 'Natural PNG Gas' },
        { color: 0xeab308, radius: 0.25, y: -1.2, z: 7, label: 'High-Voltage Electric' },
        { color: 0x10b981, radius: 0.55, y: -3.5, z: -10, label: 'Stormwater Drain' },
      ];

      defaultPipes.forEach((p) => {
        const pipeGeo = new THREE.CylinderGeometry(p.radius, p.radius, 36, 16);
        const pipeMat = new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: 0.2,
          metalness: 0.6,
          emissive: new THREE.Color(p.color),
          emissiveIntensity: 0.3,
        });
        const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
        pipeMesh.rotation.z = Math.PI / 2;
        pipeMesh.position.set(0, p.y, p.z);
        pipeGroup.add(pipeMesh);
      });

      // Render custom utilities from context if present
      utilities.forEach((u) => {
        if (u.coordinates && u.coordinates.length >= 2) {
          const path = new THREE.CatmullRomCurve3(
            u.coordinates.map((c) => new THREE.Vector3(c[0], c[1], c[2]))
          );
          const tubeGeo = new THREE.TubeGeometry(path, 32, (u.diameterMm || 300) / 2000, 12, false);
          const tubeMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(u.colorHex || '#0284c7'),
            roughness: 0.2,
            metalness: 0.5,
            emissive: new THREE.Color(u.colorHex || '#0284c7'),
            emissiveIntensity: 0.35,
          });
          const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
          pipeGroup.add(tubeMesh);
        }
      });

      scene.add(pipeGroup);
    }

    // =========================================================================
    // 9. BUILDING STRUCTURE: FLOORS, BASEMENT PARKING & ELEVATED STRUCTURES
    // =========================================================================
    interactiveMeshesRef.current = {};
    const buildingGroup = new THREE.Group();

    const sortedFloors = [...bldgFloors].sort((a, b) => a.floorIndex - b.floorIndex);

    sortedFloors.forEach((fl) => {
      const floorIndex = fl.floorIndex;
      const isBasement = floorIndex < 0 || fl.isBasement;
      const isElevated = fl.isElevated || fl.floorCode === 'TER';

      let baseY: number;
      if (isBasement) {
        baseY = floorIndex * floorHeight;
      } else if (isElevated) {
        const topIndex = Math.max(...bldgFloors.filter((f) => f.floorIndex > 0).map((f) => f.floorIndex));
        baseY = topIndex * floorHeight;
      } else {
        const step = floorIndex - 1;
        baseY = step * floorHeight;
      }

      const floorLevelGroup = new THREE.Group();
      floorLevelGroup.position.set(0, baseY, 0);

      const isSelectedFloor = fl.id === selectedFloorId;
      const floorUnits = units.filter((u) => u.floorId === fl.id);

      // Floor Slab Mesh
      const slabGeo = new THREE.BoxGeometry(bWidth + 0.4, slabThickness, bDepth + 0.4);
      const slabMat = new THREE.MeshStandardMaterial({
        color: isBasement ? 0x334155 : isElevated ? 0x475569 : isDark ? 0x1e293b : 0xcbd5e1,
        roughness: 0.5,
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, slabThickness / 2, 0);
      slabMesh.receiveShadow = true;
      floorLevelGroup.add(slabMesh);

      // =======================================================================
      // A. BASEMENT PARKING SPACES & VEHICLES (Yellow Line Markings & Cars)
      // =======================================================================
      if (isBasement && (layers.parkingSpaces || true)) {
        // Yellow Parking Slot Bay Lines
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        for (let px = -5; px <= 5; px += 2.5) {
          const line = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 4.5), lineMat);
          line.rotation.x = -Math.PI / 2;
          line.position.set(px, slabThickness + 0.01, -2.5);
          floorLevelGroup.add(line);
        }

        // 3D Car Silhouettes in Parking Bays
        const carColors = [0xef4444, 0x3b82f6, 0x10b981, 0x64748b, 0x1e293b];
        [-3.75, -1.25, 1.25, 3.75].forEach((cx, cIdx) => {
          const carGroup = new THREE.Group();
          
          // Car Body
          const bodyGeo = new THREE.BoxGeometry(1.8, 0.9, 3.6);
          const bodyMat = new THREE.MeshStandardMaterial({ color: carColors[cIdx % carColors.length], roughness: 0.3 });
          const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
          bodyMesh.position.set(0, 0.45, 0);
          carGroup.add(bodyMesh);

          // Car Cabin
          const cabinGeo = new THREE.BoxGeometry(1.5, 0.6, 1.8);
          const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
          const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
          cabinMesh.position.set(0, 1.05, -0.2);
          carGroup.add(cabinMesh);

          carGroup.position.set(cx, slabThickness, -2.5);
          floorLevelGroup.add(carGroup);
        });
      }

      // =======================================================================
      // B. ELEVATED TERRACE STRUCTURES (Solar Array, Water Tank, Helipad)
      // =======================================================================
      if (isElevated && (layers.elevatedStructures || true)) {
        // 1. Rooftop Solar Panel Array (Inclined Photovoltaic Panels)
        const solarGroup = new THREE.Group();
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.1, metalness: 0.8 });
        for (let sx = -4; sx <= 4; sx += 2.5) {
          const panelGeo = new THREE.BoxGeometry(2.0, 0.05, 3.0);
          const panelMesh = new THREE.Mesh(panelGeo, panelMat);
          panelMesh.rotation.x = Math.PI / 8; // Inclined facing sun
          panelMesh.position.set(sx, 0.8, 3.0);
          solarGroup.add(panelMesh);
        }
        floorLevelGroup.add(solarGroup);

        // 2. Overhead Water Tank
        const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.8, 16);
        const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 });
        const tankMesh = new THREE.Mesh(tankGeo, tankMat);
        tankMesh.position.set(-4.0, 1.6, -3.0);
        floorLevelGroup.add(tankMesh);

        // 3. Rooftop Helipad / Skydeck Landing Circle
        const helipadCanvas = document.createElement('canvas');
        helipadCanvas.width = 256;
        helipadCanvas.height = 256;
        const hCtx = helipadCanvas.getContext('2d');
        if (hCtx) {
          hCtx.fillStyle = '#334155';
          hCtx.fillRect(0, 0, 256, 256);
          hCtx.strokeStyle = '#facc15';
          hCtx.lineWidth = 10;
          hCtx.beginPath();
          hCtx.arc(128, 128, 100, 0, Math.PI * 2);
          hCtx.stroke();
          hCtx.fillStyle = '#ffffff';
          hCtx.font = 'bold 110px sans-serif';
          hCtx.textAlign = 'center';
          hCtx.textBaseline = 'middle';
          hCtx.fillText('H', 128, 128);
        }
        const helipadTex = new THREE.CanvasTexture(helipadCanvas);
        const helipadGeo = new THREE.PlaneGeometry(6, 6);
        const helipadMat = new THREE.MeshBasicMaterial({ map: helipadTex });
        const helipadMesh = new THREE.Mesh(helipadGeo, helipadMat);
        helipadMesh.rotation.x = -Math.PI / 2;
        helipadMesh.position.set(3.5, slabThickness + 0.02, -3.0);
        floorLevelGroup.add(helipadMesh);
      }

      // =======================================================================
      // C. UNITS & SPATIAL BOUNDING BOXES
      // =======================================================================
      const enclosureGeo = new THREE.BoxGeometry(bWidth, floorHeight, bDepth);
      const enclosureMat = new THREE.MeshStandardMaterial({
        color: isBasement ? 0x0284c7 : isElevated ? 0xeab308 : fl.colorHex || 0x3b82f6,
        transparent: true,
        opacity: isSelectedFloor ? 0.45 : isBasement ? 0.35 : 0.2,
        wireframe: wireframeMode,
      });

      const floorMesh = new THREE.Mesh(enclosureGeo, enclosureMat);
      floorMesh.position.set(0, floorHeight / 2, 0);
      floorMesh.userData = { type: 'floor', floorId: fl.id, floorCode: fl.floorCode };
      floorLevelGroup.add(floorMesh);
      interactiveMeshesRef.current[`floor-${fl.id}`] = floorMesh;

      // Unit Compartments
      if (floorUnits.length > 0) {
        floorUnits.forEach((u, uIdx) => {
          const isSelectedUnit = u.id === selectedUnitId;
          const rawW = u.relativeBounds?.w || 0.42;
          const rawD = u.relativeBounds?.d || 0.42;
          const rawX = u.relativeBounds?.x !== undefined ? u.relativeBounds.x : (uIdx % 2 === 0 ? 0.05 : 0.53);
          const rawY = u.relativeBounds?.y !== undefined ? u.relativeBounds.y : (uIdx >= 2 ? 0.53 : 0.05);

          const uWidth = (bWidth - 1.2) * rawW;
          const uDepth = (bDepth - 1.2) * rawD;
          const uHeight = (floorHeight - slabThickness) * 0.9;

          const uX = -bWidth / 2 + 0.6 + rawX * (bWidth - 1.2) + uWidth / 2;
          const uZ = -bDepth / 2 + 0.6 + rawY * (bDepth - 1.2) + uDepth / 2;
          const uY = slabThickness + uHeight / 2;

          const unitGeo = new THREE.BoxGeometry(uWidth, uHeight, uDepth);
          const unitColor = isSelectedUnit
            ? new THREE.Color(0x22d3ee)
            : new THREE.Color(u.colorHex || '#0f766e');

          const unitMat = new THREE.MeshStandardMaterial({
            color: unitColor,
            roughness: 0.3,
            transparent: true,
            opacity: isSelectedUnit ? 0.95 : 0.65,
            emissive: isSelectedUnit ? new THREE.Color(0x0284c7) : new THREE.Color(0x000000),
            emissiveIntensity: isSelectedUnit ? 0.5 : 0,
          });

          const unitMesh = new THREE.Mesh(unitGeo, unitMat);
          unitMesh.position.set(uX, uY, uZ);
          unitMesh.userData = { type: 'unit', unitId: u.id, unitCode: u.unitCode, floorId: fl.id };

          const unitEdge = new THREE.LineSegments(
            new THREE.EdgesGeometry(unitGeo),
            new THREE.LineBasicMaterial({ color: isSelectedUnit ? 0xffffff : 0x000000, opacity: 0.4 })
          );
          unitMesh.add(unitEdge);

          floorLevelGroup.add(unitMesh);
          interactiveMeshesRef.current[`unit-${u.id}`] = unitMesh;
        });
      }

      buildingGroup.add(floorLevelGroup);
    });

    scene.add(buildingGroup);

    // =========================================================================
    // 10. ANIMATION & ORBIT MOUSE CONTROLS
    // =========================================================================
    const animate = () => {
      reqAnimRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraOrbitRef.current.theta -= deltaX * 0.008;
      cameraOrbitRef.current.phi -= deltaY * 0.008;
      updateCameraPosition();

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraOrbitRef.current.radius = Math.max(12, Math.min(100, cameraOrbitRef.current.radius + e.deltaY * 0.04));
      updateCameraPosition();
    };

    const domElem = container;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('wheel', handleWheel);
    };
  }, [isDark, selectedBuilding, bldgFloors, units, utilities, selectedFloorId, selectedUnitId, layers, isExploded, wireframeMode]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
      {/* 3D Scene Controls Badge */}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-mono border border-slate-700 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>WebGL 3D Engine • Basements, Parking, Elevated & Pipeline Layer Active</span>
      </div>
    </div>
  );
};