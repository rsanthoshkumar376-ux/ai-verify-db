import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  RotateCw,
  Send,
  MessageSquare,
  Lock,
  UserCheck,
  Scale,
  FileDown
} from 'lucide-react';
import { api } from '../../services/api';
import { ApplicationDetail } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, RiskBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const ReviewerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'VERIFIED' | 'REJECTED' | 'NEEDS_INFORMATION' | 'ESCALATED'>('VERIFIED');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionExplanation, setDecisionExplanation] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Note Modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(true);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

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
      success('Verification re-run complete.');
      await fetchApplication();
    } catch (err: any) {
      error(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!id || !user) return;
    try {
      await api.assignReviewer(id, user.id);
      success('Application assigned to your review queue.');
      await fetchApplication();
    } catch (err: any) {
      error(err.message || 'Failed to assign reviewer.');
    }
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionReason.trim() || !decisionExplanation.trim()) {
      warning('Reason and detailed explanation are mandatory for consequential review decisions.');
      return;
    }

    setIsSubmittingDecision(true);
    try {
      await api.recordDecision(id!, {
        decision: decisionType,
        reason: decisionReason.trim(),
        explanation: decisionExplanation.trim(),
      });
      success(`Decision '${decisionType}' recorded and logged.`);
      setDecisionModalOpen(false);
      await fetchApplication();
    } catch (err: any) {
      error(err.message || 'Failed to record decision.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      await api.addNote(id!, {
        note_text: noteText.trim(),
        is_internal: isInternalNote,
      });
      success('Reviewer note appended to dossier.');
      setNoteModalOpen(false);
      setNoteText('');
      await fetchApplication();
    } catch (err: any) {
      error(err.message || 'Failed to add note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  if (!application) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Application Record Not Found</h2>
      </div>
    );
  }

  const latestRun = application.verification_runs?.[0];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reviewer')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            aria-label="Back to queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-lg font-bold text-slate-900">{application.reference_no}</span>
              <StatusBadge status={application.status} />
              <RiskBadge risk={application.current_risk_score} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Applicant: <span className="font-semibold text-slate-800">{application.applicant_name}</span> ({application.applicant_email}) • {application.category_name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {application.assigned_reviewer_id !== user?.id && (
            <Button variant="outline" size="sm" onClick={handleAssignToMe} leftIcon={<UserCheck className="w-4 h-4" />}>
              Assign to Me
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setNoteModalOpen(true)}
            leftIcon={<MessageSquare className="w-4 h-4" />}
          >
            Add Note
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunVerification}
            isLoading={isVerifying}
            leftIcon={<RotateCw className="w-4 h-4" />}
          >
            Re-run Verification
          </Button>

          {latestRun && (
            <a href={api.getReportDownloadUrl(application.id)} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" leftIcon={<FileDown className="w-4 h-4" />}>
                PDF Report
              </Button>
            </a>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setDecisionModalOpen(true)}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Record Determination
          </Button>
        </div>
      </div>

      {/* Main Review Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Extracted Fields & Supporting Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Field Comparison Table */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Extracted Fields vs Form Declarations</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithmic cross-verification of document extractions against submitted form entries
                </p>
              </div>
              <Badge variant="info">{latestRun?.ai_provider || 'Engine'}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                      <th className="py-3 px-5">Target Field</th>
                      <th className="py-3 px-4">Form Declaration</th>
                      <th className="py-3 px-4">Extracted Document</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">Match Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {latestRun?.extracted_fields?.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-5 font-semibold text-slate-900 capitalize">
                          {f.field_name.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {f.expected_value || '—'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {f.extracted_value || '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {(f.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4">
                          {f.status === 'MATCHED' && <Badge variant="success">Matched</Badge>}
                          {f.status === 'MISMATCH' && <Badge variant="danger">Mismatch</Badge>}
                          {f.status === 'MISSING' && <Badge variant="warning">Missing</Badge>}
                          {f.status === 'UNVERIFIED' && <Badge variant="neutral">Unverified</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tamper and Anomaly Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Document Authenticity & Tamper Flags</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation of cryptographic hashes, metadata timestamps, digital signatures, and duplicate submissions
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestRun?.findings?.map((finding) => (
                <div
                  key={finding.id}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    finding.severity === 'HIGH' || finding.severity === 'CRITICAL'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : finding.severity === 'MEDIUM'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                      {finding.category.replace('_', ' ')}
                    </span>
                    <Badge
                      variant={
                        finding.severity === 'HIGH' ? 'danger' : finding.severity === 'MEDIUM' ? 'warning' : 'default'
                      }
                    >
                      {finding.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{finding.title}</h4>
                  <p className="text-slate-700 mt-1">{finding.description}</p>
                  {finding.evidence && (
                    <p className="text-[11px] font-mono text-slate-600 mt-2 bg-white/80 p-2 rounded border border-slate-200">
                      <strong>Evidence:</strong> {finding.evidence}
                    </p>
                  )}
                  {finding.reviewer_action && (
                    <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                      <strong>Recommended Action:</strong> {finding.reviewer_action}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance Rules Output */}
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance Rules Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestRun?.compliance_evaluations?.map((ce) => (
                <div key={ce.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                        {ce.rule_code}
                      </span>
                      <span className="font-bold text-slate-900">{ce.rule_name}</span>
                    </div>
                    <p className="text-slate-500">{ce.message}</p>
                  </div>
                  <div className="shrink-0">
                    {ce.outcome === 'PASSED' && <Badge variant="success">Passed</Badge>}
                    {ce.outcome === 'FAILED' && <Badge variant="danger">Failed</Badge>}
                    {ce.outcome === 'WARNING' && <Badge variant="warning">Warning</Badge>}
                    {ce.outcome === 'NOT_APPLICABLE' && <Badge variant="neutral">N/A</Badge>}
                    {ce.outcome === 'UNABLE_TO_EVALUATE' && <Badge variant="neutral">Unable</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Rail: Document Files & Reviewer History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded File Artifacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold text-slate-900 truncate">{doc.original_filename}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Type: {doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <a href={api.getDocumentDownloadUrl(doc.id)} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Inspect Original
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Historical Decisions */}
          <Card>
            <CardHeader>
              <CardTitle>Determination History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {application.review_decisions?.length === 0 ? (
                <p className="text-slate-400">No review determinations recorded yet.</p>
              ) : (
                application.review_decisions.map((d) => (
                  <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{d.decision}</span>
                      <span className="text-[10px] text-slate-400">{new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="font-medium text-slate-700">{d.reason}</p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{d.explanation}</p>
                    <p className="text-[10px] text-slate-400 pt-1">Reviewer: {d.reviewer_name}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Reviewer Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Dossier Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {application.reviewer_notes?.length === 0 ? (
                <p className="text-slate-400">No reviewer notes recorded.</p>
              ) : (
                application.reviewer_notes.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{n.author_name}</span>
                      <Badge variant={n.is_internal ? 'neutral' : 'info'}>
                        {n.is_internal ? 'Internal Only' : 'Applicant Visible'}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{n.note_text}</p>
                    <span className="text-[10px] text-slate-400 block">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Decision Modal */}
      <Modal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title="Record Compliance Review Determination"
        description="Consequential decisions require explicit written justifications logged to the immutable audit trail."
      >
        <form onSubmit={handleRecordDecision} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Determination Outcome</label>
            <select
              value={decisionType}
              onChange={(e: any) => setDecisionType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="VERIFIED">VERIFIED — Documentation authentic and compliant</option>
              <option value="NEEDS_INFORMATION">NEEDS INFORMATION — Request missing/renewed records</option>
              <option value="ESCALATED">ESCALATED — Forward for secondary fraud or legal review</option>
              <option value="REJECTED">REJECTED — Material non-conformance identified</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Summary Reason Code / Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Identity verified; GPA threshold and enrollment confirmed."
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detailed Written Explanation & Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide complete written justification referencing inspected documents and regulatory checks..."
              value={decisionExplanation}
              onChange={(e) => setDecisionExplanation(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDecisionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingDecision}>
              Commit Determination
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Add Reviewer Note"
        description="Append observations or document requests to the dossier."
      >
        <form onSubmit={handleAddNote} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Note Text</label>
            <textarea
              rows={4}
              required
              placeholder="Enter note or requested document instructions..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_internal"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="is_internal" className="text-slate-700 font-medium">
              Internal reviewer note only (hidden from applicant)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingNote}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
