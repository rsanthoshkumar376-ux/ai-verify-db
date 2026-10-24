import React from 'react';
import { Shield, Target, Users, Scale, AlertOctagon } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Institutional Purpose
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            About AI Verify
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            AI Verify is built to empower organizations, educational institutions, and public authorities to validate documentation, prevent repetitive manual data extraction, and streamline compliance with human oversight.
          </p>
        </div>

        <div className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Project Mission
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Manual document inspection in application processing is traditionally slow, error-prone, and inconsistent. Reviewers spend hours transcribing fields and cross-checking dates. AI Verify automates the preliminary data extraction and checks applications against transparent regulatory rules, allowing human experts to focus their scrutiny where high-risk anomalies emerge.
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Intended User Roles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs mb-1">Applicants</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Individuals submitting credentials, licenses, or grant applications with real-time field validation and transparency into verification progress.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs mb-1">Compliance Reviewers</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Officers evaluating side-by-side extracted data, reviewing automated tamper flags, and recording reasoned decisions.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs mb-1">Administrators</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Compliance directors managing rule definitions, auditing event history, configuring user roles, and monitoring operational analytics.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Ethical Guardrails & Known Limitations
            </h2>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Human Primacy:</strong> Rejections cannot be generated solely by automated AI confidence scores. Every adverse action requires human reviewer justification.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Preliminary Indicator Status:</strong> AI extractions and rule evaluation statuses are preliminary findings to assist verification, not infallible proof of authenticity.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">No Direct Government Ties:</strong> Demonstration rule sets and synthetic categories simulate real-world workflows but do not represent direct integrations with government registry databases unless specifically authorized and configured.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
