import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Download,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { ApplicationListItem } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, RiskBadge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const ReviewerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const { success, error } = useToast();

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await api.listApplications({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setApplications(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQueue();
  };

  const filteredApps = applications.filter((app) => {
    if (riskFilter && app.current_risk_score !== riskFilter) return false;
    return true;
  });

  const pendingReview = applications.filter(
    (a) => a.status === 'UNDER_HUMAN_REVIEW' || a.status === 'SUBMITTED'
  ).length;
  const highPriority = applications.filter(
    (a) => a.current_risk_score === 'HIGH'
  ).length;
  const needsInfoCount = applications.filter((a) => a.status === 'NEEDS_INFORMATION').length;
  const verifiedCount = applications.filter((a) => a.status === 'VERIFIED').length;

  const handleExportCSV = () => {
    if (applications.length === 0) return;
    const headers = ['Reference No', 'Category', 'Applicant', 'Status', 'Risk Score', 'Created At'];
    const rows = filteredApps.map(a => [
      `"${a.reference_no}"`,
      `"${a.category_name || ''}"`,
      `"${a.applicant_name || ''}"`,
      `"${a.status}"`,
      `"${a.current_risk_score || 'N/A'}"`,
      `"${new Date(a.created_at).toISOString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_verify_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApps.map((a) => a.id));
    }
  };

  const toggleSelectOne = (appId: string) => {
    setSelectedIds((prev) =>
      prev.includes(appId) ? prev.filter((i) => i !== appId) : [...prev, appId]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const appId of selectedIds) {
        await api.recordDecision(appId, {
          decision: 'VERIFIED',
          reason: 'Bulk Fast-Track Adjudication',
          explanation: 'Batch approved under standard institutional compliance parameters.'
        });
      }
      success(`Successfully verified ${selectedIds.length} applications.`);
      setSelectedIds([]);
      await fetchQueue();
    } catch (err: any) {
      error(err.message || 'Bulk adjudication encountered an error.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleExportSelectedCSV = () => {
    const targetApps = filteredApps.filter((a) => selectedIds.includes(a.id));
    if (targetApps.length === 0) return;
    const headers = ['Reference No', 'Category', 'Applicant', 'Status', 'Risk Score', 'Created At'];
    const rows = targetApps.map((a) => [
      `"${a.reference_no}"`,
      `"${a.category_name || ''}"`,
      `"${a.applicant_name || ''}"`,
      `"${a.status}"`,
      `"${a.current_risk_score || 'N/A'}"`,
      `"${new Date(a.created_at).toISOString()}"`
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_verify_selected_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Reviewer Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Compliance Reviewer Workspace
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Application Verification Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Conduct side-by-side document extractions, evaluate preliminary AI findings, and record reasoned determinations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Queue (CSV)
        </Button>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Awaiting Human Review</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{pendingReview}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Requires reviewer sign-off</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High Risk Flags</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{highPriority}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Field mismatch or tamper indicator</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Needs Information</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{needsInfoCount}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Waiting on applicant upload</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{verifiedCount}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Approved by reviewer</span>
        </div>
      </div>

      {/* Queue Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Active Application Queue</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect submitted dossiers and rule evaluations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reference or applicant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 sm:w-56"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="UNDER_HUMAN_REVIEW">Under Review</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="NEEDS_INFORMATION">Needs Information</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Risk Tiers</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Sticky Bulk Action Floating Bar */}
          {selectedIds.length > 0 && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/70 border-b border-indigo-100 dark:border-indigo-900 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  {selectedIds.length} application{selectedIds.length > 1 ? 's' : ''} selected for batch action
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleBulkApprove}
                  isLoading={isBulkProcessing}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Fast-Track Verify ({selectedIds.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelectedCSV}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Export CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : filteredApps.length === 0 ? (
            <EmptyState
              title="No applications in queue"
              description="No applications match your selected filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredApps.length > 0 && selectedIds.length === filteredApps.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th className="py-3 px-5">Reference</th>
                    <th className="py-3 px-4">Applicant & Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Risk Tier</th>
                    <th className="py-3 px-4">Assigned Reviewer</th>
                    <th className="py-3 px-5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        selectedIds.includes(app.id) ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelectOne(app.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                        {app.reference_no}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">{app.applicant_name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{app.title}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{app.category_name}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge risk={app.current_risk_score} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {app.assigned_reviewer_name || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <Link to={`/reviewer/applications/${app.id}`}>
                          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            Inspect & Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
