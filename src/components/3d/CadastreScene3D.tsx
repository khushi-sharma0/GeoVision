import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useCadastre } from '../../context/CadastreContext';
import {
  RotateCcw,
  Layers,
  Eye,
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
    scene.background = new THREE.Color(0xebf1f8);
    scene.fog = new THREE.FogExp2(0xebf1f8, 0.012);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
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

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-20, 15, -20);
    scene.add(fillLight);

    // 5. Cadastral Base Grid & Ground Surface Plane
    const gridHelper = new THREE.GridHelper(80, 80, 0x3b82f6, 0xcbdaf1);
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);

    const planeGeo = new THREE.PlaneGeometry(120, 120);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
      metalness: 0.1,
    });
    const groundPlane = new THREE.Mesh(planeGeo, planeMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.05;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // 6. Parcel Boundary Visualization
    if (layers.parcelBoundary) {
      const boundaryGeo = new THREE.BoxGeometry(26, 0.2, 26);
      const boundaryMat = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        wireframe: true,
      });
      const boundaryMesh = new THREE.Mesh(boundaryGeo, boundaryMat);
      boundaryMesh.position.set(0, 0.1, 0);
      scene.add(boundaryMesh);
    }

    // 7. Render 3D Strata Building & Units
    interactiveMeshesRef.current = {};
    const buildingWidth = 18;
    const buildingDepth = 18;
    const floorHeight = 2.6;
    const explosionSpacing = isExploded ? 1.8 : 0.0;

    bldgFloors.forEach((flr) => {
      const flrUnits = units.filter((u) => u.floorId === flr.id);
      const floorY = (flr.floorIndex - 1) * (floorHeight + explosionSpacing);
      const isFloorSelected = flr.id === selectedFloorId;

      // Render Concrete Slab
      const slabGeo = new THREE.BoxGeometry(buildingWidth + 0.6, 0.35, buildingDepth + 0.6);
      const slabMat = new THREE.MeshStandardMaterial({
        color: isFloorSelected ? 0x2563eb : 0x64748b,
        roughness: 0.4,
        metalness: 0.2,
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, floorY, 0);
      slabMesh.receiveShadow = true;
      slabMesh.castShadow = true;
      scene.add(slabMesh);

      // Render Units on Floor Slab
      flrUnits.forEach((un) => {
        const bounds = un.relativeBounds || { x: 0.05, y: 0.05, w: 0.43, d: 0.43 };
        const uWidth = bounds.w * buildingWidth;
        const uDepth = bounds.d * buildingDepth;
        const uX = (bounds.x - 0.5 + bounds.w / 2) * buildingWidth;
        const uZ = (bounds.y - 0.5 + bounds.d / 2) * buildingDepth;
        const uY = floorY + floorHeight / 2 + 0.18;

        const isUnitSelected = un.id === selectedUnitId;
        const unitGeo = new THREE.BoxGeometry(uWidth - 0.4, floorHeight - 0.4, uDepth - 0.4);

        const hexColor = parseInt(un.colorHex?.replace('#', '') || '3b82f6', 16);
        const unitMat = new THREE.MeshStandardMaterial({
          color: isUnitSelected ? 0xef4444 : hexColor,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: wireframeMode ? 0.3 : isUnitSelected ? 0.95 : 0.82,
          wireframe: wireframeMode,
        });

        const unitMesh = new THREE.Mesh(unitGeo, unitMat);
        unitMesh.position.set(uX, uY, uZ);
        unitMesh.castShadow = true;
        unitMesh.receiveShadow = true;
        unitMesh.userData = { unitId: un.id, floorId: flr.id, unitCode: un.unitCode, ulpin: un.full3DULPIN };

        scene.add(unitMesh);
        interactiveMeshesRef.current[un.id] = unitMesh;

        // Unit Boundary Edges
        const edges = new THREE.EdgesGeometry(unitGeo);
        const lineMat = new THREE.LineBasicMaterial({
          color: isUnitSelected ? 0xffffff : 0x1e293b,
          linewidth: isUnitSelected ? 2 : 1,
        });
        const line = new THREE.LineSegments(edges, lineMat);
        unitMesh.add(line);
      });
    });

    // 8. Render Animation Loop
    const animate = () => {
      reqAnimRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 9. Resize Listener
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
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [bldgFloors, units, selectedFloorId, selectedUnitId, isExploded, wireframeMode, layers]);

  // Mouse Interaction Controls (Orbit & Raycasting Click Selection)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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

  const handleWheel = (e: React.WheelEvent) => {
    cameraOrbitRef.current.radius += e.deltaY * 0.02;
    cameraOrbitRef.current.radius = Math.max(12, Math.min(90, cameraOrbitRef.current.radius));
    updateCameraPosition();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Object.values(interactiveMeshesRef.current);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const topHit = intersects[0].object;
      const { unitId, floorId } = topHit.userData;
      if (unitId) {
        setSelectedUnitId(unitId);
        if (onSelectUnit) onSelectUnit(unitId);
      }
      if (floorId) {
        setSelectedFloorId(floorId);
        if (onSelectFloor) onSelectFloor(floorId);
      }
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden group">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D Controls Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-lg">
        <button
          onClick={() => setIsExploded((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isExploded
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Toggle Volumetric Strata Explosion"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isExploded ? 'Collapse Strata' : 'Explode 3D Floors'}</span>
        </button>

        <button
          onClick={() => setWireframeMode((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            wireframeMode
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>{wireframeMode ? 'Solid View' : 'Wireframe'}</span>
        </button>

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          title="Reset Camera Orientation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Orientational Compass Badge */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 text-xs font-mono font-bold text-slate-700">
        <Compass className="w-4 h-4 text-blue-600 animate-spin-slow" />
        <span>EPSG:4326 • 3D Volumetric Strata</span>
      </div>
    </div>
  );
};