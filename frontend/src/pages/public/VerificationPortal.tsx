import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Printer, 
  ExternalLink, 
  FileText, 
  Lock, 
  Calendar, 
  Building,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QrCode } from '../../components/ui/QrCode';

export const VerificationPortal: React.FC = () => {
  const { reportCode } = useParams<{ reportCode?: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(reportCode || '');
  const [isSearching, setIsSearching] = useState(false);
  const [reportData, setReportData] = useState<{
    code: string;
    verified: boolean;
    entityName: string;
    category: string;
    issuedAt: string;
    riskScore: number;
    sha256: string;
    authority: string;
    checks: string[];
  } | null>(null);

  const performLookup = (code: string) => {
    setIsSearching(true);
    // Simulate lookup with deterministic values based on code
    setTimeout(() => {
      setReportData({
        code: code.toUpperCase(),
        verified: true,
        entityName: 'Apex Research Scholars Corp. (Sarah Jenkins)',
        category: 'Identity & Regulatory Compliance Audit',
        issuedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        riskScore: 98,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        authority: 'AI Verify Cryptographic Verification Authority (v1.0)',
        checks: [
          'Cryptographic Digital Signature Validation: PASS',
          'Anti-Tampering & Metadata Forensics: NO ALTERATIONS DETECTED',
          'Biometric Photo & Holographic Watermark: VERIFIED',
          'Regulatory Sanctions & Expiry Check: FULLY COMPLIANT'
        ]
      });
      setIsSearching(false);
    }, 400);
  };

  useEffect(() => {
    if (reportCode) {
      performLookup(reportCode);
    } else {
      // Default to demo report code
      performLookup('REP-2026-DEMO-VERIFIED');
    }
  }, [reportCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${searchInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Public Registry & Certificate Verification Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Verify Document Authenticity
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Validate the cryptographic seal, tamper status, and regulatory approval of any certificate or application issued by AI Verify.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Report Code (e.g. REP-2026-DEMO-VERIFIED)"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={isSearching}
              className="px-6 py-2.5"
            >
              {isSearching ? 'Verifying...' : 'Verify Now'}
            </Button>
          </form>
        </div>

        {/* Certificate Card */}
        {reportData && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden print:shadow-none print:border-none">
            {/* Certificate Header Banner */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 px-6 sm:px-10 py-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-indigo-200 font-bold">
                  Official Verification Record
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
                  {reportData.code}
                </h2>
                <p className="text-xs text-indigo-100 flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5" /> Certified on {reportData.issuedAt}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span className="font-bold text-sm tracking-wide text-white">
                  CRYPTOGRAPHICALLY VERIFIED
                </span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Target Entity / Verified Holder
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {reportData.entityName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Verification Scope</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{reportData.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Integrity Score</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {reportData.riskScore} / 100 (High Confidence)
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Issuing Verification Authority
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {reportData.authority}
                    </span>
                  </div>
                </div>

                {/* QR Code Matrix */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <QrCode value={`https://ai-verify-db.vercel.app/verify/${reportData.code}`} size={110} />
                  <span className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-wider">
                    Scan to Validate Live
                  </span>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Audited Verification Checks & Compliance Assertions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {reportData.checks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-medium text-[11px]">{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHA-256 Fingerprint */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
                <div className="truncate pr-2">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-sans">
                    SHA-256 Immutability Fingerprint
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 text-[11px]">{reportData.sha256}</span>
                </div>
                <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print Certificate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
