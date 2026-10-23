import os
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.application import (
    Application,
    ApplicationCategory,
    ApplicationStatus,
    ApplicationStatusHistory,
)
from app.models.document import Document, DocumentMetadata, DocumentProcessingStatus
from app.models.verification import (
    VerificationRun,
    ExtractedField,
    VerificationFinding,
    FieldMatchStatus,
    FindingCategory,
    FindingSeverity,
    FindingStatus,
)
from app.models.compliance import (
    ComplianceRule,
    ComplianceEvaluation,
    RuleSeverity,
    EvaluationOutcome,
)
from app.models.review import ReviewDecision, ReviewDecisionType, ReviewerNote
from app.models.notification import Notification, NotificationType
from app.services.storage import calculate_sha256

def create_synthetic_pdf(filepath: str, title: str, body_text: str):
    """Generates a clean synthetic PDF file on disk for demonstration testing."""
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        story = [
            Paragraph(f"<b>{title}</b>", styles["Title"]),
            Spacer(1, 14),
            Paragraph(body_text.replace("\n", "<br/>"), styles["Normal"])
        ]
        doc.build(story)
    except Exception as exc:
        print(f"Notice: Synthetic PDF disk write skipped: {exc}")

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).count() > 0:
        return

    print("Initializing AI Verify database with comprehensive synthetic seed data...")

    # 1. USERS
    admin_user = User(
        email="admin@aiverify.org",
        hashed_password=get_password_hash("Admin123!"),
        full_name="Elena Rostova",
        organization="AI Verify Trust & Compliance Office",
        role=UserRole.ADMIN.value,
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    reviewer_user = User(
        email="reviewer@aiverify.org",
        hashed_password=get_password_hash("Reviewer123!"),
        full_name="Marcus Vance",
        organization="Global Regulatory Review Group",
        role=UserRole.REVIEWER.value,
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    applicant_user = User(
        email="applicant@aiverify.org",
        hashed_password=get_password_hash("Applicant123!"),
        full_name="Sarah Jenkins",
        organization="Apex Research Scholars",
        role=UserRole.APPLICANT.value,
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add_all([admin_user, reviewer_user, applicant_user])
    db.commit()

    # 2. CATEGORIES
    cat_scholarship = ApplicationCategory(
        code="SCH-2026",
        name="Higher Education Academic Scholarship",
        description="Merit and need-based institutional scholarships requiring enrollment proof, transcripts, and declared financial statements.",
        required_documents=[
            {"type": "ID_PROOF", "name": "Government Photo Identification", "required": True},
            {"type": "TRANSCRIPT", "name": "Official Academic Transcript", "required": True},
            {"type": "INCOME_VERIFICATION", "name": "Tax Assessment or Household Income Statement", "required": True}
        ],
        form_schema={
            "fields": [
                {"key": "applicant_name", "label": "Full Legal Name", "type": "text", "required": True},
                {"key": "institution_name", "label": "University / Institution", "type": "text", "required": True},
                {"key": "declared_gpa", "label": "Cumulative GPA", "type": "number", "required": True},
                {"key": "annual_income", "label": "Household Annual Income ($)", "type": "number", "required": True},
                {"key": "program_of_study", "label": "Program / Major", "type": "text", "required": True}
            ]
        }
    )

    cat_business = ApplicationCategory(
        code="BIZ-2026",
        name="Municipal Commercial Operating License",
        description="Commercial retail, hospitality, or corporate business operational permit verification.",
        required_documents=[
            {"type": "BUSINESS_REGISTRATION", "name": "Certificate of Incorporation", "required": True},
            {"type": "PROOF_OF_ADDRESS", "name": "Commercial Lease or Municipal Utility Bill", "required": True},
            {"type": "ID_PROOF", "name": "Designated Officer Photo Identification", "required": True}
        ],
        form_schema={
            "fields": [
                {"key": "applicant_name", "label": "Authorized Officer Name", "type": "text", "required": True},
                {"key": "business_name", "label": "Registered Business Entity Name", "type": "text", "required": True},
                {"key": "registration_number", "label": "Corporate Registration Number", "type": "text", "required": True},
                {"key": "business_address", "label": "Physical Operating Address", "type": "text", "required": True},
                {"key": "employee_count", "label": "Estimated Employee Count", "type": "number", "required": False}
            ]
        }
    )

    cat_subsidy = ApplicationCategory(
        code="SUB-2026",
        name="Clean Energy Infrastructure Subsidy",
        description="Public sector grant for commercial solar, battery storage, or industrial decarbonization deployments.",
        required_documents=[
            {"type": "PROJECT_PROPOSAL", "name": "Technical Engineering Proposal", "required": True},
            {"type": "ID_PROOF", "name": "Managing Director Identification", "required": True},
            {"type": "FINANCIAL_AUDIT", "name": "Prior Year Financial Statement", "required": True}
        ],
        form_schema={
            "fields": [
                {"key": "applicant_name", "label": "Lead Developer Name", "type": "text", "required": True},
                {"key": "project_title", "label": "Project Designation", "type": "text", "required": True},
                {"key": "target_kw", "label": "Target Capacity (kW)", "type": "number", "required": True},
                {"key": "requested_subsidy", "label": "Requested Subsidy Amount ($)", "type": "number", "required": True}
            ]
        }
    )

    cat_general = ApplicationCategory(
        code="GEN-2026",
        name="Institutional Accreditation & Governance Review",
        description="General multi-document compliance review for certified nonprofit or public service institutions.",
        required_documents=[
            {"type": "GOVERNANCE_CHARTER", "name": "Institutional Bylaws or Charter", "required": True},
            {"type": "ID_PROOF", "name": "Trustee Identification", "required": True}
        ],
        form_schema={
            "fields": [
                {"key": "applicant_name", "label": "Designated Officer", "type": "text", "required": True},
                {"key": "organization_name", "label": "Organization Legal Name", "type": "text", "required": True},
                {"key": "jurisdiction", "label": "Regulatory Jurisdiction", "type": "text", "required": True}
            ]
        }
    )

    db.add_all([cat_scholarship, cat_business, cat_subsidy, cat_general])
    db.flush()

    # 3. DEMONSTRATION COMPLIANCE RULES
    demo_rules = [
        ComplianceRule(
            rule_code="CR-ID-01",
            name="Primary Identity Document Recency & Expiry Check",
            description="Verifies that supporting government identification has not expired and remains in active validity.",
            jurisdiction="UNIVERSAL",
            application_category="ALL",
            document_type="ID_PROOF",
            rule_source="Demonstration Framework Reference 2026.1 — Section 4.2",
            version="1.2.0",
            effective_date=datetime.now(timezone.utc) - timedelta(days=90),
            severity=RuleSeverity.CRITICAL.value,
            validation_logic={"type": "document_not_expired"},
            required_evidence="Machine-readable expiration date from government ID.",
            is_enabled=True,
            is_demo_rule=True,
            last_reviewed_by="Compliance Officer Vance",
            last_reviewed_date=datetime.now(timezone.utc)
        ),
        ComplianceRule(
            rule_code="CR-NAME-01",
            name="Primary Applicant Form-to-Document Name Alignment",
            description="Confirms that the legal applicant name entered on the form corresponds with supporting identity records.",
            jurisdiction="UNIVERSAL",
            application_category="ALL",
            document_type="ID_PROOF",
            rule_source="Demonstration Framework Reference 2026.1 — Section 2.1",
            version="1.0.0",
            effective_date=datetime.now(timezone.utc) - timedelta(days=90),
            severity=RuleSeverity.WARNING.value,
            validation_logic={"type": "name_consistency"},
            required_evidence="Exact or normalized token match across form and document.",
            is_enabled=True,
            is_demo_rule=True,
            last_reviewed_by="Compliance Officer Vance",
            last_reviewed_date=datetime.now(timezone.utc)
        ),
        ComplianceRule(
            rule_code="CR-SCH-01",
            name="Academic Excellence Minimum GPA Standard",
            description="Requires an applicant cumulative GPA greater than or equal to 3.0 for fellowship eligibility.",
            jurisdiction="ACADEMIC",
            application_category="SCH-2026",
            document_type="TRANSCRIPT",
            rule_source="Academic Scholarship Standards Board Guidelines 2026",
            version="2.0.0",
            effective_date=datetime.now(timezone.utc) - timedelta(days=60),
            severity=RuleSeverity.ERROR.value,
            validation_logic={"type": "numeric_threshold", "field_key": "declared_gpa", "operator": ">=", "threshold": 3.0},
            required_evidence="Certified academic transcript reflecting grade average.",
            is_enabled=True,
            is_demo_rule=True,
            last_reviewed_by="Dean Rostova",
            last_reviewed_date=datetime.now(timezone.utc)
        ),
        ComplianceRule(
            rule_code="CR-SCH-02",
            name="Need-Based Household Income Ceiling",
            description="Ensures declared annual household income does not exceed the $85,000 allowance ceiling.",
            jurisdiction="ACADEMIC",
            application_category="SCH-2026",
            document_type="INCOME_VERIFICATION",
            rule_source="Scholarship Financial Need Regulation Policy",
            version="1.1.0",
            effective_date=datetime.now(timezone.utc) - timedelta(days=60),
            severity=RuleSeverity.WARNING.value,
            validation_logic={"type": "numeric_threshold", "field_key": "annual_income", "operator": "<=", "threshold": 85000},
            required_evidence="W-2 or formal tax assessment summary.",
            is_enabled=True,
            is_demo_rule=True,
            last_reviewed_by="Dean Rostova",
            last_reviewed_date=datetime.now(timezone.utc)
        ),
        ComplianceRule(
            rule_code="CR-DOC-REQ",
            name="Mandatory Supporting Document Verification",
            description="Validates that mandatory identity proof is attached to the submission dossier.",
            jurisdiction="UNIVERSAL",
            application_category="ALL",
            document_type="ID_PROOF",
            rule_source="Universal Submission Protocol Rule 1.0",
            version="1.0.0",
            effective_date=datetime.now(timezone.utc) - timedelta(days=120),
            severity=RuleSeverity.ERROR.value,
            validation_logic={"type": "required_document", "document_type": "ID_PROOF"},
            required_evidence="Uploaded ID_PROOF artifact.",
            is_enabled=True,
            is_demo_rule=True,
            last_reviewed_by="Compliance Officer Vance",
            last_reviewed_date=datetime.now(timezone.utc)
        ),
        ComplianceRule(
            rule_code="CR-SUB-01",
            name="Clean Energy Subsidy Maximum Cap Check",
            description="Ensures single-site subsidy requests do not exceed the $250,000 regulatory allocation ceiling.",
            jurisdiction="ENERGY-GRID",
            application_category="SUB-2026",
            document_type="PROJECT_PROPOSAL",
            rule_source="Municipal Decarbonization Grant Policy 2026",
            version="1.0.0",
            effective_date=datetime.now(timezone.utc) - timedelta(days=30),
            severity=RuleSeverity.ERROR.value,
            validation_logic={"type": "numeric_threshold", "field_key": "requested_subsidy", "operator": "<=", "threshold": 250000},
            required_evidence="Itemized engineering cost quotation.",
            is_enabled=True,
            is_demo_rule=True,
            last_reviewed_by="Compliance Officer Vance",
            last_reviewed_date=datetime.now(timezone.utc)
        )
    ]
    db.add_all(demo_rules)
    db.flush()

    # 4. SAMPLE APPLICATIONS AND DOCUMENTS
    # Sample 1: VERIFIED Application (Sarah Jenkins - Scholarship)
    app1 = Application(
        reference_no="AIV-SCH-2026-81923",
        applicant_id=applicant_user.id,
        category_id=cat_scholarship.id,
        status=ApplicationStatus.VERIFIED.value,
        title="Postgraduate Fellowship in Advanced Machine Intelligence",
        form_data={
            "applicant_name": "Sarah Jenkins",
            "institution_name": "Massachusetts Institute of Technology",
            "declared_gpa": 3.85,
            "annual_income": 42000,
            "program_of_study": "Computational Neuroscience",
            "document_number": "P-9842103"
        },
        current_risk_score="LOW",
        assigned_reviewer_id=reviewer_user.id,
        created_at=datetime.now(timezone.utc) - timedelta(days=5),
        updated_at=datetime.now(timezone.utc) - timedelta(days=1)
    )
    db.add(app1)
    db.flush()

    # Physical files for App 1
    doc1_filename = "synth_doc_passport_app1.pdf"
    doc1_path = os.path.join(settings.STORAGE_DIR, doc1_filename)
    create_synthetic_pdf(
        doc1_path,
        "OFFICIAL CITIZENSHIP PASSPORT RECORD",
        "Holder Legal Name: Sarah Jenkins\nDocument Number: P-9842103\nNationality: United States\nDate of Birth: 1999-04-14\nIssue Date: 2022-06-10\nExpiry Date: 2032-06-10\nIssuing Authority: Department of State Passport Agency"
    )
    try:
        with open(doc1_path, "rb") as f:
            doc1_bytes = f.read()
    except Exception:
        doc1_bytes = b"%PDF-1.4 Official Passport Synthetic Demo File"

    doc1 = Document(
        application_id=app1.id,
        user_id=applicant_user.id,
        document_type="ID_PROOF",
        original_filename="US_Passport_Sarah_Jenkins.pdf",
        stored_filename=doc1_filename,
        file_path=doc1_path,
        file_size=len(doc1_bytes),
        mime_type="application/pdf",
        sha256_hash=calculate_sha256(doc1_bytes),
        status=DocumentProcessingStatus.COMPLETED.value,
        extracted_text="Holder Legal Name: Sarah Jenkins\nDocument Number: P-9842103\nIssue Date: 2022-06-10\nExpiry Date: 2032-06-10",
        created_at=datetime.now(timezone.utc) - timedelta(days=5)
    )
    db.add(doc1)
    db.flush()

    meta1 = DocumentMetadata(
        document_id=doc1.id,
        page_count=1,
        author="Department of State",
        producer="Government Secure PDF Generator 4.0",
        creation_date="2022-06-10",
        mod_date="2022-06-10",
        has_digital_signature=True,
        raw_metadata={},
        detected_anomalies=[]
    )
    db.add(meta1)

    # Verification run for App 1
    vrun1 = VerificationRun(
        application_id=app1.id,
        triggered_by_id=reviewer_user.id,
        status="COMPLETED",
        ai_provider="DEMO_DETERMINISTIC_ENGINE",
        risk_level="LOW",
        risk_score=0.10,
        summary="Automated verification completed with 100% field consistency. All compliance parameters satisfied.",
        is_demo_simulated=True,
        created_at=datetime.now(timezone.utc) - timedelta(days=4)
    )
    db.add(vrun1)
    db.flush()

    db.add_all([
        ExtractedField(
            verification_run_id=vrun1.id,
            document_id=doc1.id,
            field_name="applicant_name",
            extracted_value="Sarah Jenkins",
            expected_value="Sarah Jenkins",
            confidence=0.98,
            source_page=1,
            status=FieldMatchStatus.MATCHED.value,
            explanation="Exact token match with submitted form."
        ),
        ExtractedField(
            verification_run_id=vrun1.id,
            document_id=doc1.id,
            field_name="document_number",
            extracted_value="P-9842103",
            expected_value="P-9842103",
            confidence=0.95,
            source_page=1,
            status=FieldMatchStatus.MATCHED.value,
            explanation="Passport identification serial verified."
        ),
        ExtractedField(
            verification_run_id=vrun1.id,
            document_id=doc1.id,
            field_name="expiry_date",
            extracted_value="2032-06-10",
            expected_value="2032-06-10",
            confidence=0.96,
            source_page=1,
            status=FieldMatchStatus.MATCHED.value,
            explanation="Identification valid through 2032."
        )
    ])

    db.add_all([
        VerificationFinding(
            verification_run_id=vrun1.id,
            document_id=doc1.id,
            category=FindingCategory.FILE_INTEGRITY.value,
            status=FindingStatus.NO_ISSUE.value,
            severity=FindingSeverity.INFO.value,
            title="File Integrity Verified",
            description="Cryptographic SHA-256 hash unique and non-duplicated in platform database.",
            evidence=f"Hash: {doc1.sha256_hash}",
            reviewer_action="No reviewer action necessary."
        ),
        VerificationFinding(
            verification_run_id=vrun1.id,
            document_id=doc1.id,
            category=FindingCategory.DATA_CONSISTENCY.value,
            status=FindingStatus.NO_ISSUE.value,
            severity=FindingSeverity.INFO.value,
            title="Full Identity Match Confirmed",
            description="Applicant legal name exactly aligns between application form and official passport.",
            evidence="Form: Sarah Jenkins, Document: Sarah Jenkins",
            reviewer_action="Verified."
        )
    ])

    # Review decision for App 1
    db.add(ReviewDecision(
        application_id=app1.id,
        reviewer_id=reviewer_user.id,
        decision=ReviewDecisionType.VERIFIED.value,
        reason="Clean verification dossier with all documentation authenticated.",
        explanation="Reviewed passport, academic transcripts, and income documentation. All criteria conform to Academic Fellowship Guidelines.",
        created_at=datetime.now(timezone.utc) - timedelta(days=1)
    ))

    # Sample 2: UNDER_HUMAN_REVIEW Application (Business License with name variance)
    app2 = Application(
        reference_no="AIV-BIZ-2026-44109",
        applicant_id=applicant_user.id,
        category_id=cat_business.id,
        status=ApplicationStatus.UNDER_HUMAN_REVIEW.value,
        title="Downtown Artisan Bakery Commercial Permit",
        form_data={
            "applicant_name": "Sarah A. Jenkins",
            "business_name": "Artisan Harvest Bakehouse LLC",
            "registration_number": "CORP-992144-DE",
            "business_address": "402 Market Street, Suite 100",
            "employee_count": 8,
            "expiry_date": "2027-08-30"
        },
        current_risk_score="MEDIUM",
        assigned_reviewer_id=reviewer_user.id,
        created_at=datetime.now(timezone.utc) - timedelta(days=2),
        updated_at=datetime.now(timezone.utc) - timedelta(hours=6)
    )
    db.add(app2)
    db.flush()

    doc2_filename = "synth_doc_biz_app2.pdf"
    doc2_path = os.path.join(settings.STORAGE_DIR, doc2_filename)
    create_synthetic_pdf(
        doc2_path,
        "CERTIFICATE OF CORPORATE FORMATION & INCORPORATION",
        "Entity Name: Artisan Harvest Bakehouse LLC\nRegistration Number: CORP-992144-DE\nAuthorized Managing Member: Sarah Jenkins\nDate of Filing: 2023-01-15\nJurisdiction: State Division of Corporations\nStatus: Active and in Good Standing"
    )
    try:
        with open(doc2_path, "rb") as f:
            doc2_bytes = f.read()
    except Exception:
        doc2_bytes = b"%PDF-1.4 Certificate of Incorporation Synthetic Demo File"

    doc2 = Document(
        application_id=app2.id,
        user_id=applicant_user.id,
        document_type="BUSINESS_REGISTRATION",
        original_filename="Certificate_of_Incorporation_Artisan.pdf",
        stored_filename=doc2_filename,
        file_path=doc2_path,
        file_size=len(doc2_bytes),
        mime_type="application/pdf",
        sha256_hash=calculate_sha256(doc2_bytes),
        status=DocumentProcessingStatus.COMPLETED.value,
        extracted_text="Entity Name: Artisan Harvest Bakehouse LLC\nRegistration Number: CORP-992144-DE\nAuthorized Managing Member: Sarah Jenkins",
        created_at=datetime.now(timezone.utc) - timedelta(days=2)
    )
    db.add(doc2)
    db.flush()

    # Sample 3: NEEDS_INFORMATION Application
    app3 = Application(
        reference_no="AIV-SUB-2026-90214",
        applicant_id=applicant_user.id,
        category_id=cat_subsidy.id,
        status=ApplicationStatus.NEEDS_INFORMATION.value,
        title="Rooftop Solar Array Infrastructure Subsidy",
        form_data={
            "applicant_name": "Sarah Jenkins",
            "project_title": "Metro Commercial Solar Initiative Phase 1",
            "target_kw": 450,
            "requested_subsidy": 180000
        },
        current_risk_score="MEDIUM",
        assigned_reviewer_id=reviewer_user.id,
        created_at=datetime.now(timezone.utc) - timedelta(days=3),
        updated_at=datetime.now(timezone.utc) - timedelta(hours=12)
    )
    db.add(app3)
    db.flush()

    # Note on App 3 requesting info
    db.add(ReviewerNote(
        application_id=app3.id,
        author_id=reviewer_user.id,
        note_text="Please upload prior fiscal year financial statement or audit before grant committee evaluation.",
        is_internal=False,
        created_at=datetime.now(timezone.utc) - timedelta(hours=12)
    ))

    # Sample 4: DRAFT Application
    app4 = Application(
        reference_no="AIV-GEN-2026-11842",
        applicant_id=applicant_user.id,
        category_id=cat_general.id,
        status=ApplicationStatus.DRAFT.value,
        title="General Nonprofit Accreditation Filing",
        form_data={
            "applicant_name": "Sarah Jenkins",
            "organization_name": "Open Horizon Educational Trust",
            "jurisdiction": "New York"
        },
        current_risk_score="LOW",
        created_at=datetime.now(timezone.utc) - timedelta(hours=4),
        updated_at=datetime.now(timezone.utc) - timedelta(hours=4)
    )
    db.add(app4)

    # Initial notifications for applicant
    db.add(Notification(
        user_id=applicant_user.id,
        title="Welcome to AI Verify",
        message="Your enterprise verification profile has been configured. You can submit applications and track real-time compliance results.",
        type=NotificationType.SUCCESS.value,
        link="/applicant",
        created_at=datetime.now(timezone.utc) - timedelta(days=5)
    ))
    db.add(Notification(
        user_id=applicant_user.id,
        title="Additional Information Requested",
        message="Reviewer Vance requested financial audit documents for application AIV-SUB-2026-90214.",
        type=NotificationType.WARNING.value,
        link=f"/applicant/applications/{app3.id}",
        created_at=datetime.now(timezone.utc) - timedelta(hours=12)
    ))

    db.commit()
    print("AI Verify seed data successfully initialized!")
