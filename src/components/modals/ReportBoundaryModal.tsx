import React, { useState, useRef } from 'react';
import { X, AlertTriangle, CheckCircle2, Upload, MapPin, FileText, Trash2 } from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';

export const ReportBoundaryModal: React.FC = () => {
  const { isReportBoundaryOpen, setIsReportBoundaryOpen, selectedUnit, selectedParcel } = useCadastre();

  const [ulpin, setUlpin] = useState<string>(selectedUnit?.full3DULPIN || selectedParcel?.ulpin || '27101500123456-BA-F3-U03');
  const [discrepancyType, setDiscrepancyType] = useState<string>('Boundary Overlap');
  const [description, setDescription] = useState<string>('');
  const [applicantName, setApplicantName] = useState<string>('Aarav Mehta');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isReportBoundaryOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsReportBoundaryOpen(false);
      setSelectedFile(null);
      alert(
        `Boundary Discrepancy Report submitted successfully! ${
          selectedFile ? `\nAttached File: ${selectedFile.name}` : ''
        }\nCase Ref: CASE-2024-MH-9941`
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Report Incorrect Property Boundary</span>
          </div>
          <button
            onClick={() => setIsReportBoundaryOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold block">Citizen Grievance Submission:</span>
            <span>File an official discrepancy report if your registered 3D ULPIN parcel dimensions, wall boundary, or floor area differs from ground survey.</span>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              3D ULPIN / Land Parcel ID
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={ulpin}
                onChange={(e) => setUlpin(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Discrepancy Category
              </label>
              <select
                value={discrepancyType}
                onChange={(e) => setDiscrepancyType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
              >
                <option value="Boundary Overlap">Boundary Overlap</option>
                <option value="Area Mismatch">Carpet Area Mismatch</option>
                <option value="Encroachment">Neighbor Encroachment</option>
                <option value="Incorrect Floor Elevation">Incorrect Floor Elevation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Applicant Name
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Detailed Description & Observation
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe exact wall boundary offset, balcony mismatch, or survey error..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Interactive File Upload Area */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Proof Attachment (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 dark:border-slate-700 dark:hover:border-amber-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-center space-y-1 transition-all cursor-pointer group"
              >
                <Upload className="w-6 h-6 mx-auto text-slate-400 group-hover:text-amber-500 transition-colors" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Click to Upload Survey Blueprint or Photo Proof
                </span>
                <span className="text-[10px] text-slate-400 block">PDF, JPG, PNG up to 10MB</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for submission
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReportBoundaryOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitted}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitted ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Boundary Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};