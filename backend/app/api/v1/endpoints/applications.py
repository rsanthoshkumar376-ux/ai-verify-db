from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import random

from app.core.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.application import Application, ApplicationCategory, ApplicationStatus, ApplicationStatusHistory
from app.models.document import Document
from app.models.verification import VerificationRun, ExtractedField, VerificationFinding
from app.models.compliance import ComplianceEvaluation
from app.schemas.all_schemas import (
    ApplicationCategoryOut,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationDetailOut,
    ApplicationListItemOut
)
from app.services.notification_service import send_notification, record_audit_event
from app.services.ai_intelligence import run_ai_document_analysis
from app.services.tamper_detection import analyze_tamper_and_authenticity
from app.services.compliance_engine import run_compliance_evaluation

router = APIRouter()

def execute_verification_pipeline(application_id: str, db: Session, triggered_by_id: Optional[str] = None):
    """
    Executes the comprehensive verification sequence:
    1. Retrieve documents
    2. Run AI extraction and comparison
    3. Run tamper & authenticity checks
    4. Run regulatory compliance rules
    5. Calculate risk score
    6. Update application status
    """
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        return

    documents = db.query(Document).filter(Document.application_id == application_id).all()
    all_extracted_fields = []
    all_findings = []

    doc_text_combined = "\n\n".join([d.extracted_text or "" for d in documents])
    
    # 1. AI Field Extraction (Deterministic / Gemini)
    # Using deterministic / Gemini analysis
    from app.services.ai_intelligence import extract_fields_deterministic
    fields = extract_fields_deterministic(
        document_text=doc_text_combined,
        doc_type=documents[0].document_type if documents else "GENERAL",
        form_data=app.form_data or {}
    )

    # 2. Tamper & Authenticity Checks
    for doc in documents:
        doc_findings = analyze_tamper_and_authenticity(
            db=db,
            document=doc,
            form_data=app.form_data or {},
            extracted_fields=fields,
            current_app_id=app.id
        )
        all_findings.extend(doc_findings)

    # 3. Compliance Rule Evaluation
    compliance_results = run_compliance_evaluation(
        db=db,
        application=app,
        documents=documents,
        extracted_fields=fields
    )

    # Calculate overall risk score
    mismatches = [f for f in fields if f.get("status") == "MISMATCH"]
    high_findings = [f for f in all_findings if f.get("severity") in ("HIGH", "CRITICAL")]
    failed_rules = [c for c in compliance_results if c.get("outcome") == "FAILED"]
    warning_rules = [c for c in compliance_results if c.get("outcome") == "WARNING"]

    risk_score = 0.1
    if failed_rules or high_findings:
        risk_level = "HIGH"
        risk_score = 0.85
    elif mismatches or warning_rules:
        risk_level = "MEDIUM"
        risk_score = 0.50
    else:
        risk_level = "LOW"
        risk_score = 0.15

    # Create Verification Run
    v_run = VerificationRun(
        application_id=app.id,
        triggered_by_id=triggered_by_id,
        status="COMPLETED",
        ai_provider="DEMO_INTELLIGENCE_ENGINE",
        risk_level=risk_level,
        risk_score=risk_score,
        summary=f"Automated verification completed. Risk Tier: {risk_level}. Evaluated {len(compliance_results)} compliance rules with {len(failed_rules)} non-conformances.",
        is_demo_simulated=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(v_run)
    db.flush()

    # Save Extracted Fields
    for f in fields:
        ef = ExtractedField(
            verification_run_id=v_run.id,
            document_id=documents[0].id if documents else None,
            field_name=f["field_name"],
            extracted_value=f["extracted_value"],
            expected_value=f["expected_value"],
            confidence=f["confidence"],
            source_page=f["source_page"],
            status=f["status"],
            explanation=f["explanation"]
        )
        db.add(ef)

    # Save Findings
    for fn in all_findings:
        vf = VerificationFinding(
            verification_run_id=v_run.id,
            document_id=documents[0].id if documents else None,
            category=fn["category"],
            status=fn["status"],
            severity=fn["severity"],
            title=fn["title"],
            description=fn["description"],
            evidence=fn.get("evidence"),
            reviewer_action=fn.get("reviewer_action")
        )
        db.add(vf)

    # Save Compliance Evaluations
    for cr in compliance_results:
        ce = ComplianceEvaluation(
            verification_run_id=v_run.id,
            rule_id=cr["rule_id"],
            rule_version=cr["rule_version"],
            outcome=cr["outcome"],
            score=cr["score"],
            message=cr["message"],
            evidence_details=cr["evidence_details"],
            created_at=datetime.now(timezone.utc)
        )
        db.add(ce)

    # Update application risk score and status to UNDER_HUMAN_REVIEW
    app.current_risk_score = risk_level
    if app.status == ApplicationStatus.SUBMITTED.value or app.status == ApplicationStatus.PROCESSING.value:
        app.status = ApplicationStatus.UNDER_HUMAN_REVIEW.value
        
        # Add status history
        sh = ApplicationStatusHistory(
            application_id=app.id,
            previous_status=ApplicationStatus.PROCESSING.value,
            new_status=ApplicationStatus.UNDER_HUMAN_REVIEW.value,
            changed_by_id=triggered_by_id,
            reason="Preliminary AI document extraction and compliance verification finished. Queued for authorized reviewer verification.",
            created_at=datetime.now(timezone.utc)
        )
        db.add(sh)

    db.commit()

    # Send Notification to Applicant
    send_notification(
        db=db,
        user_id=app.applicant_id,
        title="Verification Processing Completed",
        message=f"Application {app.reference_no} verification run finished. Preliminary risk: {risk_level}.",
        link=f"/applicant/applications/{app.id}"
    )

@router.get("/categories", response_model=List[ApplicationCategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(ApplicationCategory).all()

@router.get("/", response_model=List[ApplicationListItemOut])
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Application)

    # RBAC: Applicants ONLY see their own applications
    if current_user.role == UserRole.APPLICANT.value:
        query = query.filter(Application.applicant_id == current_user.id)
    # Reviewers & Admins see applications
    elif current_user.role == UserRole.REVIEWER.value:
        pass

    if status_filter:
        query = query.filter(Application.status == status_filter)
    if category_id:
        query = query.filter(Application.category_id == category_id)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Application.title.ilike(search_fmt)) |
            (Application.reference_no.ilike(search_fmt))
        )

    apps = query.order_by(Application.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for app in apps:
        items.append({
            "id": app.id,
            "reference_no": app.reference_no,
            "applicant_name": app.applicant.full_name if app.applicant else "N/A",
            "category_name": app.category.name if app.category else "General",
            "title": app.title,
            "status": app.status,
            "current_risk_score": app.current_risk_score,
            "document_count": len(app.documents),
            "assigned_reviewer_name": app.assigned_reviewer.full_name if app.assigned_reviewer else None,
            "created_at": app.created_at,
            "updated_at": app.updated_at
        })
    return items

@router.post("/", response_model=ApplicationDetailOut, status_code=status.HTTP_201_CREATED)
def create_application(
    request: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify category exists
    category = db.query(ApplicationCategory).filter(ApplicationCategory.id == request.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified application category not found."
        )

    # Generate unique reference
    year = datetime.now(timezone.utc).year
    rand_digits = random.randint(10000, 99999)
    ref_code = f"AIV-{category.code}-{year}-{rand_digits}"

    initial_status = ApplicationStatus.DRAFT.value if request.is_draft else ApplicationStatus.SUBMITTED.value

    app = Application(
        reference_no=ref_code,
        applicant_id=current_user.id,
        category_id=category.id,
        status=initial_status,
        title=request.title.strip(),
        form_data=request.form_data or {},
        current_risk_score="LOW",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    # Status history record
    sh = ApplicationStatusHistory(
        application_id=app.id,
        previous_status=None,
        new_status=initial_status,
        changed_by_id=current_user.id,
        reason="Application record created in platform.",
        created_at=datetime.now(timezone.utc)
    )
    db.add(sh)
    db.commit()

    record_audit_event(
        db=db,
        user_id=current_user.id,
        action="APPLICATION_CREATED",
        resource_type="APPLICATION",
        resource_id=app.id,
        details={"reference_no": ref_code, "status": initial_status}
    )

    return get_application_detail(app.id, db, current_user)

@router.get("/{id}", response_model=ApplicationDetailOut)
def get_application_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found."
        )

    # RBAC Check: Applicants cannot view other applicants' records
    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only view your own applications."
        )

    return {
        "id": app.id,
        "reference_no": app.reference_no,
        "applicant_id": app.applicant_id,
        "applicant_name": app.applicant.full_name if app.applicant else None,
        "applicant_email": app.applicant.email if app.applicant else None,
        "category_id": app.category_id,
        "category_name": app.category.name if app.category else None,
        "status": app.status,
        "title": app.title,
        "form_data": app.form_data,
        "current_risk_score": app.current_risk_score,
        "assigned_reviewer_id": app.assigned_reviewer_id,
        "assigned_reviewer_name": app.assigned_reviewer.full_name if app.assigned_reviewer else None,
        "created_at": app.created_at,
        "updated_at": app.updated_at,
        "documents": app.documents,
        "verification_runs": app.verification_runs,
        "status_history": [
            {
                "id": sh.id,
                "previous_status": sh.previous_status,
                "new_status": sh.new_status,
                "changed_by_name": sh.changed_by.full_name if sh.changed_by else "System",
                "reason": sh.reason,
                "created_at": sh.created_at
            }
            for sh in app.status_history
        ],
        "reviewer_notes": [
            {
                "id": rn.id,
                "author_name": rn.author.full_name if rn.author else "Reviewer",
                "note_text": rn.note_text,
                "is_internal": rn.is_internal,
                "created_at": rn.created_at
            }
            for rn in app.reviewer_notes
            if not rn.is_internal or current_user.role in (UserRole.REVIEWER.value, UserRole.ADMIN.value)
        ],
        "review_decisions": [
            {
                "id": rd.id,
                "reviewer_name": rd.reviewer.full_name if rd.reviewer else "Compliance Officer",
                "decision": rd.decision,
                "reason": rd.reason,
                "explanation": rd.explanation,
                "created_at": rd.created_at
            }
            for rd in app.review_decisions
        ]
    }

@router.put("/{id}", response_model=ApplicationDetailOut)
def update_application(
    id: str,
    request: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if app.status not in (ApplicationStatus.DRAFT.value, ApplicationStatus.NEEDS_INFORMATION.value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit application while in '{app.status}' status."
        )

    if request.title:
        app.title = request.title.strip()
    if request.form_data is not None:
        merged_form = dict(app.form_data or {})
        merged_form.update(request.form_data)
        app.form_data = merged_form

    app.updated_at = datetime.now(timezone.utc)
    db.commit()

    return get_application_detail(app.id, db, current_user)

@router.post("/{id}/submit", response_model=ApplicationDetailOut)
def submit_application(
    id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Check that required documents exist
    category = app.category
    required_doc_specs = category.required_documents or []
    uploaded_doc_types = {d.document_type for d in app.documents}
    
    missing_docs = []
    for spec in required_doc_specs:
        if spec.get("required", True) and spec.get("type") not in uploaded_doc_types:
            missing_docs.append(spec.get("name", spec.get("type")))

    if missing_docs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing mandatory documents: {', '.join(missing_docs)}"
        )

    prev_status = app.status
    app.status = ApplicationStatus.PROCESSING.value
    app.updated_at = datetime.now(timezone.utc)

    sh = ApplicationStatusHistory(
        application_id=app.id,
        previous_status=prev_status,
        new_status=ApplicationStatus.PROCESSING.value,
        changed_by_id=current_user.id,
        reason="Application submitted by applicant. Queued for automated OCR extraction and verification.",
        created_at=datetime.now(timezone.utc)
    )
    db.add(sh)
    db.commit()

    # Trigger verification synchronously or via background task
    # For instant testability and demonstration responsiveness, execute pipeline
    execute_verification_pipeline(app.id, db, current_user.id)

    record_audit_event(
        db=db,
        user_id=current_user.id,
        action="APPLICATION_SUBMITTED",
        resource_type="APPLICATION",
        resource_id=app.id,
        details={"reference_no": app.reference_no}
    )

    return get_application_detail(app.id, db, current_user)

@router.post("/{id}/withdraw", response_model=ApplicationDetailOut)
def withdraw_application(
    id: str,
    reason: str = Query("Applicant voluntarily withdrew submission"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    prev_status = app.status
    app.status = ApplicationStatus.WITHDRAWN.value
    app.updated_at = datetime.now(timezone.utc)

    sh = ApplicationStatusHistory(
        application_id=app.id,
        previous_status=prev_status,
        new_status=ApplicationStatus.WITHDRAWN.value,
        changed_by_id=current_user.id,
        reason=reason,
        created_at=datetime.now(timezone.utc)
    )
    db.add(sh)
    db.commit()

    return get_application_detail(app.id, db, current_user)
