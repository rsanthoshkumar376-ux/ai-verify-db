import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api';
import { ApplicationListItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, RiskBadge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const ApplicantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApps = async () => {
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
    fetchApps();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApps();
  };

  const totalApps = applications.length;
  const draftApps = applications.filter((a) => a.status === 'DRAFT').length;
  const submittedApps = applications.filter((a) => a.status === 'SUBMITTED' || a.status === 'PROCESSING' || a.status === 'UNDER_HUMAN_REVIEW').length;
  const needsInfoApps = applications.filter((a) => a.status === 'NEEDS_INFORMATION').length;
  const verifiedApps = applications.filter((a) => a.status === 'VERIFIED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Applicant Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Welcome, {user?.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor verification status, respond to reviewer inquiries, or start a new application.
          </p>
        </div>
        <Link to="/applicant/wizard">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Application
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Submissions</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalApps}</p>
          <span className="text-[11px] text-slate-400">All registered dossiers</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Verification</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{submittedApps}</p>
          <span className="text-[11px] text-slate-400">Processing or under review</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Needs Information</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{needsInfoApps}</p>
          <span className="text-[11px] text-slate-400">Action required by applicant</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verified & Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{verifiedApps}</p>
          <span className="text-[11px] text-slate-400">Verification complete</span>
        </div>
      </div>

      {/* Applications Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>My Applications</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Review current progress, risk ratings, and attached supporting records
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reference or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 w-48 sm:w-56"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="PROCESSING">Processing</option>
              <option value="NEEDS_INFORMATION">Needs Information</option>
              <option value="UNDER_HUMAN_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications found"
              description="You have not created any applications matching the selected criteria."
              actionText="Create Application"
              onAction={() => (window.location.href = '/applicant/wizard')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5">Application Reference</th>
                    <th className="py-3 px-4">Title & Category</th>
                    <th className="py-3 px-4">Submitted / Updated</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Risk Tier</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-slate-900">
                        {app.reference_no}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{app.title}</div>
                        <div className="text-[11px] text-slate-500">{app.category_name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(app.updated_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge risk={app.current_risk_score} />
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <Link to={`/applicant/applications/${app.id}`}>
                          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            {app.status === 'DRAFT' ? 'Resume' : 'View'}
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
