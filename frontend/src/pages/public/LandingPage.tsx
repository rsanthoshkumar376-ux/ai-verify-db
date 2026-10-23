import React from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LiveScannerSandbox } from '../../components/common/LiveScannerSandbox';

export const LandingPage: React.FC = () => {
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
    <div className="bg-slate-50 text-slate-900 font-sans">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              Enterprise Application & Compliance Verification System
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Verify Documents. <br className="hidden sm:inline" />
              Validate Applications. <br className="hidden sm:inline" />
              <span className="text-indigo-600">Simplify Compliance.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
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
            <div className="mt-8 p-3 rounded-lg bg-slate-50 border border-slate-200 inline-flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Pre-seeded Test Roles:</span>
              <span>Applicant: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">applicant@aiverify.org</code></span>
              <span>Reviewer: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">reviewer@aiverify.org</code></span>
              <span>Admin: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">admin@aiverify.org</code></span>
              <span className="text-slate-400">Password: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">[Role]123!</code></span>
            </div>
          </div>

          {/* Interactive Preview Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-slate-900 p-2 sm:p-3 shadow-2xl">
            <div className="rounded-xl bg-white overflow-hidden border border-slate-200">
              {/* Mock browser header */}
              <div className="h-10 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-500 ml-2 font-mono">
                    ai-verify.enterprise/reviewer/verification-review
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">AI-Assisted Preliminary Assessment</Badge>
                </div>
              </div>

              {/* Mock content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Application Reference</span>
                    <Badge variant="success">Low Risk (0.10)</Badge>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">AIV-SCH-2026-81923</h4>
                  <p className="text-xs text-slate-600">Postgraduate Fellowship in Advanced Machine Intelligence</p>
                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-slate-500">Applicant:</span><span className="font-medium text-slate-800">Sarah Jenkins</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Institution:</span><span className="font-medium text-slate-800">MIT</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">GPA:</span><span className="font-medium text-slate-800">3.85 / 4.0</span></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Document Extraction</span>
                    <Badge variant="success">Matched 100%</Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600">Holder Legal Name</span>
                      <span className="font-semibold text-emerald-700">Sarah Jenkins</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600">Document Serial</span>
                      <span className="font-semibold text-slate-900">P-9842103</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600">SHA-256 Digest</span>
                      <span className="font-mono text-[10px] text-slate-500">d93fa8...e12</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Compliance Evaluation</span>
                    <Badge variant="info">3 Rules Passed</Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>CR-ID-01: Identity Recency Valid</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>CR-SCH-01: GPA &gt;= 3.0 Satisfied</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>CR-NAME-01: Name Match Exact</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <Link to="/applicant" className="text-xs text-indigo-600 font-medium hover:underline inline-flex items-center gap-1">
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
      <section className="py-16 bg-slate-100/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LiveScannerSandbox />
        </div>
      </section>

      {/* 2. Core Pillars / Features */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Enterprise Architecture</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
              Engineered for Auditability, Accuracy, and Scale
            </h3>
            <p className="text-slate-600 mt-3 text-sm leading-relaxed">
              Every verification combines machine-speed extraction with deterministic legal rules and auditable decision history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <FileSearch className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Document Intelligence</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated OCR parsing and schema-driven field extraction for identity cards, corporate charters, tax transcripts, and proposals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Deterministic Rules Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configurable validation logic evaluating age requirements, expiry thresholds, income caps, and document completeness with full versioning.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Tamper & Duplicate Detection</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                SHA-256 duplicate submission detection, container metadata inspection, modification rollback checks, and name variance scoring.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <History className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Human-in-the-Loop Audit</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mandatory human review for consequential decisions, immutable event audit logs, timestamped notes, and downloadable PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three-Step Workflow */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">End-to-End Workflow</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
              From Submission to Verifiable Assessment in 3 Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Structured Submission</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applicants complete multi-step categorical wizards with client and server-side validation, uploading authenticated PDF, PNG, or JPEG files.
              </p>
            </div>

            <div className="relative p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">AI Extraction & Rules Run</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The platform executes OCR, extracts fields with confidence estimates, cross-references declarations, and evaluates regulatory compliance rules.
              </p>
            </div>

            <div className="relative p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Authorized Review & Report</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authorized compliance officers verify findings side-by-side, record reasoned decisions, request additional information if needed, and export formal PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Security & Privacy Safeguards */}
      <section className="py-16 bg-slate-900 text-white">
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

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700">
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
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Questions & Answers</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-semibold text-slate-900 text-sm">{faq.q}</h4>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
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
