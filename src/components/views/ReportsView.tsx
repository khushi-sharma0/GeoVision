import React, { useState } from 'react';
import {
  FileCheck2,
  Download,
  Printer,
  FileText,
  Building,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Layers,
  Sparkles,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { downloadCadastralPDFReport, downloadCadastralCSV } from '../../utils/reportExporter';

export const ReportsView: React.FC = () => {
  const {
    selectedParcel,
    selectedBuilding,
    selectedFloor,
    selectedUnit,
    selectedOwnership,
    units,
    ownerships,
  } = useCadastre();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const filename = await downloadCadastralPDFReport({
        parcel: selectedParcel,
        building: selectedBuilding,
        floor: selectedFloor,
        unit: selectedUnit,
        ownership: selectedOwnership,
        units: units,
      });

      setDownloadSuccessMsg(`✓ Downloaded to your device: ${filename}`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    } catch (e) {
      console.error('Failed to generate PDF', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const filename = downloadCadastralCSV(
        units,
        ownerships,
        selectedParcel?.ulpin || '27101500123456'
      );
      setDownloadSuccessMsg(`✓ Downloaded CSV dataset to your device: ${filename}`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    } catch (e) {
      console.error('Failed to export CSV', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Notification Toast */}
        {downloadSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{downloadSuccessMsg}</span>
            </div>
            <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded font-mono">Saved in Downloads</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reports & Digital Property Cards
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate, print, and export official state 3D cadastral property cards and tenure certificates directly to your device.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Downloading to Device...' : 'Download Official PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* Report Preview Template */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b-2 border-slate-900 dark:border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              GOVERNMENT CADASTRAL & LAND RECORDS ADMINISTRATION
            </h2>
            <h1 className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
              DIGITAL 3D PROPERTY & STRATA TENURE CERTIFICATE
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Issued in Conformance with LADM ISO 19152 Standards • Direct Device Download Enabled
            </p>
          </div>

          {/* 3D ULPIN Large Display Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-blue-600/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Unique Land & Spatial Unit Identification (3D ULPIN)
              </span>
              <div className="text-base md:text-lg font-mono font-bold text-slate-900 dark:text-white mt-0.5 break-all select-all">
                {selectedUnit?.full3DULPIN || '27101500123456-BA-F3-U03'}
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Legacy Parcel ULPIN: {selectedParcel?.ulpin || '27101500123456'}
              </p>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="font-bold text-slate-900 dark:text-white font-sans uppercase text-[11px] block">
                1. Spatial & 3D Boundaries
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Parcel ID</span>
                <span className="font-bold">{selectedParcel?.localParcelId || 'MUM-WOR-0001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Location</span>
                <span className="font-sans truncate max-w-[150px]">{selectedParcel?.locationName || 'Worli Sea Face, Mumbai'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Floor & Elevation</span>
                <span>{selectedFloor?.floorName || '3rd Floor (9.6m)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Carpet Area</span>
                <span className="font-bold text-emerald-600">{selectedUnit?.carpetAreaSqM ? `${selectedUnit.carpetAreaSqM.toFixed(2)} m²` : '145.00 m²'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="font-bold text-slate-900 dark:text-white font-sans uppercase text-[11px] block">
                2. Tenure & Title Record
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Owner</span>
                <span className="font-sans font-bold">{selectedOwnership?.ownerName || 'Rahul Sharma'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Title Type</span>
                <span>{selectedOwnership?.ownershipType || 'Freehold (100%)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Deed No.</span>
                <span>{selectedOwnership?.docRefNo || 'DOC-REG-2024-8842'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Status</span>
                <span className="font-bold text-emerald-600 font-sans">✓ Verified Clear Title</span>
              </div>
            </div>
          </div>

          {/* Room Allocation Table */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white font-sans text-xs uppercase block">
              3. Architectural Room Breakdown & Spatial Layout
            </span>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-2.5 font-bold text-slate-700 dark:text-slate-300">
                <span>Room / Area Component</span>
                <span>Carpet Area</span>
                <span>Spatial Allocation</span>
              </div>
              {[
                { name: 'Grand Living & Dining Room', area: '42.0 m²', type: 'Private Exclusive' },
                { name: 'Master Bedroom Suite', area: '26.5 m²', type: 'Private Exclusive' },
                { name: 'Bedroom 2 / Study', area: '20.0 m²', type: 'Private Exclusive' },
                { name: 'Modular Kitchen & Utility', area: '18.5 m²', type: 'Private Exclusive' },
                { name: 'Balconies & Attached Bathrooms', area: '13.0 m²', type: 'Private Exclusive' },
              ].map((r, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-3 p-2.5 border-t border-slate-200 dark:border-slate-800 font-mono text-[11px] ${
                    idx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-850/40' : ''
                  }`}
                >
                  <span className="font-sans text-slate-800 dark:text-slate-200">{r.name}</span>
                  <span className="text-emerald-600 font-bold">{r.area}</span>
                  <span className="text-slate-500">{r.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
