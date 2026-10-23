from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.user import UserRole
from app.models.application import ApplicationStatus
from app.models.document import DocumentProcessingStatus
from app.models.verification import FieldMatchStatus, FindingSeverity, FindingCategory, FindingStatus
from app.models.compliance import RuleSeverity, EvaluationOutcome
from app.models.review import ReviewDecisionType

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)
    organization: Optional[str] = None
    role: Optional[UserRole] = UserRole.APPLICANT

class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=8)

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    organization: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Application Schemas ---
class ApplicationCategoryOut(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    required_documents: List[Dict[str, Any]]
    form_schema: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    category_id: str
    title: str
    form_data: Dict[str, Any] = {}
    is_draft: bool = False

class ApplicationUpdate(BaseModel):
    title: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None

class StatusHistoryOut(BaseModel):
    id: str
    previous_status: Optional[str]
    new_status: str
    changed_by_name: Optional[str] = None
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Document Schemas ---
class DocumentMetadataOut(BaseModel):
    id: str
    page_count: int
    author: Optional[str]
    creator: Optional[str]
    producer: Optional[str]
    creation_date: Optional[str]
    mod_date: Optional[str]
    has_digital_signature: bool
    raw_metadata: Dict[str, Any]
    detected_anomalies: List[str]

    class Config:
        from_attributes = True

class DocumentOut(BaseModel):
    id: str
    application_id: str
    document_type: str
    original_filename: str
    file_size: int
    mime_type: str
    sha256_hash: str
    status: str
    extracted_text: Optional[str] = None
    error_message: Optional[str] = None
    metadata_record: Optional[DocumentMetadataOut] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Verification & Finding Schemas ---
class ExtractedFieldOut(BaseModel):
    id: str
    document_id: Optional[str]
    field_name: str
    extracted_value: Optional[str]
    expected_value: Optional[str]
    confidence: float
    source_page: int
    status: str
    explanation: Optional[str]

    class Config:
        from_attributes = True

class VerificationFindingOut(BaseModel):
    id: str
    document_id: Optional[str]
    category: str
    status: str
    severity: str
    title: str
    description: str
    evidence: Optional[str]
    reviewer_action: Optional[str]

    class Config:
        from_attributes = True

# --- Compliance Schemas ---
class ComplianceEvaluationOut(BaseModel):
    id: str
    rule_id: str
    rule_code: Optional[str] = None
    rule_name: Optional[str] = None
    rule_version: str
    outcome: str
    score: float
    message: str
    evidence_details: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ComplianceRuleCreate(BaseModel):
    rule_code: str
    name: str
    description: str
    jurisdiction: str = "UNIVERSAL"
    application_category: str = "ALL"
    document_type: str = "ALL"
    rule_source: str
    version: str = "1.0.0"
    severity: RuleSeverity = RuleSeverity.ERROR
    validation_logic: Dict[str, Any]
    required_evidence: Optional[str] = None
    is_enabled: bool = True
    is_demo_rule: bool = True
    last_reviewed_by: str = "Compliance Officer"

class ComplianceRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[RuleSeverity] = None
    validation_logic: Optional[Dict[str, Any]] = None
    required_evidence: Optional[str] = None
    is_enabled: Optional[bool] = None

class ComplianceRuleOut(BaseModel):
    id: str
    rule_code: str
    name: str
    description: str
    jurisdiction: str
    application_category: str
    document_type: str
    rule_source: str
    version: str
    effective_date: datetime
    review_date: Optional[datetime]
    severity: str
    validation_logic: Dict[str, Any]
    required_evidence: Optional[str]
    is_enabled: bool
    is_demo_rule: bool
    last_reviewed_by: str
    last_reviewed_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# --- Reviewer Schemas ---
class ReviewDecisionCreate(BaseModel):
    decision: ReviewDecisionType
    reason: str
    explanation: str

class ReviewDecisionOut(BaseModel):
    id: str
    reviewer_name: Optional[str] = None
    decision: str
    reason: str
    explanation: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewerNoteCreate(BaseModel):
    note_text: str
    is_internal: bool = True

class ReviewerNoteOut(BaseModel):
    id: str
    author_name: Optional[str] = None
    note_text: str
    is_internal: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Verification Run Out ---
class VerificationRunOut(BaseModel):
    id: str
    application_id: str
    status: str
    ai_provider: str
    risk_level: str
    risk_score: float
    summary: Optional[str]
    is_demo_simulated: bool
    created_at: datetime
    extracted_fields: List[ExtractedFieldOut] = []
    findings: List[VerificationFindingOut] = []
    compliance_evaluations: List[ComplianceEvaluationOut] = []

    class Config:
        from_attributes = True

# --- Application Full Out ---
class ApplicationDetailOut(BaseModel):
    id: str
    reference_no: str
    applicant_id: str
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    status: str
    title: str
    form_data: Dict[str, Any]
    current_risk_score: str
    assigned_reviewer_id: Optional[str] = None
    assigned_reviewer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    documents: List[DocumentOut] = []
    verification_runs: List[VerificationRunOut] = []
    status_history: List[StatusHistoryOut] = []
    reviewer_notes: List[ReviewerNoteOut] = []
    review_decisions: List[ReviewDecisionOut] = []

    class Config:
        from_attributes = True

class ApplicationListItemOut(BaseModel):
    id: str
    reference_no: str
    applicant_name: Optional[str] = None
    category_name: Optional[str] = None
    title: str
    status: str
    current_risk_score: str
    document_count: int = 0
    assigned_reviewer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit & Metrics Schemas ---
class AuditEventOut(BaseModel):
    id: str
    user_email: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str]
    ip_address: Optional[str]
    details: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class AdminMetricsOut(BaseModel):
    total_applications: int
    applications_this_month: int
    applications_awaiting_review: int
    documents_processed: int
    applications_needing_info: int
    average_processing_time_minutes: float
    outcome_distribution: Dict[str, int]
    risk_distribution: Dict[str, int]
    volume_over_time: List[Dict[str, Any]]
    issue_categories: List[Dict[str, Any]]
    reviewer_workload: List[Dict[str, Any]]
    ai_status: Dict[str, Any]

# --- Report & Contact ---
class GeneratedReportOut(BaseModel):
    id: str
    report_code: str
    application_id: str
    report_title: str
    pdf_filename: str
    disclaimer: str
    created_at: datetime

    class Config:
        from_attributes = True

class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    subject: str = Field(..., min_length=3)
    organization: Optional[str] = None
    message: str = Field(..., min_length=10)

class ContactMessageOut(BaseModel):
    id: str
    name: str
    email: str
    subject: str
    organization: Optional[str]
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
