from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.application import Application
from app.models.verification import VerificationRun
from app.schemas.all_schemas import VerificationRunOut
from app.api.v1.endpoints.applications import execute_verification_pipeline

router = APIRouter()

@router.post("/{application_id}/run", response_model=VerificationRunOut)
def run_verification(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    execute_verification_pipeline(application_id, db, current_user.id)

    latest_run = (
        db.query(VerificationRun)
        .filter(VerificationRun.application_id == application_id)
        .order_by(VerificationRun.created_at.desc())
        .first()
    )
    if not latest_run:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Verification run failed to complete.")

    return latest_run

@router.get("/{application_id}/latest", response_model=VerificationRunOut)
def get_latest_verification(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    latest_run = (
        db.query(VerificationRun)
        .filter(VerificationRun.application_id == application_id)
        .order_by(VerificationRun.created_at.desc())
        .first()
    )
    if not latest_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No verification runs found for this application.")

    return latest_run
