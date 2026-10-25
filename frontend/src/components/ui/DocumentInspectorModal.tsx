import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Eye,
  Layers,
  Sparkles,
  Cpu,
  Info,
  Maximize2
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

interface BoundingBox {
  id: string;
  label: string;
  value: string;
  confidence: number;
  top: number; // percentage
  left: number; // percentage
  width: number; // percentage
  height: number; // percentage
}

interface DocumentInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentType?: string;
  extractedFields?: Record<string, string>;
  confidence?: number;
}

export const DocumentInspectorModal: React.FC<DocumentInspectorModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentType = 'Government Identity & Credential',
  extractedFields,
  confidence = 98.6
}) => {
  const [zoom, setZoom] = useState(1);
  const [activeBox, setActiveBox] = useState<string | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [activeTab, setActiveTab] = useState<'ocr' | 'forensics'>('ocr');

  if (!isOpen) return null;

  const boxes: BoundingBox[] = [
    {
      id: 'name',
      label: 'Full Name',
      value: extractedFields?.fullName || 'Sarah Jenkins',
      confidence: 99.8,
      top: 26,
      left: 18,
      width: 48,
      height: 9
    },
    {
      id: 'doc_id',
      label: 'Document Identifier',
      value: extractedFields?.docNumber || 'ID-90421-CA-X',
      confidence: 99.4,
      top: 40,
      left: 18,
      width: 42,
      height: 8
    },
    {
      id: 'issue_date',
      label: 'Issuance Date',
      value: extractedFields?.issueDate || '2023-06-15',
      confidence: 98.9,
      top: 54,
      left: 18,
      width: 32,
      height: 8
    },
    {
      id: 'expiry_date',
      label: 'Expiry Date',
      value: extractedFields?.expiryDate || '2028-06-15',
      confidence: 99.1,
      top: 54,
      left: 54,
      width: 32,
      height: 8
    },
    {
      id: 'hologram',
      label: 'Security Microprint & Watermark',
      value: 'Official Guilloché Pattern (Verified Intact)',
      confidence: 97.5,
      top: 68,
      left: 18,
      width: 68,
      height: 14
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {documentTitle}
                </h3>
                <Badge variant="success" className="text-[10px] py-0 px-2 font-mono">
                  OCR {confidence}%
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive Computer Vision & Forensic Bounding Box Inspection
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className="text-xs hidden sm:flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              {showBoundingBoxes ? 'Hide Overlays' : 'Show Overlays'}
            </Button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="px-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded border-l border-slate-200 dark:border-slate-700 ml-0.5"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Canvas: Document Preview with OCR Bounding Boxes */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center overflow-auto relative">
            <div
              className="relative transition-transform duration-200 origin-center shadow-2xl rounded-2xl border-4 border-white dark:border-slate-800 bg-linear-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 w-full max-w-md aspect-3/4 flex flex-col justify-between p-6 select-none overflow-hidden"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Guilloché Watermark background pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Document Header representation */}
              <div className="relative border-b-2 border-slate-300 dark:border-slate-700 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Official Specimen
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    CERTIFICATE OF IDENTIFICATION
                  </h4>
                </div>
                <div className="w-7 h-7 rounded-full border border-indigo-400 flex items-center justify-center text-[10px] font-bold text-indigo-500">
                  AIV
                </div>
              </div>

              {/* Document Center Mock content */}
              <div className="relative space-y-4 py-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="h-2 w-32 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                <div className="h-2 w-48 bg-slate-200 dark:bg-slate-800 rounded-xs" />
                <div className="h-2 w-40 bg-slate-200 dark:bg-slate-800 rounded-xs" />
                <div className="pt-2 flex items-center gap-4">
                  <div className="w-16 h-20 bg-slate-300 dark:bg-slate-700 rounded-md border border-slate-400/40 flex items-center justify-center text-[9px] text-slate-500">
                    PHOTO ID
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-xs w-full" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-xs w-3/4" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-xs w-1/2" />
                  </div>
                </div>
              </div>

              {/* Document Footer Barcode mock */}
              <div className="relative border-t border-slate-300 dark:border-slate-700 pt-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[9px] text-slate-400">SECURITY HASH</div>
                  <div className="text-[8px] font-mono text-slate-500">E3B0C44298FC1C149AFB...</div>
                </div>
                <div className="h-6 w-24 bg-slate-800 dark:bg-slate-200 rounded-xs opacity-70" />
              </div>

              {/* Overlaid OCR Bounding Boxes */}
              {showBoundingBoxes &&
                boxes.map((b) => {
                  const isActive = activeBox === b.id;
                  return (
                    <div
                      key={b.id}
                      onMouseEnter={() => setActiveBox(b.id)}
                      onMouseLeave={() => setActiveBox(null)}
                      className={`absolute cursor-pointer rounded-lg border-2 transition-all duration-150 flex items-start p-1 ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-500/20 shadow-lg ring-2 ring-indigo-400 z-20'
                          : 'border-emerald-500/80 bg-emerald-500/10 hover:border-indigo-400 hover:bg-indigo-500/15 z-10'
                      }`}
                      style={{
                        top: `${b.top}%`,
                        left: `${b.left}%`,
                        width: `${b.width}%`,
                        height: `${b.height}%`
                      }}
                    >
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded-xs uppercase tracking-tight shrink-0 pointer-events-none transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {b.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Sidebar: Extracted OCR Data & Forensics */}
          <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 shrink-0">
            {/* Tab switch */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setActiveTab('ocr')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'ocr'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                OCR Extracted ({boxes.length})
              </button>
              <button
                onClick={() => setActiveTab('forensics')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'forensics'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Forensic Analysis
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeTab === 'ocr' ? (
                boxes.map((b) => {
                  const isActive = activeBox === b.id;
                  return (
                    <div
                      key={b.id}
                      onMouseEnter={() => setActiveBox(b.id)}
                      onMouseLeave={() => setActiveBox(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {b.label}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {b.confidence}% confidence
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono break-all">
                        {b.value}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>Error Level Analysis (ELA)</span>
                      <span className="text-emerald-600 dark:text-emerald-400">PASSED</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Zero compression anomalies or pixel cloning detected across text matrices.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>Font & Kerning Consistency</span>
                      <span className="text-emerald-600 dark:text-emerald-400">AUTHENTIC</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Microprint fonts align with official issuing bureau templates.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>EXIF & Metadata Sanitization</span>
                      <span className="text-emerald-600 dark:text-emerald-400">CLEAN</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      No photo editing software signatures (Photoshop, GIMP) found in file headers.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>AI Model Inversion Defense</span>
                      <span className="text-emerald-600 dark:text-emerald-400">SECURE</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Adversarial perturbation and deepfake injection tests passed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer summary */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Authenticity Verified
              </span>
              <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
