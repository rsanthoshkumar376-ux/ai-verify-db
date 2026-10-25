import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileSearch,
  Scale,
  History,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Copy,
  Check,
  Terminal,
  Calculator,
  TrendingUp,
  Sparkles,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LiveScannerSandbox } from '../../components/common/LiveScannerSandbox';

export const LandingPage: React.FC = () => {
  const [monthlyVolume, setMonthlyVolume] = useState<number>(3500);
  const [officerHourlyRate, setOfficerHourlyRate] = useState<number>(28);
  const [apiTab, setApiTab] = useState<'curl' | 'python' | 'ts'>('curl');
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // ROI math
  const manualMinutesPerCase = 24;
  const automatedMinutesPerCase = 0.5;
  const minutesSavedPerCase = manualMinutesPerCase - automatedMinutesPerCase;
  const hoursSavedPerMonth = Math.round((monthlyVolume * minutesSavedPerCase) / 60);
  const monthlyCostSavings = Math.round(hoursSavedPerMonth * officerHourlyRate);
  const annualCostSavings = monthlyCostSavings * 12;

  const snippets = {
    curl: `curl -X GET "https://ai-verify-db.vercel.app/api/v1/applications/verify/AIV-SCH-2026-81923" \\
  -H "Accept: application/json" \\
  -H "X-Client-Signature: aiv_sec_live_948a"`,
    python: `import requests

url = "https://ai-verify-db.vercel.app/api/v1/applications/verify/AIV-SCH-2026-81923"
headers = {"X-Client-Signature": "aiv_sec_live_948a"}

response = requests.get(url, headers=headers)
data = response.json()

print(f"Status: {data['status']} | Verified At: {data['verified_at']}")
print(f"SHA-256 Fingerprint: {data['cryptographic_fingerprint']}")`,
    ts: `import { verifyCredential } from '@ai-verify/sdk';

const response = await fetch(
  'https://ai-verify-db.vercel.app/api/v1/applications/verify/AIV-SCH-2026-81923',
  {
    headers: { 'X-Client-Signature': 'aiv_sec_live_948a' }
  }
);
const credential = await response.json();
console.log(credential.determination, credential.cryptographic_fingerprint);`
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const faqs = [
    {
      q: 'Does AI Verify make automated adverse decisions or legal determinations?',
      a: 'No. AI Verify functions exclusively as an intelligent decision-support platform. All AI extractions and rule evaluations are presented as preliminary verification results. High-risk determinations and rejections require review and sign-off by an authorized human compliance officer.',
    },
    {
      q: 'How does the platform handle document tampering and metadata inconsistencies?',
      a: 'Our engine inspects file container structures, compares modification timestamps against creation dates, checks for duplicate SHA-256 cryptographic hashes across submitted applications, cross-verifies names, and identifies rasterization anomalies.',
    },
    {
      q: 'Can compliance rules be modified without code deployments?',
      a: 'Yes. AI Verify features a fully configurable, deterministic rules engine. Authorized compliance administrators can define new rule parameters, set numeric thresholds (e.g. income ceilings or minimum GPAs), adjust required evidence, and configure jurisdiction-specific policies in real time.',
    },
    {
      q: 'Are uploaded documents stored in public cloud storage?',
      a: 'Never. Uploaded documents are stored strictly in private, sandboxed object storage with strict role-based access controls and randomized UUID filenames. Documents cannot be accessed without authenticated, authorized user tokens.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              Enterprise Application & Compliance Verification System
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Verify Documents. <br className="hidden sm:inline" />
              Validate Applications. <br className="hidden sm:inline" />
              <span className="text-indigo-600 dark:text-indigo-400">Simplify Compliance.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Accelerate institutional applications and regulatory checks with AI-assisted document intelligence, deterministic compliance rules, tamper detection, and human-in-the-loop oversight.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Verification
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline">
                  Explore Platform
                </Button>
              </Link>
            </div>

            {/* Quick credentials helper for live demonstration */}
            <div className="mt-8 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 inline-flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Pre-seeded Test Roles:</span>
              <span>Applicant: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">applicant@aiverify.org</code></span>
              <span>Reviewer: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">reviewer@aiverify.org</code></span>
              <span>Admin: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">admin@aiverify.org</code></span>
              <span className="text-slate-400">Password: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">[Role]123!</code></span>
            </div>
          </div>

          {/* Interactive Preview Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-900 p-2 sm:p-3 shadow-2xl">
            <div className="rounded-xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
              {/* Mock browser header */}
              <div className="h-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-mono">
                    ai-verify.enterprise/reviewer/verification-review
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">AI-Assisted Preliminary Assessment</Badge>
                </div>
              </div>

              {/* Mock content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Application Reference</span>
                    <Badge variant="success">Low Risk (0.10)</Badge>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">AIV-SCH-2026-81923</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Postgraduate Fellowship in Advanced Machine Intelligence</p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Applicant:</span><span className="font-medium text-slate-800 dark:text-slate-200">Sarah Jenkins</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Institution:</span><span className="font-medium text-slate-800 dark:text-slate-200">MIT</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">GPA:</span><span className="font-medium text-slate-800 dark:text-slate-200">3.85 / 4.0</span></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Document Extraction</span>
                    <Badge variant="success">Matched 100%</Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Holder Legal Name</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">Sarah Jenkins</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Document Serial</span>
                      <span className="font-semibold text-slate-900 dark:text-white">P-9842103</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">SHA-256 Digest</span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">d93fa8...e12</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Compliance Evaluation</span>
                    <Badge variant="info">3 Rules Passed</Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>CR-ID-01: Identity Recency Valid</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>CR-SCH-01: GPA &gt;= 3.0 Satisfied</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>CR-NAME-01: Name Match Exact</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <Link to="/applicant" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-1">
                      Explore live reviewer workspace <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Verification Sandbox */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LiveScannerSandbox />
        </div>
      </section>

      {/* 2. Core Pillars / Features */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Enterprise Architecture</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Engineered for Auditability, Accuracy, and Scale
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm leading-relaxed">
              Every verification combines machine-speed extraction with deterministic legal rules and auditable decision history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <FileSearch className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Document Intelligence</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automated OCR parsing and schema-driven field extraction for identity cards, corporate charters, tax transcripts, and proposals.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Deterministic Rules Engine</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Configurable validation logic evaluating age requirements, expiry thresholds, income caps, and document completeness with full versioning.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Tamper & Duplicate Detection</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                SHA-256 duplicate submission detection, container metadata inspection, modification rollback checks, and name variance scoring.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <History className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Human-in-the-Loop Audit</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mandatory human review for consequential decisions, immutable event audit logs, timestamped notes, and downloadable PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three-Step Workflow */}
      <section className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">End-to-End Workflow</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              From Submission to Verifiable Assessment in 3 Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Structured Submission</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Applicants complete multi-step categorical wizards with client and server-side validation, uploading authenticated PDF, PNG, or JPEG files.
              </p>
            </div>

            <div className="relative p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">AI Extraction & Rules Run</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The platform executes OCR, extracts fields with confidence estimates, cross-references declarations, and evaluates regulatory compliance rules.
              </p>
            </div>

            <div className="relative p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Authorized Review & Report</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Authorized compliance officers verify findings side-by-side, record reasoned decisions, request additional information if needed, and export formal PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Enterprise ROI & Cost Reduction Calculator */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
              <Calculator className="w-3.5 h-3.5" />
              Institutional Financial Impact
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interactive Compliance ROI Calculator
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Calculate projected labor savings and compliance velocity by automating first-pass document extraction and deterministic rule evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Sliders Input Column */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Monthly Application Volume
                  </label>
                  <span className="text-base font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                    {monthlyVolume.toLocaleString()} apps/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="20000"
                  step="100"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>200</span>
                  <span>10,000</span>
                  <span>20,000+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Reviewer Loaded Wage
                  </label>
                  <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    ${officerHourlyRate}/hr
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="1"
                  value={officerHourlyRate}
                  onChange={(e) => setOfficerHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>$15/hr</span>
                  <span>$50/hr</span>
                  <span>$90/hr</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Manual review baseline:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">24.0 mins/case</strong>
                </div>
                <div className="flex justify-between">
                  <span>With AI Verify pre-screening:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-mono">30 secs/case</strong>
                </div>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-600 text-white shadow-lg space-y-1 col-span-2">
                <span className="text-xs font-medium text-indigo-100 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Projected Annual Net Savings
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                  ${annualCostSavings.toLocaleString()}
                </div>
                <p className="text-xs text-indigo-200 mt-1">
                  Based on ${monthlyCostSavings.toLocaleString()} in monthly recovered compliance officer hours.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Hours Saved
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {hoursSavedPerMonth.toLocaleString()} hrs
                </div>
                <p className="text-[11px] text-slate-400">Monthly freed bandwidth</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Speedup
                </span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  98% faster
                </div>
                <p className="text-[11px] text-slate-400">Turnaround acceleration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer REST API & Public Credential Registry Section */}
      <section className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold mb-3 border border-slate-200 dark:border-slate-700">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              Developer & API Integration
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Programmatic Credential Verification
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Seamlessly integrate automated credential validation and tamper checks directly into your internal workflows, portals, or mobile apps via REST.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Tab header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setApiTab('curl')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    apiTab === 'curl'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setApiTab('python')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    apiTab === 'python'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setApiTab('ts')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    apiTab === 'ts'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  TypeScript
                </button>
              </div>

              <button
                onClick={() => copyCode(snippets[apiTab])}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto bg-slate-900/90 leading-relaxed">
              <pre>{snippets[apiTab]}</pre>
            </div>

            {/* Live Verification API Output preview */}
            <div className="px-5 py-4 bg-slate-950/80 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> HTTP 200 OK — Verified Response Payload
                </span>
                <span className="text-[10px] font-mono text-slate-500">14ms latency</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto bg-slate-900 p-3 rounded-xl border border-slate-800">
{`{
  "is_valid": true,
  "reference_no": "AIV-SCH-2026-81923",
  "category_name": "Academic & Research Fellowship",
  "status": "VERIFIED",
  "risk_level": "LOW",
  "cryptographic_fingerprint": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "compliance_officer": "Marcus Vance (Senior Officer)",
  "issuing_authority": "AI Verify Cryptographic Verification Authority (v1.0)"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Security & Privacy Safeguards */}
      <section className="py-16 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-indigo-400 text-xs font-semibold mb-4 border border-slate-700">
                <Lock className="w-3.5 h-3.5" /> Security & Privacy First
              </div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                Institutional Data Protection and Zero-Trust Storage
              </h3>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                We implement least-privilege role boundaries, file signature inspection, randomized object names, and strictly confidential storage buckets.
              </p>

              <div className="mt-8 space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Magic byte file signature verification prevents executable masquerading.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Applicant separation ensures individuals can only access their own records.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Document contents are never exposed through unauthenticated public URLs.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Prompt injection safeguards isolate untrusted document content in strict schemas.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-4">Responsible AI & Legal Boundaries</h4>
              <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                <p>
                  <strong className="text-slate-200">No Legal Certification:</strong> Reports generated by AI Verify are preliminary decision-support assessments and do not replace legal counsel, sworn statutory declarations, or official state registry certifications.
                </p>
                <p>
                  <strong className="text-slate-200">Human Adverse Decisions:</strong> Applications with discrepancies or missing items are flagged for human review or clarification requests, not automatic rejection.
                </p>
                <p>
                  <strong className="text-slate-200">Demonstration Rules:</strong> Pre-loaded rules are labeled "Demonstration Rule — Not Legal Advice" for evaluation and workflow modeling purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQs */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Questions & Answers</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{faq.q}</h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Footer Banner */}
      <section className="py-16 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-extrabold tracking-tight">Ready to verify with confidence?</h3>
          <p className="mt-3 text-indigo-100 text-sm max-w-xl mx-auto">
            Experience the automated extraction, deterministic rules, and reviewer workspace in our full-stack demonstration environment.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 font-semibold shadow-md">
                Get Started Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-white border-white/60 hover:bg-indigo-700">
                Contact Advisory
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
