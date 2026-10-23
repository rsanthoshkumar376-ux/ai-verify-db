import React, { useState } from 'react';
import { Sparkles, X, Info } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs border-b border-indigo-800/40">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <span className="flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-semibold border border-indigo-400/30 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          DEMO MODE ACTIVE
        </span>
        <span className="text-slate-300 truncate">
          Synthetic demonstration environment. AI document extraction & compliance rules are running with deterministic local simulation. Results are simulated preliminary assessments.
        </span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-slate-400 hover:text-white p-1 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
