import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, ToggleLeft, ToggleRight, Search, CheckCircle2, Info, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { ComplianceRule } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const RuleManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Rule Form State
  const [newRule, setNewRule] = useState({
    rule_code: '',
    name: '',
    description: '',
    jurisdiction: 'UNIVERSAL',
    application_category: 'ALL',
    document_type: 'ALL',
    rule_source: 'Demonstration Regulatory Protocol 2026',
    version: '1.0.0',
    severity: 'ERROR',
    validation_type: 'document_not_expired',
    numeric_field: '',
    numeric_operator: '<=',
    numeric_threshold: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = await api.listRules();
      setRules(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleRule = async (rule: ComplianceRule) => {
    try {
      await api.toggleRule(rule.id);
      success(`Rule ${rule.rule_code} ${rule.is_enabled ? 'disabled' : 'enabled'}.`);
      await fetchRules();
    } catch (err: any) {
      error(err.message || 'Failed to toggle rule.');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.rule_code || !newRule.name || !newRule.description) {
      error('Please complete all required rule fields.');
      return;
    }

    let validationLogic: Record<string, any> = { type: newRule.validation_type };
    if (newRule.validation_type === 'numeric_threshold') {
      validationLogic = {
        type: 'numeric_threshold',
        field_key: newRule.numeric_field,
        operator: newRule.numeric_operator,
        threshold: Number(newRule.numeric_threshold),
      };
    }

    setIsSubmitting(true);
    try {
      await api.createRule({
        rule_code: newRule.rule_code.trim(),
        name: newRule.name.trim(),
        description: newRule.description.trim(),
        jurisdiction: newRule.jurisdiction,
        application_category: newRule.application_category,
        document_type: newRule.document_type,
        rule_source: newRule.rule_source,
        version: newRule.version,
        severity: newRule.severity as any,
        validation_logic: validationLogic,
        is_enabled: true,
        is_demo_rule: true,
      });
      success(`Rule ${newRule.rule_code} authored and committed.`);
      setCreateModalOpen(false);
      await fetchRules();
    } catch (err: any) {
      error(err.message || 'Failed to create rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRules = rules.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      return r.rule_code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.jurisdiction.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Policy Architecture
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Regulatory Compliance Rules Engine</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure, version, and activate deterministic regulatory validation checks across application categories.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Add Compliance Rule
        </Button>
      </div>

      <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Demonstration Policy Notice:</span> Sample compliance rules are labeled "Demonstration Rule — Not Legal Advice". Rule formulations must be reviewed and certified by qualified sector compliance counsel prior to legal reliance.
        </div>
      </div>

      {/* 1-Click Rule Packs */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-5 rounded-2xl border border-indigo-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Pre-Built Regulatory Rule Packs
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-1">KYC / AML Identity Standard</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Mandates unexpired government credential and legal name reconciliation.
              </p>
            </div>
            <button
              onClick={() => {
                setNewRule({
                  rule_code: `KYC-ID-${Date.now().toString().slice(-4)}`,
                  name: 'Mandatory Government ID Validity',
                  description: 'Ensures passport or driver license has at least 6 months validity remaining.',
                  jurisdiction: 'GLOBAL',
                  application_category: 'ALL',
                  document_type: 'PASSPORT',
                  rule_source: 'FinCEN / FATF Guidance',
                  version: '2.0.0',
                  severity: 'ERROR',
                  validation_type: 'document_not_expired',
                  numeric_field: '',
                  numeric_operator: '<=',
                  numeric_threshold: 0,
                });
                setCreateModalOpen(true);
              }}
              className="mt-3 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px] text-left cursor-pointer"
            >
              + Use Template
            </button>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-1">SOC 2 / ISO 27001 Security</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Requires accredited third-party cybersecurity surveillance audit report.
              </p>
            </div>
            <button
              onClick={() => {
                setNewRule({
                  rule_code: `SEC-SOC-${Date.now().toString().slice(-4)}`,
                  name: 'SOC 2 Type II Surveillance Audit',
                  description: 'Validates that the vendor audit report was completed within the past 12 months.',
                  jurisdiction: 'US/EU',
                  application_category: 'VENDOR_COMPLIANCE',
                  document_type: 'COMPLIANCE_CERTIFICATE',
                  rule_source: 'AICPA Trust Services Criteria',
                  version: '1.2.0',
                  severity: 'ERROR',
                  validation_type: 'document_not_expired',
                  numeric_field: '',
                  numeric_operator: '<=',
                  numeric_threshold: 0,
                });
                setCreateModalOpen(true);
              }}
              className="mt-3 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px] text-left cursor-pointer"
            >
              + Use Template
            </button>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Financial Solvency Threshold</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Automated check verifying annual gross revenue meets grant/loan minimums.
              </p>
            </div>
            <button
              onClick={() => {
                setNewRule({
                  rule_code: `FIN-REV-${Date.now().toString().slice(-4)}`,
                  name: 'Minimum Gross Operating Revenue',
                  description: 'Ensures reported gross income meets minimum qualification floor.',
                  jurisdiction: 'FEDERAL',
                  application_category: 'FINANCIAL_AID',
                  document_type: 'TAX_RETURN',
                  rule_source: 'Uniform Grant Guidance 2 CFR 200',
                  version: '1.0.0',
                  severity: 'WARNING',
                  validation_type: 'numeric_threshold',
                  numeric_field: 'annual_income',
                  numeric_operator: '>=',
                  numeric_threshold: 50000,
                });
                setCreateModalOpen(true);
              }}
              className="mt-3 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px] text-left cursor-pointer"
            >
              + Use Template
            </button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Configured Compliance Rules ({filteredRules.length})</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Deterministic checks evaluated against applications</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, title, or jurisdiction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-56 sm:w-64"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-5">Rule Code</th>
                    <th className="py-3 px-4">Rule Name & Description</th>
                    <th className="py-3 px-4">Jurisdiction & Scope</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                        {rule.rule_code}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-slate-900 dark:text-white">{rule.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{rule.description}</div>
                        {rule.is_demo_rule && (
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800 mt-1 inline-block">
                            Demo Rule — Not Legal Advice
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{rule.jurisdiction}</span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Category: {rule.application_category}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            rule.severity === 'CRITICAL' || rule.severity === 'ERROR'
                              ? 'danger'
                              : rule.severity === 'WARNING'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {rule.severity}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">v{rule.version}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={rule.is_enabled ? 'success' : 'neutral'}>
                          {rule.is_enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRule(rule)}
                          leftIcon={rule.is_enabled ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                        >
                          {rule.is_enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Author New Rule Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Author Configurable Compliance Rule"
        description="Add a deterministic rule to the platform compliance evaluation matrix."
      >
        <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rule Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CR-TAX-01"
                value={newRule.rule_code}
                onChange={(e) => setNewRule({ ...newRule, rule_code: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity Tier</label>
              <select
                value={newRule.severity}
                onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="ERROR">ERROR</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rule Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Prior Fiscal Year Tax Return Verification"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description & Requirement Standard <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="Explains what this rule verifies and how compliance is evaluated..."
              value={newRule.description}
              onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jurisdiction</label>
              <input
                type="text"
                placeholder="UNIVERSAL, US-FED, STATE-CA"
                value={newRule.jurisdiction}
                onChange={(e) => setNewRule({ ...newRule, jurisdiction: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Category</label>
              <select
                value={newRule.application_category}
                onChange={(e) => setNewRule({ ...newRule, application_category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">ALL Categories</option>
                <option value="SCH-2026">SCH-2026 (Scholarship)</option>
                <option value="BIZ-2026">BIZ-2026 (Business License)</option>
                <option value="SUB-2026">SUB-2026 (Clean Energy Subsidy)</option>
                <option value="GEN-2026">GEN-2026 (Institutional)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Validation Logic Type</label>
            <select
              value={newRule.validation_type}
              onChange={(e) => setNewRule({ ...newRule, validation_type: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="document_not_expired">Document Validity & Expiration Recency Check</option>
              <option value="name_consistency">Primary Applicant Name Consistency Check</option>
              <option value="numeric_threshold">Configurable Numeric Threshold (Limit/Ceiling/Floor)</option>
              <option value="required_document">Mandatory Supporting Document Requirement</option>
            </select>
          </div>

          {newRule.validation_type === 'numeric_threshold' && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Field Key</label>
                <input
                  type="text"
                  placeholder="annual_income"
                  value={newRule.numeric_field}
                  onChange={(e) => setNewRule({ ...newRule, numeric_field: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Operator</label>
                <select
                  value={newRule.numeric_operator}
                  onChange={(e) => setNewRule({ ...newRule, numeric_operator: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                >
                  <option value="<=">&lt;= (Max limit)</option>
                  <option value=">=">&gt;= (Min threshold)</option>
                  <option value="<">&lt;</option>
                  <option value=">">&gt;</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Threshold</label>
                <input
                  type="number"
                  placeholder="85000"
                  value={newRule.numeric_threshold}
                  onChange={(e) => setNewRule({ ...newRule, numeric_threshold: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-300"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Author Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
