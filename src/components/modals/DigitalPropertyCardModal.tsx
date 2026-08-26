import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building,
  QrCode,
  Layers,
  MapPin,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { copyToClipboard } from '../../utils/ulpinGenerator';
import { downloadCadastralPDFReport } from '../../utils/reportExporter';

export const DigitalPropertyCardModal: React.FC = () => {
  const {
    isPropertyCardOpen,
    setIsPropertyCardOpen,
    selectedParcel,
    selectedBuilding,
    selectedFloor,
    selectedUnit,
    selectedOwnership,
    units,
  } = useCadastre();

  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isPropertyCardOpen || !selectedUnit) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadCadastralPDFReport({
        parcel: selectedParcel,
        building: selectedBuilding,
        floor: selectedFloor,
        unit: selectedUnit,
        ownership: selectedOwnership,
        units: units,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Official Digital Cadastral Property Card (LADM ISO 19152)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              title="Download PDF to Device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Saving...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPropertyCardOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Card Body */}
        <div ref={printRef} className="p-6 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 font-sans">
          
          {/* Government Stamp / Emblem Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 dark:border-slate-100">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              GOVERNMENT OF KARNATAKA • DEPARTMENT OF LAND RECORDS & CADASTRE
            </div>
            <h2 className="text-xl font-extrabold tracking-tight mt-0.5 text-blue-700 dark:text-blue-400">
              DIGITAL 3D PROPERTY & STRATA TENURE CERTIFICATE
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              Certificate No: CERT-BLR-2024-{selectedUnit.unitCode} • Issued Under 3D Cadastral Framework
            </p>
          </div>

          {/* 3D ULPIN Large Display Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-blue-600/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Unique Land & Spatial Unit Identification (3D ULPIN)
              </span>
              <h3 className="text-lg md:text-xl font-mono font-extrabold text-slate-900 dark:text-white tracking-wider break-all select-all mt-0.5">
                {selectedUnit.full3DULPIN}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Legacy Parcel ULPIN: {selectedParcel?.ulpin || '27101500123456'}
              </p>
            </div>

            {/* QR Code SVG */}
            <div className="shrink-0 flex flex-col items-center bg-white p-2 rounded-lg border border-slate-300">
              <svg className="w-20 h-20" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                {/* QR Pattern mock */}
                <rect x="5" y="5" width="30" height="30" fill="#0f172a" />
                <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                <rect x="15" y="15" width="10" height="10" fill="#0f172a" />

                <rect x="65" y="5" width="30" height="30" fill="#0f172a" />
                <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                <rect x="75" y="15" width="10" height="10" fill="#0f172a" />

                <rect x="5" y="65" width="30" height="30" fill="#0f172a" />
                <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                <rect x="15" y="75" width="10" height="10" fill="#0f172a" />

                <circle cx="50" cy="50" r="12" fill="#0284c7" />
              </svg>
              <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Scan to Verify</span>
            </div>
          </div>

          {/* 4 Cadastral Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Parcel & Spatial Geometry */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-[11px] uppercase text-blue-600 dark:text-blue-400 block font-sans">
                Spatial & Volumetric Boundaries
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Parcel ID</span>
                <span className="font-bold">{selectedParcel?.localParcelId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Location</span>
                <span className="font-sans truncate max-w-[140px]">{selectedParcel?.locationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Floor & Elevation</span>
                <span>{selectedFloor?.floorName} ({selectedFloor?.elevationM}m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Carpet Area</span>
                <span className="font-bold text-emerald-600">{selectedUnit.carpetAreaSqM.toFixed(2)} m²</span>
              </div>
            </div>

            {/* Ownership & Title */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-[11px] uppercase text-emerald-600 dark:text-emerald-400 block font-sans">
                Proprietary & Tenure Records
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Registered Owner</span>
                <span className="font-bold font-sans">{selectedOwnership?.ownerName || 'Rahul Sharma'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Tenure / Title Type</span>
                <span>{selectedOwnership?.ownershipType || 'Freehold'} (100%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Deed Registration No.</span>
                <span>{selectedOwnership?.docRefNo || 'DOC-BLR-2024-8842'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Cadastral Status</span>
                <span className="font-bold text-emerald-600 font-sans">✓ Verified Clear Title</span>
              </div>
            </div>
          </div>

          {/* Sub-Registrar Digital Seal */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Digitally Signed & Validated
              </p>
              <p className="text-[10px] font-mono">
                Hash: SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Cadastral Authority
              </p>
              <p className="text-[10px]">Karnataka Land Administration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
