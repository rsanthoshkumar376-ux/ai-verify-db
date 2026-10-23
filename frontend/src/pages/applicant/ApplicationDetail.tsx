import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  RotateCw,
  Ban,
  MessageSquare,
  FileDown
} from 'lucide-react';
import { api } from '../../services/api';
import { ApplicationDetail, VerificationRun } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, RiskBadge, Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'extraction' | 'tamper' | 'compliance' | 'history'>('overview');

  const fetchApplication = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getApplication(id);
      setApplication(data);
    } catch (err: any) {
      error(err.message || 'Failed to load application.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleRunVerification = async () => {
    if (!id) return;
    setIsVerifying(true);
    try {
      await api.runVerification(id);
      success('Verification run executed successfully.');
      await fetchApplication();
    } catch (err: any) {
      error(err.message || 'Verification execution failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.withdrawApplication(id, 'Applicant requested voluntary withdrawal');
      success('Application withdrawn.');
      await fetchApplication();
    } catch (err: any) {
      error(err.message || 'Withdrawal failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Application Not Found</h2>
        <Link to="/applicant" className="text-indigo-600 hover:underline mt-2 inline-block text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const latestRun = application.verification_runs?.[0];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-lg font-bold text-slate-900">{application.reference_no}</span>
              <StatusBadge status={application.status} />
              <RiskBadge risk={application.current_risk_score} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{application.title} • {application.category_name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {latestRun && (
            <a
              href={api.getReportDownloadUrl(application.id)}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="sm" leftIcon={<FileDown className="w-4 h-4" />}>
                Export PDF Report
              </Button>
            </a>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunVerification}
            isLoading={isVerifying}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Re-run Verification
          </Button>

          {application.status !== 'WITHDRAWN' && application.status !== 'VERIFIED' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50"
              onClick={handleWithdraw}
              leftIcon={<Ban className="w-3.5 h-3.5" />}
            >
              Withdraw
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Documents
        </button>
        <button
          onClick={() => setActiveTab('extraction')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'extraction'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          AI Field Extraction ({latestRun?.extracted_fields?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('tamper')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'tamper'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tamper Indicators ({latestRun?.findings?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'compliance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Compliance Rules ({latestRun?.compliance_evaluations?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Timeline ({application.status_history?.length || 0})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dossier Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Declared Form Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {Object.entries(application.form_data || {}).map(([key, val]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block uppercase tracking-wider font-semibold text-[10px]">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-slate-900 font-semibold text-sm mt-0.5 block">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attached Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Attached Supporting Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.documents.length === 0 ? (
                  <p className="text-xs text-slate-400">No documents attached.</p>
                ) : (
                  application.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.original_filename}</p>
                          <p className="text-[11px] font-mono text-slate-500">
                            Type: {doc.document_type} • SHA-256: {doc.sha256_hash.substring(0, 16)}... • {(doc.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <a
                        href={api.getDocumentDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                          Download File
                        </Button>
                      </a>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Rail: Decision Notes & Assessment summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preliminary AI Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {latestRun ? (
                  <>
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 leading-relaxed">
                      {latestRun.summary}
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-slate-500">
                      <span>Engine Provider:</span>
                      <span className="font-semibold text-slate-800">{latestRun.ai_provider}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-slate-500">
                      <span>Calculated Risk Score:</span>
                      <span className="font-semibold text-slate-800">{latestRun.risk_score * 100}%</span>
                    </div>
                    <div className="flex justify-between py-2 text-slate-500">
                      <span>Simulated Environment:</span>
                      <Badge variant="neutral">{latestRun.is_demo_simulated ? 'Demo Mode' : 'Live Cloud'}</Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400">No verification execution recorded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Reviewer Decisions */}
            <Card>
              <CardHeader>
                <CardTitle>Reviewer Decisions & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {application.review_decisions?.length === 0 ? (
                  <p className="text-slate-400">Awaiting reviewer inspection.</p>
                ) : (
                  application.review_decisions.map((dec) => (
                    <div key={dec.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{dec.decision}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(dec.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-slate-700">{dec.reason}</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{dec.explanation}</p>
                      <p className="text-[10px] text-slate-400 pt-1">Recorded by: {dec.reviewer_name}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: EXTRACTION */}
      {activeTab === 'extraction' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Document Field Extraction & Consistency Comparison</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Cross-references values entered on the application form against text extracted from supporting records.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-5">Target Field</th>
                    <th className="py-3 px-4">Application Form Value</th>
                    <th className="py-3 px-4">Extracted Document Value</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Match Status</th>
                    <th className="py-3 px-5">Rationale / Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestRun?.extracted_fields?.map((field) => (
                    <tr key={field.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-5 font-semibold text-slate-900 capitalize">
                        {field.field_name.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {field.expected_value || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {field.extracted_value || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {(field.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-4">
                        {field.status === 'MATCHED' && <Badge variant="success">Matched</Badge>}
                        {field.status === 'MISMATCH' && <Badge variant="danger">Mismatch</Badge>}
                        {field.status === 'MISSING' && <Badge variant="warning">Missing</Badge>}
                        {field.status === 'UNVERIFIED' && <Badge variant="neutral">Unverified</Badge>}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-[11px] leading-relaxed max-w-sm">
                        {field.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: TAMPER & AUTHENTICITY */}
      {activeTab === 'tamper' && (
        <Card>
          <CardHeader>
            <CardTitle>Document Authenticity & Tampering Indicators</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Evaluates hash integrity, date logic, signature dictionaries, metadata anomalies, and duplicate submissions.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestRun?.findings?.map((f) => (
              <div
                key={f.id}
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  f.severity === 'HIGH' || f.severity === 'CRITICAL'
                    ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                    : f.severity === 'MEDIUM'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                      {f.category.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{f.title}</h4>
                  </div>
                  <Badge
                    variant={
                      f.severity === 'HIGH' || f.severity === 'CRITICAL'
                        ? 'danger'
                        : f.severity === 'MEDIUM'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {f.status.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-slate-700 mt-1">{f.description}</p>
                {f.evidence && (
                  <p className="text-[11px] font-mono text-slate-500 mt-2 bg-white/70 p-2 rounded border border-slate-200">
                    <strong>Evidence:</strong> {f.evidence}
                  </p>
                )}
                {f.reviewer_action && (
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    <strong>Recommended Reviewer Action:</strong> {f.reviewer_action}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: COMPLIANCE RULES */}
      {activeTab === 'compliance' && (
        <Card>
          <CardHeader>
            <CardTitle>Deterministic Regulatory Compliance Rules Evaluation</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Outcome of active compliance rules evaluated against this application. All demonstration rules are labeled.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestRun?.compliance_evaluations?.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                      {ev.rule_code || 'CR-RULE'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{ev.rule_name || 'Compliance Parameter'}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">v{ev.rule_version}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{ev.message}</p>
                </div>

                <div className="shrink-0">
                  {ev.outcome === 'PASSED' && <Badge variant="success">Passed</Badge>}
                  {ev.outcome === 'FAILED' && <Badge variant="danger">Failed</Badge>}
                  {ev.outcome === 'WARNING' && <Badge variant="warning">Warning</Badge>}
                  {ev.outcome === 'NOT_APPLICABLE' && <Badge variant="neutral">Not Applicable</Badge>}
                  {ev.outcome === 'UNABLE_TO_EVALUATE' && <Badge variant="neutral">Unable to Evaluate</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: AUDIT TIMELINE */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Application Lifecycle & Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {application.status_history?.map((sh) => (
                <div key={sh.id} className="relative text-xs">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="font-bold text-slate-900 text-sm">
                    Status changed to <span className="text-indigo-600">{sh.new_status}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{sh.reason}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(sh.created_at).toLocaleString()} • Logged by: {sh.changed_by_name || 'System'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
