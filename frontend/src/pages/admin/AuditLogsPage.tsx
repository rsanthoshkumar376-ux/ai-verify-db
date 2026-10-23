import React, { useState, useEffect } from 'react';
import { History, Search, Shield, Eye, Calendar, Download } from 'lucide-react';
import { api } from '../../services/api';
import { AuditEventItem } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditEventItem | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs({ action: actionFilter || undefined });
      setLogs(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleExportAuditCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Event ID', 'Action', 'Resource Type', 'Resource ID', 'User Email', 'IP Address', 'Timestamp'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.action}"`,
      `"${l.resource_type || ''}"`,
      `"${l.resource_id || ''}"`,
      `"${l.user_email || ''}"`,
      `"${l.ip_address || ''}"`,
      `"${new Date(l.created_at).toISOString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_verify_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Provenance & Security
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Platform Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of logins, document submissions, automated verification runs, and reviewer determinations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAuditCSV}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Log (CSV)
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>System Events ({logs.length})</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of actions for compliance transparency</p>
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="APPLICATION_SUBMITTED">Applications Submitted</option>
            <option value="DOCUMENT_UPLOADED">Documents Uploaded</option>
            <option value="REVIEW_DECISION_RECORDED">Reviewer Determinations</option>
            <option value="COMPLIANCE_RULE_CREATED">Rules Authored</option>
          </select>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-5">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-slate-600 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.action}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="font-semibold">{item.resource_type}</span>
                        {item.resource_id && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.resource_id.substring(0, 16)}...
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.user_email || 'System'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedLog(item)}
                          className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                        >
                          View Payload
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON Payload Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Payload Details"
        description={`Action: ${selectedLog?.action} at ${selectedLog?.created_at}`}
      >
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96">
          <pre>{JSON.stringify(selectedLog?.details || {}, null, 2)}</pre>
        </div>
      </Modal>
    </div>
  );
};
