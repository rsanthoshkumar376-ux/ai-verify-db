import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  ScanText,
  GitCompare,
  Scale,
  UserCheck,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Application Submission',
      desc: 'Applicants select an application category and complete a structured digital questionnaire with conditional fields, real-time client-side validation, and instant draft saving.',
      icon: FileText,
      tech: 'FastAPI + Pydantic Form Schema',
    },
    {
      num: '02',
      title: 'Secure Document Upload',
      desc: 'Supporting identity cards, transcripts, or corporate filings are uploaded. The platform inspects magic header byte signatures to reject spoofed extensions and stores files in private storage.',
      icon: Upload,
      tech: 'Magic-byte Validation + SHA-256 Hashing',
    },
    {
      num: '03',
      title: 'OCR & Metadata Normalization',
      desc: 'Machine-readable text and container metadata are extracted safely via pypdf and Pillow. PDF authoring tools, creation dates, and digital signature records are evaluated for rollback anomalies.',
      icon: ScanText,
      tech: 'pypdf + Pillow Metadata Extraction',
    },
    {
      num: '04',
      title: 'AI Field Extraction & Cross-Comparison',
      desc: 'Key fields such as applicant full name, document ID number, issue date, and declared financials are extracted and cross-checked against form declarations to identify discrepancies or mismatches.',
      icon: GitCompare,
      tech: 'Structured Schema Extraction + Confidence Scoring',
    },
    {
      num: '05',
      title: 'Deterministic Compliance Engine',
      desc: 'The application is run through configurable, versioned compliance rules. Rules evaluate document recency, numeric thresholds, mandatory documents, and jurisdictional standards.',
      icon: Scale,
      tech: 'Configurable Rules Engine + Version Tracking',
    },
    {
      num: '06',
      title: 'Authorized Human Reviewer Verification',
      desc: 'Compliance officers inspect side-by-side extractions, verify flagged inconsistencies, request additional documentation if needed, and log reasons for decisions in the audit trail.',
      icon: UserCheck,
      tech: 'Role-Based Access Control (RBAC) + Audit Logging',
    },
    {
      num: '07',
      title: 'Report Generation & Verification Audit',
      desc: 'A structured, downloadable verification PDF report is compiled with full provenance, rule version references, reviewer decisions, and standard compliance disclaimers.',
      icon: FileCheck2,
      tech: 'ReportLab PDF Compilation Engine',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-16 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Verification Pipeline
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            How AI Verify Validates Documents & Ensures Compliance
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            Our 7-stage pipeline combines algorithmic verification speed with strict human reviewer oversight, ensuring data accuracy and transparent regulatory compliance.
          </p>
        </div>

        {/* Timeline steps */}
        <div className="space-y-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center gap-6 transition-colors"
              >
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xl font-mono font-bold text-slate-300 dark:text-slate-600">{s.num}</span>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{s.title}</h3>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {s.tech}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compliance Note */}
        <div id="compliance" className="mt-16 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-6 text-xs text-blue-900 dark:text-blue-200 leading-relaxed flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1">Regulatory Standards & Legal Boundaries</h4>
            <p>
              AI Verify presents findings as preliminary verification indicators to assist authorized reviewers. The platform does not claim official government endorsement, sworn legal certification, or automated statutory determinations.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/register">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Test the Verification Flow
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
