import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Copy,
  Printer,
  FileCheck,
  Lock,
  ExternalLink,
  Award,
  Calendar,
  Building2,
  UserCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

interface VerificationResult {
  is_valid: boolean;
  application_id: string;
  reference_no: string;
  title: string;
  category_name: string;
  category_code: string;
  status: string;
  risk_level: string;
  submitted_at: string;
  verified_at: string;
  issuing_authority: string;
  cryptographic_fingerprint: string;
  document_count: number;
  determination: string;
  compliance_officer: string;
}

export const PublicVerificationPage: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const initialQuery = code || searchParams.get('ref') || 'AIV-SCH-2026-81923';

  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { success } = useToast();

  const handleVerify = async (refCode: string) => {
    if (!refCode.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.verifyPublicCredential(refCode.trim());
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'No official verification record found for this credential.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleVerify(initialQuery);
    }
  }, [initialQuery]);

  const copyFingerprint = () => {
    if (result) {
      navigator.clipboard.writeText(result.cryptographic_fingerprint);
      success('Cryptographic SHA-256 fingerprint copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Lock className="w-3.5 h-3.5" />
            Public Trust & Credential Verification Registry
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cryptographic Credential Verification
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Scan QR codes or enter reference numbers to verify credential authenticity, tamper resistance, and official human compliance determinations.
          </p>
        </div>

        {/* Verification Search Bar */}
        <Card className="shadow-md border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify(query);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter credential reference (e.g. AIV-SCH-2026-81923 or UUID)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
              <Button type="submit" variant="primary" isLoading={isLoading} className="sm:w-auto w-full">
                Verify Credential
              </Button>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Quick inspect sample credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery('AIV-SCH-2026-81923');
                  handleVerify('AIV-SCH-2026-81923');
                }}
                className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                AIV-SCH-2026-81923 (Verified)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setQuery('AIV-BIZ-2026-44109');
                  handleVerify('AIV-BIZ-2026-44109');
                }}
                className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                AIV-BIZ-2026-44109 (Under Review)
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold">Credential Not Found or Unverified</p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Certificate Display */}
        {result && (
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-500/30 dark:border-indigo-400/20 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
            {/* Watermark Seal Background */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full pointer-events-none flex items-center justify-center">
              <Award className="w-48 h-48 text-indigo-500/10 dark:text-indigo-400/5" />
            </div>

            {/* Top Bar: Official Seal & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Certificate of Verification
                    </h2>
                    <Badge variant={result.status === 'VERIFIED' ? 'success' : 'warning'}>
                      {result.status === 'VERIFIED' ? 'AUTHENTIC & VERIFIED' : result.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Issued by {result.issuing_authority}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={() => window.print()}
                >
                  Print Certificate
                </Button>
                <Link to={`/applicant/applications/${result.application_id}`}>
                  <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
                    View In Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Credential Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Reference Identifier
                </span>
                <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                  {result.reference_no}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Regulatory Category
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block truncate">
                  {result.category_name}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Determination Status
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {result.determination}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Authorized Signoff
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {result.compliance_officer}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Verified Timestamp
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
                    {result.verified_at ? new Date(result.verified_at).toUTCString() : 'Active Processing'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Attached Proofs
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {result.document_count} Primary Artifact(s) Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Fingerprint Box */}
            <div className="p-4.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs uppercase tracking-wide">
                  <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Cryptographic Verification Fingerprint (SHA-256)
                </div>
                <button
                  type="button"
                  onClick={copyFingerprint}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Hash
                </button>
              </div>
              <p className="font-mono text-xs text-indigo-950 dark:text-indigo-300 break-all select-all bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-900">
                {result.cryptographic_fingerprint}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                This digital fingerprint is computed from immutable application timestamps, category identifiers, and supporting document hashes to guarantee zero retroactive tampering.
              </p>
            </div>

            {/* Legal Notice Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>AI Verify Regulatory Compliance Platform &bull; Global Attestation Node #04</span>
              </div>
              <span>Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">VALIDATED IMMUTABLE</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
