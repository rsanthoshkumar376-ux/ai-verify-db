import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from typing import Optional
from app.core.config import settings
from app.core.deps import get_db, get_current_user, get_current_user_flexible
from app.models.user import User, UserRole
from app.models.application import Application
from app.models.verification import VerificationRun
from app.models.report import GeneratedReport
from app.schemas.all_schemas import GeneratedReportOut
from app.services.report_generator import generate_pdf_report
from app.services.notification_service import record_audit_event

router = APIRouter()

@router.post("/{application_id}/generate", response_model=GeneratedReportOut)
def create_report(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    v_run = (
        db.query(VerificationRun)
        .filter(VerificationRun.application_id == application_id)
        .order_by(VerificationRun.created_at.desc())
        .first()
    )
    if not v_run:
        try:
            from app.api.v1.endpoints.applications import execute_verification_pipeline
            execute_verification_pipeline(application_id, db, current_user.id)
            v_run = (
                db.query(VerificationRun)
                .filter(VerificationRun.application_id == application_id)
                .order_by(VerificationRun.created_at.desc())
                .first()
            )
        except Exception as exc:
            print(f"Auto-verification execution note: {exc}")

    if not v_run:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate verification report before verification has been performed."
        )

    year = datetime.now(timezone.utc).year
    report_code = f"REP-{year}-{uuid.uuid4().hex[:8].upper()}"

    # Generate the physical PDF file
    pdf_path = generate_pdf_report(app, v_run, report_code)

    rep = GeneratedReport(
        report_code=report_code,
        application_id=app.id,
        generated_by_id=current_user.id,
        report_title=f"Verification Report — {app.reference_no}",
        pdf_filename=f"{report_code}.pdf",
        pdf_path=pdf_path,
        verification_summary={"risk_level": v_run.risk_level, "risk_score": v_run.risk_score},
        disclaimer="AI-Assisted Preliminary Assessment — Not Legal Advice or Official Certificate",
        created_at=datetime.now(timezone.utc)
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)

    record_audit_event(
        db=db,
        user_id=current_user.id,
        action="REPORT_GENERATED",
        resource_type="REPORT",
        resource_id=rep.id,
        details={"report_code": report_code, "application_id": app.id}
    )

    return rep

@router.get("/{application_id}/download")
def download_report(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_flexible)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app and settings.DEMO_MODE:
        app = db.query(Application).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user and current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        if not settings.DEMO_MODE:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    rep = (
        db.query(GeneratedReport)
        .filter(GeneratedReport.application_id == app.id)
        .order_by(GeneratedReport.created_at.desc())
        .first()
    )

    # Auto-generate if not yet generated or missing from disk (e.g. ephemeral serverless container)
    if not rep or not os.path.exists(rep.pdf_path):
        v_run = (
            db.query(VerificationRun)
            .filter(VerificationRun.application_id == app.id)
            .order_by(VerificationRun.created_at.desc())
            .first()
        )
        if not v_run:
            try:
                from app.api.v1.endpoints.applications import execute_verification_pipeline
                caller_id = current_user.id if current_user else app.applicant_id
                execute_verification_pipeline(app.id, db, caller_id)
                v_run = (
                    db.query(VerificationRun)
                    .filter(VerificationRun.application_id == app.id)
                    .order_by(VerificationRun.created_at.desc())
                    .first()
                )
            except Exception as exc:
                print(f"Auto-verification execution note: {exc}")

        if not v_run:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification run must be performed before report can be downloaded."
            )
        year = datetime.now(timezone.utc).year
        report_code = rep.report_code if rep else f"REP-{year}-{uuid.uuid4().hex[:8].upper()}"
        pdf_path = generate_pdf_report(app, v_run, report_code)
        if not rep:
            rep = GeneratedReport(
                report_code=report_code,
                application_id=app.id,
                generated_by_id=current_user.id if current_user else app.applicant_id,
                report_title=f"Verification Report — {app.reference_no}",
                pdf_filename=f"{report_code}.pdf",
                pdf_path=pdf_path,
                verification_summary={"risk_level": v_run.risk_level, "risk_score": v_run.risk_score},
                disclaimer="AI-Assisted Preliminary Assessment",
                created_at=datetime.now(timezone.utc)
            )
            db.add(rep)
        else:
            rep.pdf_path = pdf_path
            rep.pdf_filename = f"{report_code}.pdf"
        db.commit()
        db.refresh(rep)

    return FileResponse(
        path=rep.pdf_path,
        media_type="application/pdf",
        filename=rep.pdf_filename,
        headers={"Content-Disposition": f'inline; filename="{rep.pdf_filename}"'}
    )
