import React from 'react';
import { X, Layers, Eye, CheckCircle2, User } from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { Unit } from '../../types/cadastre';

export const FloorPlanModal: React.FC = () => {
  const {
    isFloorPlanModalOpen,
    setIsFloorPlanModalOpen,
    selectedFloor,
    selectedUnit,
    units,
    ownerships,
    setSelectedUnitId,
  } = useCadastre();

  if (!isFloorPlanModalOpen || !selectedFloor) return null;

  const floorUnits = units.filter((u) => u.floorId === selectedFloor.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              2D Floor Plan CAD Vector Blueprint — {selectedFloor.floorName}
            </span>
          </div>

          <button
            onClick={() => setIsFloorPlanModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Blueprint Visual SVG Canvas */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="h-[400px] w-full rounded-xl bg-slate-950 border border-slate-800 p-4 flex items-center justify-center select-none relative overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 820 440">
              {/* Grid Lines */}
              <defs>
                <pattern id="modalCadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="820" height="440" fill="url(#modalCadGrid)" />

              {/* Exterior Wall */}
              <rect x="20" y="20" width="780" height="400" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="3.5" />
              
              {/* Corridor */}
              <rect x="24" y="180" width="772" height="80" fill="#1e293b" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
              
              {/* Lift Core */}
              <rect x="370" y="185" width="80" height="70" rx="4" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="2" />
              <text x="410" y="225" fill="#e0f2fe" fontSize="11" fontWeight="bold" textAnchor="middle">
                LIFT / CORE
              </text>
              
              <text x="200" y="225" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                WEST ACCESS CORRIDOR
              </text>
              <text x="620" y="225" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                EAST ACCESS CORRIDOR
              </text>

              {floorUnits.map((u, idx) => {
                const isSelected = u.id === selectedUnit?.id;
                const count = floorUnits.length;
                const isTop = idx < Math.ceil(count / 2);
                const colIdx = isTop ? idx : idx - Math.ceil(count / 2);
                const colsCount = Math.max(1, Math.ceil(count / 2));
                
                const availableWidth = 772 - 32;
                const gap = 16;
                const unitWidth = (availableWidth - (colsCount - 1) * gap) / colsCount;

                const x = 24 + 16 + colIdx * (unitWidth + gap);
                const y = isTop ? 32 : 268;
                const width = unitWidth;
                const height = 140;

                const matchedOwnership = ownerships.find(
                  (o) =>
                    o.unitId === u.id ||
                    o.unitCode === u.unitCode ||
                    o.unitId === `unit-gen-${u.unitCode}`
                );

                return (
                  <g
                    key={u.id}
                    onClick={() => setSelectedUnitId(u.id)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx="6"
                      fill={isSelected ? '#2563eb' : u.colorHex || '#1e3a8a'}
                      fillOpacity={isSelected ? 0.85 : 0.4}
                      stroke={isSelected ? '#93c5fd' : u.colorHex || '#60a5fa'}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />

                    {/* Door Arc */}
                    <path
                      d={
                        isTop
                          ? `M ${x + width / 2 - 15} ${y + height} A 15 15 0 0 1 ${x + width / 2} ${y + height - 15}`
                          : `M ${x + width / 2 - 15} ${y} A 15 15 0 0 0 ${x + width / 2} ${y + 15}`
                      }
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />

                    {/* Unit Code */}
                    <text x={x + width / 2} y={y + 36} fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle">
                      UNIT {u.unitCode}
                    </text>

                    {/* Area & Type */}
                    <text x={x + width / 2} y={y + 58} fill="#93c5fd" fontSize="12" fontWeight="600" textAnchor="middle">
                      {u.carpetAreaSqM.toFixed(1)} m² • {u.unitType}
                    </text>

                    {/* Owner Name Box */}
                    {matchedOwnership?.ownerName && (
                      <g>
                        <rect
                          x={x + 10}
                          y={y + 76}
                          width={width - 20}
                          height={24}
                          rx="4"
                          fill="#0f172a"
                          fillOpacity="0.8"
                          stroke="#334155"
                          strokeWidth="0.8"
                        />
                        <text
                          x={x + width / 2}
                          y={y + 92}
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          👤 {matchedOwnership.ownerName}
                        </text>
                      </g>
                    )}

                    {/* 3D Spatial Tag */}
                    <text
                      x={x + width / 2}
                      y={y + 120}
                      fill="#94a3b8"
                      fontSize="9.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      3D Spatial Unit
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Select any unit polygon to inspect ownership and 3D ULPIN.</span>
            <span>Total Floor Units: {floorUnits.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
