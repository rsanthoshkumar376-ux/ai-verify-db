export type UserRole = 'APPLICANT' | 'REVIEWER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  organization?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'NEEDS_INFORMATION'
  | 'UNDER_HUMAN_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DocumentRequirement {
  type: string;
  name: string;
  required: boolean;
}

export interface FormFieldSpec {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

export interface ApplicationCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  required_documents: DocumentRequirement[];
  form_schema: {
    fields: FormFieldSpec[];
  };
  created_at: string;
}

export interface DocumentMetadata {
  id: string;
  page_count: number;
  author?: string;
  creator?: string;
  producer?: string;
  creation_date?: string;
  mod_date?: string;
  has_digital_signature: boolean;
  raw_metadata: Record<string, any>;
  detected_anomalies: string[];
}

export interface DocumentItem {
  id: string;
  application_id: string;
  document_type: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  extracted_text?: string;
  error_message?: string;
  metadata_record?: DocumentMetadata;
  created_at: string;
}

export interface ExtractedField {
  id: string;
  document_id?: string;
  field_name: string;
  extracted_value?: string;
  expected_value?: string;
  confidence: number;
  source_page: number;
  status: 'MATCHED' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED';
  explanation?: string;
}

export interface VerificationFinding {
  id: string;
  document_id?: string;
  category: 'FILE_INTEGRITY' | 'DATA_CONSISTENCY' | 'DIGITAL_SIGNATURE' | 'ISSUER_AUTHENTICITY' | 'SUSPECTED_MANIPULATION';
  status: 'NO_ISSUE' | 'POTENTIAL_INCONSISTENCY' | 'FURTHER_VERIFICATION_REQUIRED' | 'UNABLE_TO_VERIFY';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  evidence?: string;
  reviewer_action?: string;
}

export interface ComplianceEvaluation {
  id: string;
  rule_id: string;
  rule_code?: string;
  rule_name?: string;
  rule_version: string;
  outcome: 'PASSED' | 'FAILED' | 'WARNING' | 'NOT_APPLICABLE' | 'UNABLE_TO_EVALUATE';
  score: number;
  message: string;
  evidence_details: Record<string, any>;
  created_at: string;
}

export interface VerificationRun {
  id: string;
  application_id: string;
  status: string;
  ai_provider: string;
  risk_level: RiskLevel;
  risk_score: number;
  summary?: string;
  is_demo_simulated: boolean;
  created_at: string;
  extracted_fields: ExtractedField[];
  findings: VerificationFinding[];
  compliance_evaluations: ComplianceEvaluation[];
}

export interface StatusHistory {
  id: string;
  previous_status?: string;
  new_status: string;
  changed_by_name?: string;
  reason?: string;
  created_at: string;
}

export interface ReviewerNote {
  id: string;
  author_name?: string;
  note_text: string;
  is_internal: boolean;
  created_at: string;
}

export interface ReviewDecision {
  id: string;
  reviewer_name?: string;
  decision: 'VERIFIED' | 'REJECTED' | 'NEEDS_INFORMATION' | 'ESCALATED';
  reason: string;
  explanation: string;
  created_at: string;
}

export interface ApplicationDetail {
  id: string;
  reference_no: string;
  applicant_id: string;
  applicant_name?: string;
  applicant_email?: string;
  category_id: string;
  category_name?: string;
  status: ApplicationStatus;
  title: string;
  form_data: Record<string, any>;
  current_risk_score: RiskLevel;
  assigned_reviewer_id?: string;
  assigned_reviewer_name?: string;
  created_at: string;
  updated_at: string;
  documents: DocumentItem[];
  verification_runs: VerificationRun[];
  status_history: StatusHistory[];
  reviewer_notes: ReviewerNote[];
  review_decisions: ReviewDecision[];
}

export interface ApplicationListItem {
  id: string;
  reference_no: string;
  applicant_name?: string;
  category_name?: string;
  title: string;
  status: ApplicationStatus;
  current_risk_score: RiskLevel;
  document_count: number;
  assigned_reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRule {
  id: string;
  rule_code: string;
  name: string;
  description: string;
  jurisdiction: string;
  application_category: string;
  document_type: string;
  rule_source: string;
  version: string;
  effective_date: string;
  review_date?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  validation_logic: Record<string, any>;
  required_evidence?: string;
  is_enabled: boolean;
  is_demo_rule: boolean;
  last_reviewed_by: string;
  last_reviewed_date: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface AuditEventItem {
  id: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  details: Record<string, any>;
  created_at: string;
}

export interface AdminMetrics {
  total_applications: number;
  applications_this_month: number;
  applications_awaiting_review: number;
  documents_processed: number;
  applications_needing_info: number;
  average_processing_time_minutes: number;
  outcome_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  volume_over_time: { date: string; applications: number }[];
  issue_categories: { category: string; count: number }[];
  reviewer_workload: { name: string; assigned: number }[];
  ai_status: {
    provider: string;
    configured: boolean;
    demo_mode: boolean;
    status: string;
  };
}
