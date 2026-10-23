from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.deps import get_db
from app.models.report import ContactMessage
from app.models.user import User, UserRole
from app.schemas.all_schemas import ContactMessageCreate, ContactMessageOut
from app.services.notification_service import send_notification

router = APIRouter()

@router.post("/", response_model=ContactMessageOut, status_code=status.HTTP_201_CREATED)
def submit_contact_message(
    request: ContactMessageCreate,
    db: Session = Depends(get_db)
):
    msg = ContactMessage(
        name=request.name.strip(),
        email=request.email.lower().strip(),
        subject=request.subject.strip(),
        organization=request.organization.strip() if request.organization else None,
        message=request.message.strip(),
        created_at=datetime.now(timezone.utc)
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Notify Admins
    admins = db.query(User).filter(User.role == UserRole.ADMIN.value).all()
    for admin in admins:
        send_notification(
            db=db,
            user_id=admin.id,
            title=f"New Contact Message: {msg.subject}",
            message=f"Received inquiry from {msg.name} ({msg.email})",
            link="/admin"
        )

    return msg
