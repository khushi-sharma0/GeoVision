import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCadastre } from '../../context/CadastreContext';

export const UndergroundScene3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark, layers, selectedBuilding, utilities } = useCadastre();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0b1120 : 0x1e293b);

    // Calculate dynamic excavation bounds from selected building footprint & basement count
    const footprint = selectedBuilding?.footprintAreaSqM || 800;
    const sideMeters = Math.sqrt(footprint);
    const boxW = Math.max(14, Math.min(22, sideMeters * 0.6));
    const boxD = Math.max(12, Math.min(20, sideMeters * 0.5));

    const basementCount = selectedBuilding?.numberOfBasements || 2;
    const boxH = Math.max(5, basementCount * 2.8 + 1);
    const boxCenterY = -boxH / 2;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(boxW * 1.1, boxH * 0.9, boxD * 1.3);
    camera.lookAt(0, boxCenterY, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    // Subterranean excavation box (transparent glass foundation)
    const boxGeo = new THREE.BoxGeometry(boxW, boxH, boxD);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.12,
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.set(0, boxCenterY, 0);
    scene.add(boxMesh);

    // Dynamic grid helpers per basement level
    for (let b = 1; b <= basementCount; b++) {
      const bY = -b * 2.5;
      const grid = new THREE.GridHelper(Math.max(boxW, boxD) - 2, 8, b === 1 ? 0x0284c7 : 0x6366f1, 0x334155);
      grid.position.set(0, bY, 0);
      scene.add(grid);
    }

    // Render building-specific pipelines from utilities array
    utilities.forEach((u) => {
      if (u.coordinates.length < 2) return;
      const color = new THREE.Color(u.colorHex);
      const radius = Math.max(0.12, u.diameterMm / 2000);

      for (let i = 0; i < u.coordinates.length - 1; i++) {
        const start = new THREE.Vector3(...u.coordinates[i]);
        const end = new THREE.Vector3(...u.coordinates[i + 1]);
        const distance = start.distanceTo(end);
        if (distance < 0.01) continue;

        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const cylinderGeo = new THREE.CylinderGeometry(radius, radius, distance, 16);
        const cylinderMat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.3,
          metalness: 0.6,
          emissive: color,
          emissiveIntensity: 0.3,
        });

        const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
        cylinder.position.copy(new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        scene.add(cylinder);

        // Pipe Joint Node Sphere
        const jointGeo = new THREE.SphereGeometry(radius * 1.3, 12, 12);
        const jointMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.2 });
        const jointMesh = new THREE.Mesh(jointGeo, jointMat);
        jointMesh.position.copy(start);
        scene.add(jointMesh);
      }
    });

    let angle = 0;
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      angle += 0.003;
      camera.position.x = (boxW * 1.2) * Math.cos(angle);
      camera.position.z = (boxD * 1.4) * Math.sin(angle);
      camera.lookAt(0, boxCenterY, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      renderer.dispose();
      scene.clear();
    };
  }, [isDark, layers, selectedBuilding, utilities]);

  return (
    <div className="relative w-full h-full min-h-[160px] rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Overlay Header showing active building pipeline details */}
      <div className="absolute top-2 left-2 flex flex-wrap gap-2 pointer-events-none text-[10px] font-medium text-slate-200">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700/60 backdrop-blur text-sky-400 font-bold">
          <span>{selectedBuilding ? selectedBuilding.buildingName : 'Default Network'} Subsurface Utilities</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 backdrop-blur">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
          <span>Water Pipeline</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 backdrop-blur">
          <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
          <span>Sewer Line</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 backdrop-blur">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />
          <span>Electric Cable</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 backdrop-blur">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>Storm Water Drain</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 backdrop-blur">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
          <span>Gas Pipeline</span>
        </div>
      </div>
    </div>
  );
};