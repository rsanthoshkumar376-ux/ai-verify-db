from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.deps import get_db, require_role, get_current_user
from app.models.user import User, UserRole
from app.models.application import Application, ApplicationStatus, ApplicationStatusHistory
from app.models.review import ReviewDecision, ReviewerNote, ReviewDecisionType
from app.schemas.all_schemas import (
    ReviewDecisionCreate,
    ReviewDecisionOut,
    ReviewerNoteCreate,
    ReviewerNoteOut,
    ApplicationDetailOut
)
from app.services.notification_service import send_notification, record_audit_event

router = APIRouter()

@router.post("/{application_id}/assign")
def assign_reviewer(
    application_id: str,
    reviewer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.REVIEWER, UserRole.ADMIN]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    target_reviewer = db.query(User).filter(User.id == reviewer_id).first()
    if not target_reviewer or target_reviewer.role not in (UserRole.REVIEWER.value, UserRole.ADMIN.value):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected user is not an authorized reviewer.")

    app.assigned_reviewer_id = target_reviewer.id
    app.updated_at = datetime.now(timezone.utc)
    db.commit()

    record_audit_event(
        db=db,
        user_id=current_user.id,
        action="REVIEWER_ASSIGNED",
        resource_type="APPLICATION",
        resource_id=app.id,
        details={"assigned_reviewer": target_reviewer.full_name}
    )

    return {"message": f"Assigned to {target_reviewer.full_name}"}

@router.post("/{application_id}/decision", response_model=ReviewDecisionOut)
def record_review_decision(
    application_id: str,
    request: ReviewDecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.REVIEWER, UserRole.ADMIN]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    prev_status = app.status

    # Map decision to application status
    if request.decision == ReviewDecisionType.VERIFIED:
        new_status = ApplicationStatus.VERIFIED.value
    elif request.decision == ReviewDecisionType.REJECTED:
        new_status = ApplicationStatus.REJECTED.value
    elif request.decision == ReviewDecisionType.NEEDS_INFORMATION:
        new_status = ApplicationStatus.NEEDS_INFORMATION.value
    elif request.decision == ReviewDecisionType.ESCALATED:
        new_status = ApplicationStatus.UNDER_HUMAN_REVIEW.value
    else:
        new_status = app.status

    app.status = new_status
    app.updated_at = datetime.now(timezone.utc)

    # Save Decision record
    decision = ReviewDecision(
        application_id=app.id,
        reviewer_id=current_user.id,
        decision=request.decision.value,
        reason=request.reason.strip(),
        explanation=request.explanation.strip(),
        created_at=datetime.now(timezone.utc)
    )
    db.add(decision)

    # Save Status History
    sh = ApplicationStatusHistory(
        application_id=app.id,
        previous_status=prev_status,
        new_status=new_status,
        changed_by_id=current_user.id,
        reason=f"Reviewer Decision: {request.decision.value}. Reason: {request.reason}",
        created_at=datetime.now(timezone.utc)
    )
    db.add(sh)

    db.commit()
    db.refresh(decision)

    # Dispatch notification to applicant
    send_notification(
        db=db,
        user_id=app.applicant_id,
        title=f"Application Review Update: {request.decision.value}",
        message=f"A compliance decision has been recorded for {app.reference_no}: {request.reason}",
        link=f"/applicant/applications/{app.id}"
    )

    record_audit_event(
        db=db,
        user_id=current_user.id,
        action="REVIEW_DECISION_RECORDED",
        resource_type="APPLICATION",
        resource_id=app.id,
        details={"decision": request.decision.value, "reason": request.reason}
    )

    return {
        "id": decision.id,
        "reviewer_name": current_user.full_name,
        "decision": decision.decision,
        "reason": decision.reason,
        "explanation": decision.explanation,
        "created_at": decision.created_at
    }

@router.post("/{application_id}/notes", response_model=ReviewerNoteOut)
def add_reviewer_note(
    application_id: str,
    request: ReviewerNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.REVIEWER, UserRole.ADMIN]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    note = ReviewerNote(
        application_id=app.id,
        author_id=current_user.id,
        note_text=request.note_text.strip(),
        is_internal=request.is_internal,
        created_at=datetime.now(timezone.utc)
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    if not request.is_internal:
        # Notify applicant if public note
        send_notification(
            db=db,
            user_id=app.applicant_id,
            title="New Note on Application",
            message=f"Reviewer added a note on {app.reference_no}: {request.note_text[:80]}",
            link=f"/applicant/applications/{app.id}"
        )

    return {
        "id": note.id,
        "author_name": current_user.full_name,
        "note_text": note.note_text,
        "is_internal": note.is_internal,
        "created_at": note.created_at
    }
