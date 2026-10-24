import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.config import settings
from app.core.deps import get_db, get_current_user, get_current_user_flexible
from app.models.user import User, UserRole
from app.models.application import Application, ApplicationStatus
from app.models.document import Document, DocumentMetadata, DocumentProcessingStatus
from app.schemas.all_schemas import DocumentOut
from app.services.storage import save_uploaded_file, sanitize_filename
from app.services.ocr_service import extract_pdf_metadata_and_text, extract_image_metadata_and_text, normalize_text
from app.services.notification_service import record_audit_event

router = APIRouter()

@router.post("/{application_id}/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    application_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    # Authorization
    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if app.status not in (ApplicationStatus.DRAFT.value, ApplicationStatus.NEEDS_INFORMATION.value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot upload documents when application is in '{app.status}' status."
        )

    # Clean filename
    clean_original_name = sanitize_filename(file.filename or "uploaded_document")

    # Save to private storage with magic-byte validation
    stored_name, full_path, file_size, mime_type, sha256_hash = await save_uploaded_file(file)

    # Create Document record
    doc = Document(
        application_id=app.id,
        user_id=current_user.id,
        document_type=document_type,
        original_filename=clean_original_name,
        stored_filename=stored_name,
        file_path=full_path,
        file_size=file_size,
        mime_type=mime_type,
        sha256_hash=sha256_hash,
        status=DocumentProcessingStatus.PROCESSING.value,
        created_at=datetime.now(timezone.utc)
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Extract metadata & text safely
    try:
        if "pdf" in mime_type:
            meta_info, raw_text = extract_pdf_metadata_and_text(full_path)
        else:
            meta_info, raw_text = extract_image_metadata_and_text(full_path)

        doc.extracted_text = normalize_text(raw_text)
        doc.status = DocumentProcessingStatus.COMPLETED.value

        meta_rec = DocumentMetadata(
            document_id=doc.id,
            page_count=meta_info.get("page_count", 1),
            author=meta_info.get("author"),
            creator=meta_info.get("creator"),
            producer=meta_info.get("producer"),
            creation_date=meta_info.get("creation_date"),
            mod_date=meta_info.get("mod_date"),
            has_digital_signature=meta_info.get("has_digital_signature", False),
            raw_metadata=meta_info.get("raw_metadata", {}),
            detected_anomalies=meta_info.get("anomalies", [])
        )
        db.add(meta_rec)
        db.commit()
        db.refresh(doc)

    except Exception as e:
        doc.status = DocumentProcessingStatus.FAILED.value
        doc.error_message = f"Document processing failed: {str(e)}"
        db.commit()

    record_audit_event(
        db=db,
        user_id=current_user.id,
        action="DOCUMENT_UPLOADED",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        details={
            "application_id": app.id,
            "filename": clean_original_name,
            "document_type": document_type,
            "size_bytes": file_size,
            "sha256": sha256_hash
        }
    )

    return doc

@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_flexible)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc and settings.DEMO_MODE:
        doc = db.query(Document).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Authorization check
    app = doc.application
    if current_user and current_user.role == UserRole.APPLICANT.value and app and app.applicant_id != current_user.id:
        if not settings.DEMO_MODE:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if not os.path.exists(doc.file_path):
        # In serverless environments where /tmp files are wiped between cold starts, reconstruct placeholder file
        os.makedirs(os.path.dirname(doc.file_path), exist_ok=True)
        if "pdf" in (doc.mime_type or "").lower():
            valid_pdf = (
                b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
                b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
                b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
                b"xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000057 00000 n \n0000000114 00000 n \n"
                b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n201\n%%EOF\n"
            )
            with open(doc.file_path, "wb") as f:
                f.write(valid_pdf)
        else:
            with open(doc.file_path, "wb") as f:
                f.write(f"Sample File: {doc.original_filename}\n{doc.extracted_text or ''}".encode("utf-8"))

    record_audit_event(
        db=db,
        user_id=current_user.id if current_user else "anonymous",
        action="DOCUMENT_DOWNLOADED",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        details={"filename": doc.original_filename}
    )

    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type,
        filename=doc.original_filename,
        headers={"Content-Disposition": f'inline; filename="{doc.original_filename}"'}
    )

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    app = doc.application
    if current_user.role == UserRole.APPLICANT.value and app.applicant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if app.status not in (ApplicationStatus.DRAFT.value, ApplicationStatus.NEEDS_INFORMATION.value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot remove documents when application is in '{app.status}' status."
        )

    # Safely remove file on disk
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception:
        pass

    db.delete(doc)
    db.commit()

    return {"message": "Document successfully deleted."}

@router.post("/{document_id}/retry", response_model=DocumentOut)
def retry_document_processing(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    doc.status = DocumentProcessingStatus.PROCESSING.value
    doc.error_message = None
    db.commit()

    try:
        if "pdf" in doc.mime_type:
            meta_info, raw_text = extract_pdf_metadata_and_text(doc.file_path)
        else:
            meta_info, raw_text = extract_image_metadata_and_text(doc.file_path)

        doc.extracted_text = normalize_text(raw_text)
        doc.status = DocumentProcessingStatus.COMPLETED.value
        db.commit()
    except Exception as e:
        doc.status = DocumentProcessingStatus.FAILED.value
        doc.error_message = str(e)
        db.commit()

    return doc
