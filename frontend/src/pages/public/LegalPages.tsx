import React from 'react';
import { AlertTriangle, ShieldCheck, Scale, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-8 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">DEMONSTRATION STARTER POLICY:</span> This document represents an illustrative policy template and must undergo formal legal, privacy, and regulatory review by qualified legal counsel prior to any production deployment.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Privacy & Sensitive Data Handling Policy</h1>
          <p className="text-slate-400 dark:text-slate-500">Effective Date: October 2026 | Version 1.0.0-DEMO</p>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">1. Scope and Purpose</h2>
            <p>
              AI Verify processes sensitive digital documents, including identification records, academic transcripts, and corporate certificates, solely for the purpose of validating submitted applications and assisting authorized compliance personnel.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">2. Data Minimization & Private Storage</h2>
            <p>
              Uploaded files are stored in private, sandboxed object storage using randomized UUID object names. Files are never indexed on public endpoints. Magic byte signatures and SHA-256 hashes are calculated upon upload to ensure file integrity and prevent duplicate submissions.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">3. Role-Based Access Controls (RBAC)</h2>
            <p>
              Access to application dossiers is restricted: Applicants may access only their own submissions. Compliance reviewers may only inspect assigned or authorized queues. Administrators oversee configuration and audit trails without modifying evidentiary document blobs.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">4. AI Processing Safeguards</h2>
            <p>
              Document text processed by automated extraction pipelines is handled within isolated memory environments. Document contents are not used to train public machine learning foundation models.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">5. Data Retention & Deletion</h2>
            <p>
              Demonstration records may be purged or reset by administrators. In production configurations, document retention periods must align with applicable sector regulations and statutory archiving policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-8 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">DEMONSTRATION STARTER TERMS:</span> These verification terms are illustrative starter terms and must be reviewed and customized by an authorized legal professional before binding use.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Terms of Verification Service</h1>
          <p className="text-slate-400 dark:text-slate-500">Effective Date: October 2026 | Version 1.0.0-DEMO</p>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">1. Nature of Automated Findings</h2>
            <p>
              AI Verify provides algorithmic verification assistance, OCR transcription, and preliminary rule evaluation. Findings generated by the platform do NOT constitute sworn legal proof, judicial testimony, or official government registry confirmation.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">2. Mandatory Human Review for Adverse Actions</h2>
            <p>
              An application with missing information or field mismatches must not be automatically treated as fraudulent. Any rejection or consequential adverse decision must be independently reviewed and executed by an authorized human officer.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">3. Applicant Warranties</h2>
            <p>
              Applicants submitting files warrant that they possess the legal right and authority to provide the submitted records and that all information entered is accurate to the best of their knowledge.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">4. Limitation of Liability</h2>
            <p>
              AI Verify Technologies disclaims all liability for regulatory fines, delayed processing, or administrative outcomes resulting from reliance upon preliminary automated assessment reports without authorized human verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
