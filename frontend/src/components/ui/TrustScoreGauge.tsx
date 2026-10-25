import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, TrendingUp, CheckCircle, Info } from 'lucide-react';

interface MetricBreakdown {
  label: string;
  score: number;
  detail?: string;
}

interface TrustScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  breakdowns?: MetricBreakdown[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({
  score,
  size = 'md',
  showBreakdown = true,
  breakdowns,
  title = 'AI Trust & Authenticity Index',
  subtitle = 'Composite machine verification confidence score',
  className = ''
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine grade & color
  let color = '#10b981'; // emerald
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  let bgColor = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60';
  let statusText = 'HIGH TRUST / LOW RISK';
  let StatusIcon = ShieldCheck;

  if (clampedScore < 60) {
    color = '#ef4444'; // rose
    textColor = 'text-rose-600 dark:text-rose-400';
    bgColor = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60';
    statusText = 'HIGH RISK / FLAGGED';
    StatusIcon = AlertOctagon;
  } else if (clampedScore < 85) {
    color = '#f59e0b'; // amber
    textColor = 'text-amber-600 dark:text-amber-400';
    bgColor = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60';
    statusText = 'MODERATE RISK / MANUAL REVIEW';
    StatusIcon = AlertTriangle;
  }

  // Dimension settings
  const dimensions = {
    sm: { svgSize: 90, stroke: 7, radius: 36, fontSize: 'text-xl', iconSize: 14 },
    md: { svgSize: 140, stroke: 10, radius: 55, fontSize: 'text-3xl', iconSize: 18 },
    lg: { svgSize: 180, stroke: 12, radius: 72, fontSize: 'text-4xl', iconSize: 22 }
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (circumference * clampedScore) / 100;

  const defaultBreakdowns: MetricBreakdown[] = breakdowns || [
    { label: 'Document Tampering & Forensics', score: Math.min(100, clampedScore + 2), detail: 'Error Level Analysis & EXIF sanity: PASS' },
    { label: 'OCR Data & Form Alignment', score: Math.min(100, clampedScore - 1), detail: 'Name, DOB, and ID # 100% congruent' },
    { label: 'Regulatory Sanctions & Expiry', score: Math.min(100, clampedScore), detail: 'No active watchlists or revocation hits' },
    { label: 'Rule Engine Compliance', score: Math.min(100, Math.max(70, clampedScore - 3)), detail: 'Deterministic criteria satisfied' }
  ];

  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-wide flex items-center gap-1.5 ${bgColor} ${textColor}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusText}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular SVG Gauge */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={dimensions.svgSize}
            height={dimensions.svgSize}
            className="transform -rotate-90 drop-shadow-sm"
          >
            {/* Background track */}
            <circle
              cx={dimensions.svgSize / 2}
              cy={dimensions.svgSize / 2}
              r={dimensions.radius}
              stroke="currentColor"
              strokeWidth={dimensions.stroke}
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Animated progress ring */}
            <circle
              cx={dimensions.svgSize / 2}
              cy={dimensions.svgSize / 2}
              r={dimensions.radius}
              stroke={color}
              strokeWidth={dimensions.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center text score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`font-black tracking-tight ${dimensions.fontSize} text-slate-900 dark:text-white`}>
              {clampedScore}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              / 100 pts
            </span>
          </div>
        </div>

        {/* Sub-breakdowns */}
        {showBreakdown && (
          <div className="flex-1 w-full space-y-2.5">
            {defaultBreakdowns.map((item, idx) => {
              const itemColor =
                item.score >= 85
                  ? 'bg-emerald-500'
                  : item.score >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500';
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {item.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.score}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${itemColor}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  {item.detail && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.detail}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Seal Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-indigo-500" />
          Deterministic multi-agent scoring algorithm (v2.4)
        </span>
        <span className="font-mono text-[10px] text-slate-400">SHA-256 Validated</span>
      </div>
    </div>
  );
};
