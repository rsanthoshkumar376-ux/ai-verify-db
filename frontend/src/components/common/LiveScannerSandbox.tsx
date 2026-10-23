import React, { useState } from 'react';
import { 
  FileCheck2, 
  Scan, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  Search,
  Lock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

interface SampleDoc {
  id: string;
  title: string;
  category: string;
  filename: string;
  issuer: string;
  date: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  entities: Record<string, string>;
  anomalies: string[];
  rulesPassed: string[];
}

const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'passport',
    title: 'International Travel Passport',
    category: 'Identity Proof (KYC)',
    filename: 'passport_scan_v3.pdf',
    issuer: 'Department of Foreign Affairs',
    date: 'Issued: 2024-03-12 | Expires: 2034-03-11',
    riskLevel: 'LOW',
    score: 98,
    entities: {
      'Full Legal Name': 'SARAH ELEANOR JENKINS',
      'Document Number': 'P928374102',
      'Nationality / Code': 'United States / USA',
      'Birth Date': '1989-08-24',
      'MRZ Checksum': 'VALID (Algorithm ISO/IEC 7501-1)'
    },
    anomalies: [],
    rulesPassed: [
      'Document is not expired (> 6 months validity)',
      'High-contrast security hologram detected',
      'No raster compression tampering found'
    ]
  },
  {
    id: 'iso_cert',
    title: 'ISO/IEC 27001:2022 Security Certificate',
    category: 'Vendor Compliance',
    filename: 'iso_27001_audit_report.pdf',
    issuer: 'BSI Global Assurance Services',
    date: 'Audited: 2025-11-04 | Valid Thru: 2028-11-03',
    riskLevel: 'LOW',
    score: 95,
    entities: {
      'Certified Entity': 'Apex Research Scholars Corp.',
      'Accreditation Body': 'ANAB / UKAS Certified',
      'Scope of Certification': 'Cloud SaaS & Multi-Tenant Infrastructure',
      'Certificate Status': 'ACTIVE & IN GOOD STANDING'
    },
    anomalies: [],
    rulesPassed: [
      'Recognized accredited certification authority',
      'Valid date range within audit surveillance window',
      'Digital signature hash verified with registry'
    ]
  },
  {
    id: 'tax_return',
    title: 'Corporate Financial Statement',
    category: 'Financial Due Diligence',
    filename: 'fy2025_tax_filing.pdf',
    issuer: 'Internal Revenue Authority',
    date: 'Filed: 2026-04-15',
    riskLevel: 'MEDIUM',
    score: 84,
    entities: {
      'Taxpayer ID / EIN': 'XX-XXX4910',
      'Reported Gross Revenue': '$4,280,000 USD',
      'Net Operating Income': '$1,140,000 USD',
      'Filing Stamp': 'AUTHENTIC ELECTRONIC STAMP'
    },
    anomalies: [
      'Metadata shows document was edited in consumer PDF software 2 days prior to filing'
    ],
    rulesPassed: [
      'Revenue matches mandatory operating threshold',
      'Valid tax year declaration'
    ]
  }
];

export const LiveScannerSandbox: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<SampleDoc>(SAMPLE_DOCS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [hasScanned, setHasScanned] = useState(true);

  const stages = [
    'Verifying cryptographic header & magic bytes...',
    'Performing OCR optical text & entity extraction...',
    'Analyzing compression artifacts & metadata rollback...',
    'Querying Gemini regulatory compliance rules...'
  ];

  const handleRunScan = () => {
    setIsScanning(true);
    setScanStage(0);
    setHasScanned(false);

    const interval = setInterval(() => {
      setScanStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsScanning(false);
          setHasScanned(true);
          return prev;
        }
      });
    }, 600);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Interactive Live Demo Sandbox
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Experience AI Document Verification Live
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Test how our automated engine extracts data, detects tamper anomalies, and audits regulatory compliance.
          </p>
        </div>

        {/* Sample Document Picker */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_DOCS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDoc(doc);
                setHasScanned(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedDoc.id === doc.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {doc.title.split(' ')[0]} {doc.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Virtual Document Preview with Laser Scan */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl p-5 border border-slate-800 relative overflow-hidden text-slate-300 font-mono text-xs">
          {/* Laser Sweep Effect */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce z-20" />
          )}

          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200 font-semibold">{selectedDoc.filename}</span>
            </div>
            <span className="text-[10px] text-slate-500">{selectedDoc.category}</span>
          </div>

          {/* Synthetic Document Canvas */}
          <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800/80 space-y-3 relative">
            <div className="flex justify-between items-center text-[10px] text-slate-400 pb-2 border-b border-slate-800">
              <span>ISSUER: {selectedDoc.issuer}</span>
              <span className="text-emerald-400">HASH: SHA256-OK</span>
            </div>

            <div className="space-y-1.5">
              <div className="h-3 bg-slate-800 rounded-sm w-3/4" />
              <div className="h-3 bg-slate-800 rounded-sm w-1/2" />
              <div className="h-3 bg-slate-800 rounded-sm w-5/6" />
            </div>

            {/* Bounding box simulation */}
            <div className="border border-cyan-500/50 bg-cyan-500/5 rounded p-2 text-[11px] text-cyan-300">
              <span className="text-[9px] uppercase tracking-wider text-cyan-400 block mb-0.5">
                Target Entity: {Object.keys(selectedDoc.entities)[0]}
              </span>
              <p className="font-bold text-white">{Object.values(selectedDoc.entities)[0]}</p>
            </div>

            <div className="border border-emerald-500/40 bg-emerald-500/5 rounded p-2 text-[11px] text-emerald-300">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 block mb-0.5">
                Authenticity Seal & Date
              </span>
              <p className="font-medium text-slate-200">{selectedDoc.date}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>TLS 1.3 / AES-256 Storage</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunScan}
              disabled={isScanning}
              className="text-xs bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />}
            >
              {isScanning ? 'Scanning...' : 'Rescan Document'}
            </Button>
          </div>
        </div>

        {/* Right Side: Real-time Analysis Telemetry */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Scanning Progress Banner */}
          {isScanning && (
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <Scan className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <div>
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    STAGE {scanStage + 1} OF {stages.length}
                  </p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                    {stages[scanStage]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasScanned && !isScanning && (
            <div className="space-y-5">
              {/* Score & Verdict Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
                    Compliance Score
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {selectedDoc.score}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
                    Fraud Risk Level
                  </span>
                  <div className="mt-1">
                    <Badge variant={selectedDoc.riskLevel === 'LOW' ? 'success' : 'warning'}>
                      {selectedDoc.riskLevel} RISK
                    </Badge>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
                    AI Provider
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Gemini 2.5 Flash
                  </p>
                </div>
              </div>

              {/* Extracted Entities */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Extracted Intelligence Fields
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedDoc.entities).map(([key, val]) => (
                    <div key={key} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">{key}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Warnings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Automated Regulatory Checks
                </h4>
                <div className="space-y-1.5">
                  {selectedDoc.rulesPassed.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                  {selectedDoc.anomalies.map((anomaly, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{anomaly}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Ready to test with your own organization documents?
                </span>
                <Link to="/register">
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Free Account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
