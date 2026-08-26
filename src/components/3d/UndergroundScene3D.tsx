import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCadastre } from '../../context/CadastreContext';

export const UndergroundScene3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark, layers } = useCadastre();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0b1120 : 0x1e293b);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(14, 8, 16);
    camera.lookAt(0, -1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Subterranean excavation box (transparent glass foundation)
    const boxGeo = new THREE.BoxGeometry(16, 6, 12);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.12,
      wireframe: false,
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.set(0, -2.5, 0);
    scene.add(boxMesh);

    // Grid floors for B1 & B2
    const gridB1 = new THREE.GridHelper(14, 8, 0x0284c7, 0x1e293b);
    gridB1.position.set(0, -1, 0);
    scene.add(gridB1);

    const gridB2 = new THREE.GridHelper(14, 8, 0x6366f1, 0x1e293b);
    gridB2.position.set(0, -4, 0);
    scene.add(gridB2);

    // Pipelines
    const pipelines = [
      // Water Pipeline (Blue)
      { color: 0x0284c7, r: 0.25, p1: [-7, -1.5, -3], p2: [7, -1.5, -3] },
      { color: 0x0284c7, r: 0.25, p1: [2, -1.5, -3], p2: [2, -1.5, 4] },
      
      // Sewer Line (Orange)
      { color: 0xea580c, r: 0.35, p1: [-7, -4.5, 2], p2: [7, -4.5, 2] },
      { color: 0xea580c, r: 0.35, p1: [-3, -4.5, 2], p2: [-3, -4.5, -4] },

      // Electric Cable (Yellow)
      { color: 0xeab308, r: 0.18, p1: [-7, -1.0, 4], p2: [7, -1.0, 4] },

      // Storm Water Drain (Green)
      { color: 0x10b981, r: 0.45, p1: [-7, -3.2, -1], p2: [7, -3.2, -1] },

      // Gas Pipeline (Purple)
      { color: 0x8b5cf6, r: 0.18, p1: [-7, -2.2, 1], p2: [7, -2.2, 1] },
    ];

    pipelines.forEach((p) => {
      const start = new THREE.Vector3(...p.p1);
      const end = new THREE.Vector3(...p.p2);
      const distance = start.distanceTo(end);
      const direction = new THREE.Vector3().subVectors(end, start).normalize();

      const cylinderGeo = new THREE.CylinderGeometry(p.r, p.r, distance, 16);
      const cylinderMat = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: 0.3,
        metalness: 0.6,
        emissive: new THREE.Color(p.color),
        emissiveIntensity: 0.3,
      });

      const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
      cylinder.position.copy(new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
      cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      scene.add(cylinder);
    });

    let angle = 0;
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      angle += 0.003;
      camera.position.x = 16 * Math.cos(angle);
      camera.position.z = 16 * Math.sin(angle);
      camera.lookAt(0, -2.5, 0);
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
  }, [isDark, layers]);

  return (
    <div className="relative w-full h-full min-h-[160px] rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Overlay Pipeline Legend */}
      <div className="absolute top-2 left-2 flex flex-wrap gap-2 pointer-events-none text-[10px] font-medium text-slate-200">
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
