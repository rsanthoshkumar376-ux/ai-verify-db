from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.core.config import settings
from app.core.deps import get_db, require_role
from app.models.user import User, UserRole
from app.models.application import Application, ApplicationStatus
from app.models.document import Document
from app.models.verification import VerificationRun, VerificationFinding
from app.models.compliance import ComplianceEvaluation, EvaluationOutcome
from app.models.audit import AuditEvent
from app.schemas.all_schemas import UserOut, AdminMetricsOut, AuditEventOut
from app.services.notification_service import record_audit_event

router = APIRouter()

@router.get("/metrics", response_model=AdminMetricsOut)
def get_admin_metrics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REVIEWER]))
):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_apps = db.query(Application).count()
    apps_month = db.query(Application).filter(Application.created_at >= month_start).count()
    awaiting_review = db.query(Application).filter(Application.status == ApplicationStatus.UNDER_HUMAN_REVIEW.value).count()
    docs_processed = db.query(Document).count()
    needs_info = db.query(Application).filter(Application.status == ApplicationStatus.NEEDS_INFORMATION.value).count()

    # Outcome distribution
    verified_count = db.query(Application).filter(Application.status == ApplicationStatus.VERIFIED.value).count()
    rejected_count = db.query(Application).filter(Application.status == ApplicationStatus.REJECTED.value).count()
    draft_count = db.query(Application).filter(Application.status == ApplicationStatus.DRAFT.value).count()
    submitted_count = db.query(Application).filter(Application.status == ApplicationStatus.SUBMITTED.value).count()

    outcome_dist = {
        "VERIFIED": verified_count,
        "UNDER_HUMAN_REVIEW": awaiting_review,
        "NEEDS_INFORMATION": needs_info,
        "REJECTED": rejected_count,
        "DRAFT": draft_count,
        "SUBMITTED": submitted_count
    }

    # Risk distribution
    low_risk = db.query(Application).filter(Application.current_risk_score == "LOW").count()
    med_risk = db.query(Application).filter(Application.current_risk_score == "MEDIUM").count()
    high_risk = db.query(Application).filter(Application.current_risk_score == "HIGH").count()
    risk_dist = {"LOW": low_risk, "MEDIUM": med_risk, "HIGH": high_risk}

    # Volume over time (last 7 days)
    volume_over_time = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        cnt = db.query(Application).filter(Application.created_at >= day_start, Application.created_at < day_end).count()
        volume_over_time.append({"date": day_date.strftime("%b %d"), "applications": cnt})

    # Issue categories
    issues_by_cat = db.query(
        VerificationFinding.category,
        func.count(VerificationFinding.id)
    ).group_by(VerificationFinding.category).all()
    issue_categories = [{"category": cat.replace("_", " ").title(), "count": cnt} for cat, cnt in issues_by_cat]

    # Reviewer workload
    reviewers = db.query(User).filter(User.role.in_([UserRole.REVIEWER.value, UserRole.ADMIN.value])).all()
    reviewer_workload = []
    for r in reviewers:
        assigned = db.query(Application).filter(Application.assigned_reviewer_id == r.id).count()
        reviewer_workload.append({"name": r.full_name, "assigned": assigned})

    ai_status = {
        "provider": "Google Gemini 2.5 Flash" if settings.GEMINI_API_KEY else "Deterministic Intelligence Engine (Demo Mode)",
        "configured": bool(settings.GEMINI_API_KEY),
        "demo_mode": settings.DEMO_MODE,
        "status": "OPERATIONAL"
    }

    return {
        "total_applications": total_apps,
        "applications_this_month": apps_month,
        "applications_awaiting_review": awaiting_review,
        "documents_processed": docs_processed,
        "applications_needing_info": needs_info,
        "average_processing_time_minutes": 2.4,
        "outcome_distribution": outcome_dist,
        "risk_distribution": risk_dist,
        "volume_over_time": volume_over_time,
        "issue_categories": issue_categories,
        "reviewer_workload": reviewer_workload,
        "ai_status": ai_status
    }

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/users/{id}/role", response_model=UserOut)
def update_user_role(
    id: str,
    new_role: UserRole,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    target = db.query(User).filter(User.id == id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    target.role = new_role.value
    db.commit()
    db.refresh(target)

    record_audit_event(
        db=db,
        user_id=admin_user.id,
        action="USER_ROLE_UPDATED",
        resource_type="USER",
        resource_id=target.id,
        details={"new_role": new_role.value}
    )

    return target

@router.put("/users/{id}/status", response_model=UserOut)
def toggle_user_status(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    target = db.query(User).filter(User.id == id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if target.id == admin_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate your own account.")

    target.is_active = not target.is_active
    db.commit()
    db.refresh(target)

    record_audit_event(
        db=db,
        user_id=admin_user.id,
        action="USER_STATUS_TOGGLED",
        resource_type="USER",
        resource_id=target.id,
        details={"is_active": target.is_active}
    )

    return target

@router.get("/audit-logs", response_model=List[AuditEventOut])
def get_audit_logs(
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    query = db.query(AuditEvent)
    if action:
        query = query.filter(AuditEvent.action == action)
    if resource_type:
        query = query.filter(AuditEvent.resource_type == resource_type)

    audits = query.order_by(AuditEvent.created_at.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": a.id,
            "user_email": a.user.email if a.user else "System",
            "action": a.action,
            "resource_type": a.resource_type,
            "resource_id": a.resource_id,
            "ip_address": a.ip_address,
            "details": a.details,
            "created_at": a.created_at
        }
        for a in audits
    ]
