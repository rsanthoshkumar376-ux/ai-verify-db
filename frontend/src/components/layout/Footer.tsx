import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">AI Verify</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent application validation, document authentication, and deterministic regulatory compliance verification for modern enterprises and public sector workflows.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">Capabilities</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Document OCR Extraction</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Field Cross-Verification</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Tamper & Anomaly Flags</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Regulatory Rules Engine</Link></li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">Governance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">Platform Architecture</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy & Data Handling</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Verification</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Compliance Advisory</Link></li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">Notice & Limitations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI Verify generates AI-assisted preliminary verification outputs. Findings must not be construed as definitive legal proof or authorized government certification.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} AI Verify Technologies. All demonstration rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
