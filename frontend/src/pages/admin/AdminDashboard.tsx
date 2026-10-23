import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  Cpu,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../../services/api';
import { AdminMetrics } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await api.getMetrics();
        setMetrics(data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (isLoading || !metrics) {
    return <TableSkeleton rows={4} cols={4} />;
  }

  // Formatting chart data
  const outcomeData = Object.entries(metrics.outcome_distribution || {}).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    count,
  }));

  const riskData = Object.entries(metrics.risk_distribution || {}).map(([risk, count]) => ({
    name: `${risk} Risk`,
    value: count,
  }));

  const RISK_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];
  const OUTCOME_COLOR = '#6366f1';

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Executive Intelligence
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Platform Operations & Metrics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Database-driven performance indicators, compliance issues, and verification outcomes.
          </p>
        </div>

        {/* AI System Badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900">AI Intelligence Core:</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{metrics.ai_status.provider}</span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Applications</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.total_applications}</p>
          <span className="text-[11px] text-indigo-600 font-medium">
            +{metrics.applications_this_month} submitted this month
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Awaiting Human Review</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{metrics.applications_awaiting_review}</p>
          <span className="text-[11px] text-slate-500">Active reviewer queue</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Documents Processed</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.documents_processed}</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% hash verified</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Avg. Verification Time</span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">
            {metrics.average_processing_time_minutes}m
          </p>
          <span className="text-[11px] text-slate-500">Automated extraction & rules</span>
        </div>
      </div>

      {/* Chart Rows 1: Volume Over Time & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Volume Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Volume Over Time (Last 7 Days)</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Live database daily submission count</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.volume_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Breakdown Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Current Risk Tier Distribution</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Calculated by tamper & rule non-conformances</p>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs font-semibold mt-2">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Rows 2: Verification Outcomes & Reviewer Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Application Verification Outcomes</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Breakdown by current lifecycle status</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill={OUTCOME_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reviewer Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Reviewer Workload Distribution</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Active assigned applications per reviewer</p>
          </CardHeader>
          <CardContent className="h-64">
            {metrics.reviewer_workload.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No assigned applications.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.reviewer_workload} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="assigned" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
