import React, { useState, useRef } from 'react';
import {
  Cpu,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Zap,
  Play,
  RotateCcw,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  Building,
  Hash,
  Share2,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';

interface SegmentedUnitData {
  unitCode: string;
  floorCode: string;
  areaSqM: number;
  ulpin: string;
  usage: string;
  polygon: { x: number; y: number; w: number; h: number };
  color: string;
}

export const AIAnalysisView: React.FC = () => {
  const { selectedParcel, selectedBuilding, setActiveTab } = useCadastre();

  // Input states
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [floorNumber, setFloorNumber] = useState<string>('F3');
  const [buildingId, setBuildingId] = useState<string>(selectedBuilding?.buildingCode || 'SB');
  const [baseUlpin, setBaseUlpin] = useState<string>(
    selectedParcel?.ulpin || '27101500984123'
  );
  const [unitCountOption, setUnitCountOption] = useState<number>(4);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [segmentedUnits, setSegmentedUnits] = useState<SegmentedUnitData[]>([]);
  const [totalFloorArea, setTotalFloorArea] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selected));
      } else {
        setFilePreview(null);
      }
      setHasResult(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selected));
      } else {
        setFilePreview(null);
      }
      setHasResult(false);
    }
  };

  const runAISegmentation = () => {
    if (!file && !filePreview) {
      // If user clicks without file, create a synthetic CAD blueprint vector file object
      const dummyFile = new File(['CAD_VECTOR_DATA'], 'architectural_floorplan.dwg', {
        type: 'application/acad',
      });
      setFile(dummyFile);
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setProcessingStep('Uploading Floor Plan...');

    const steps = [
      { p: 25, label: 'Detecting Structural Walls & Corridors...' },
      { p: 50, label: 'Identifying Distinct Unit Compartments...' },
      { p: 70, label: 'Creating LADM ISO 19152 Polygons...' },
      { p: 85, label: 'Calculating Carpet & Built-up Areas...' },
      { p: 98, label: 'Generating Hierarchical 3D ULPINs...' },
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setProgressPercent(s.p);
        setProcessingStep(s.label);
      }, (idx + 1) * 350);
    });

    setTimeout(() => {
      setIsProcessing(false);
      setProgressPercent(100);
      setProcessingStep('Segmentation Complete');

      // Generate results dynamically based on inputs
      const count = unitCountOption;
      const units: SegmentedUnitData[] = [];
      const cleanFloor = floorNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'F1';
      const cleanBldg = buildingId.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'B1';
      const cleanUlpin = baseUlpin.trim() || '27101500984123';

      const colors = ['#22c55e', '#eab308', '#a855f7', '#06b6d4', '#ec4899', '#f97316', '#3b82f6', '#14b8a6'];
      let areaSum = 0;

      for (let i = 1; i <= count; i++) {
        const uNum = `${cleanFloor.replace('F', '')}0${i}`;
        const uCode = `U${uNum}`;
        const area = Math.round((95 + ((i * 17) % 45)) * 10) / 10;
        areaSum += area;
        const ulpin = `${cleanUlpin}-${cleanBldg}-${cleanFloor}-${uCode}`;

        // Compute relative polygon grid coordinates
        const isTop = i <= Math.ceil(count / 2);
        const colIdx = isTop ? i - 1 : i - 1 - Math.ceil(count / 2);
        const colCount = Math.ceil(count / 2);
        const widthPercent = (100 - 8 * (colCount + 1)) / colCount;

        units.push({
          unitCode: uCode,
          floorCode: cleanFloor,
          areaSqM: area,
          ulpin: ulpin,
          usage: i % 2 === 0 ? 'Residential Flat (3BHK)' : 'Residential Flat (2BHK)',
          polygon: {
            x: 4 + colIdx * (widthPercent + 4),
            y: isTop ? 8 : 55,
            w: widthPercent,
            h: 36,
          },
          color: colors[(i - 1) % colors.length],
        });
      }

      setSegmentedUnits(units);
      setTotalFloorArea(Math.round((areaSum + 65.0) * 10) / 10); // Area + Corridor
      setHasResult(true);
    }, 2200);
  };

  const resetWorkflow = () => {
    setFile(null);
    setFilePreview(null);
    setHasResult(false);
    setIsProcessing(false);
    setProgressPercent(0);
    setProcessingStep('');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                AI / ML Cadastral Floor Plan Segmentation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload 2D architectural CAD, PDF, or image floor plans to extract topological unit boundaries and generate 3D ULPINs.
            </p>
          </div>

          {hasResult && (
            <button
              type="button"
              onClick={resetWorkflow}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Upload New Floor Plan</span>
            </button>
          )}
        </div>

        {/* INPUT SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Input Section — Floor Plan & Spatial Parameters</span>
            </h2>
            {file && (
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ {file.name} ({Math.round(file.size / 1024 || 240)} KB)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Upload Area */}
            <div className="lg:col-span-6">
              <label className="block text-slate-500 text-xs font-semibold mb-2">
                Upload Architectural Floor Plan (PDF / CAD / DWG / PNG / JPG)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-850'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.dwg,.dxf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud
                  className={`w-8 h-8 mb-2 ${
                    file ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                />
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Ready for Deep Learning Polygon Extraction
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Click to browse or drag & drop blueprint file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports high-res architectural PDFs, AutoCAD DXF/DWG & scan images
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Spatial Parameter Fields */}
            <div className="lg:col-span-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Floor Number */}
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Floor Number
                  </label>
                  <select
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  >
                    <option value="F1">F1 — Floor 1</option>
                    <option value="F2">F2 — Floor 2</option>
                    <option value="F3">F3 — Floor 3</option>
                    <option value="F4">F4 — Floor 4</option>
                    <option value="F5">F5 — Floor 5</option>
                    <option value="F6">F6 — Floor 6</option>
                    <option value="GF">GF — Ground Floor</option>
                    <option value="B1">B1 — Basement 1</option>
                  </select>
                </div>

                {/* Building ID */}
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Building ID / Code
                  </label>
                  <input
                    type="text"
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value.toUpperCase())}
                    placeholder="e.g. SB, TOWER-A"
                    className="w-full h-9 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>

                {/* Units on Floor */}
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Expected Units
                  </label>
                  <select
                    value={unitCountOption}
                    onChange={(e) => setUnitCountOption(parseInt(e.target.value))}
                    className="w-full h-9 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value={2}>2 Units (Large Duplex)</option>
                    <option value={3}>3 Units (Triplex)</option>
                    <option value={4}>4 Units (Standard Core)</option>
                    <option value={6}>6 Units (Multi-unit)</option>
                    <option value={8}>8 Units (High-density)</option>
                  </select>
                </div>
              </div>

              {/* Base ULPIN */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Base Parcel ULPIN (14-Digit Standard)
                </label>
                <input
                  type="text"
                  value={baseUlpin}
                  onChange={(e) => setBaseUlpin(e.target.value)}
                  placeholder="27101500984123"
                  className="w-full h-9 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              {/* Run Segmentation Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={runAISegmentation}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>{processingStep || 'Processing AI Vectorization...'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Run AI Segmentation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PROCESSING ANIMATION BANNER */}
        {isProcessing && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-blue-200 dark:border-blue-900 shadow-lg space-y-3 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-spin" />
                <span>{processingStep}</span>
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] text-slate-400 font-mono text-center pt-1">
              <span className={progressPercent >= 10 ? 'text-blue-600 font-bold' : ''}>1. Uploading</span>
              <span className={progressPercent >= 25 ? 'text-blue-600 font-bold' : ''}>2. Wall Detection</span>
              <span className={progressPercent >= 50 ? 'text-blue-600 font-bold' : ''}>3. Unit Identification</span>
              <span className={progressPercent >= 70 ? 'text-blue-600 font-bold' : ''}>4. Polygons</span>
              <span className={progressPercent >= 85 ? 'text-blue-600 font-bold' : ''}>5. Areas</span>
              <span className={progressPercent >= 98 ? 'text-blue-600 font-bold' : ''}>6. 3D ULPINs</span>
            </div>
          </div>
        )}

        {/* OUTPUT SECTION: SHOWN AFTER USER RUNS SEGMENTATION */}
        {hasResult && !isProcessing && (
          <div className="space-y-6">
            {/* Split Screen: Original Floor Plan vs AI Segmented Floor Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Original Floor Plan Blueprint */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                    Original Floor Plan (Raw Architectural Layout)
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {file?.name || 'blueprint.dwg'} ({floorNumber})
                  </span>
                </div>

                <div className="h-80 w-full rounded-xl bg-slate-900 border border-slate-800 p-4 relative flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 220">
                    {/* Outer Wall Boundary */}
                    <rect x="10" y="10" width="380" height="200" fill="none" stroke="#64748b" strokeWidth="2.5" />
                    {/* Central Corridor */}
                    <rect x="10" y="90" width="380" height="40" fill="#1e293b" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
                    <text x="200" y="114" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
                      COMMON ACCESS CORRIDOR & LIFTS
                    </text>

                    {/* Unit Boundary Lines */}
                    {segmentedUnits.map((u, idx) => {
                      const svgX = (u.polygon.x / 100) * 380 + 10;
                      const svgY = (u.polygon.y / 100) * 200 + 10;
                      const svgW = (u.polygon.w / 100) * 380;
                      const svgH = (u.polygon.h / 100) * 200;
                      return (
                        <g key={idx}>
                          <rect
                            x={svgX}
                            y={svgY}
                            width={svgW}
                            height={svgH}
                            fill="none"
                            stroke="#475569"
                            strokeWidth="1.5"
                          />
                          <text
                            x={svgX + svgW / 2}
                            y={svgY + svgH / 2}
                            fill="#64748b"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            ROOM CAD #{idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right: AI Segmented Floor Plan */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Segmented Floor Plan</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {segmentedUnits.length} Units Extracted • {totalFloorArea} m² Total
                  </span>
                </div>

                <div className="h-80 w-full rounded-xl bg-slate-900 border border-slate-800 p-4 relative flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 220">
                    {/* Building Boundary */}
                    <rect x="10" y="10" width="380" height="200" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                    
                    {/* Corridor */}
                    <rect x="10" y="90" width="380" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="200" y="114" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      CORRIDOR (65.0 m²)
                    </text>

                    {/* Segmented Unit Polygons */}
                    {segmentedUnits.map((u, idx) => {
                      const svgX = (u.polygon.x / 100) * 380 + 10;
                      const svgY = (u.polygon.y / 100) * 200 + 10;
                      const svgW = (u.polygon.w / 100) * 380;
                      const svgH = (u.polygon.h / 100) * 200;

                      return (
                        <g key={u.unitCode} className="transition-all">
                          <rect
                            x={svgX}
                            y={svgY}
                            width={svgW}
                            height={svgH}
                            rx="3"
                            fill={u.color}
                            fillOpacity="0.35"
                            stroke={u.color}
                            strokeWidth="2"
                          />
                          <text
                            x={svgX + svgW / 2}
                            y={svgY + svgH / 2 - 4}
                            fill="#ffffff"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {u.unitCode} — {u.areaSqM} m²
                          </text>
                          <text
                            x={svgX + svgW / 2}
                            y={svgY + svgH / 2 + 9}
                            fill="#cbd5e1"
                            fontSize="7.5"
                            textAnchor="middle"
                          >
                            {u.usage.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* 3D ULPIN GENERATION TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Generated Hierarchical 3D ULPINs & Measured Areas
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                    Proposed vertical property identifiers derived from Base ULPIN – Building – Floor – Unit schema
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('explorer')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open in Floor & Unit Explorer</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <th className="p-3">Unit</th>
                      <th className="p-3">Floor</th>
                      <th className="p-3">Usage Type</th>
                      <th className="p-3 text-right">Calculated Area</th>
                      <th className="p-3">Generated 3D ULPIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {segmentedUnits.map((u) => (
                      <tr key={u.unitCode} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">
                          {u.unitCode}
                        </td>
                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                          {u.floorCode}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {u.usage}
                        </td>
                        <td className="p-3 font-mono font-bold text-right text-slate-900 dark:text-white">
                          {u.areaSqM.toFixed(1)} m²
                        </td>
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 break-all select-all">
                          {u.ulpin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
