import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.notification import Notification, NotificationType
from app.models.audit import AuditEvent

logger = logging.getLogger("ai_verify.notifications")

def send_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.INFO,
    link: Optional[str] = None
) -> Notification:
    """
    Creates an in-app notification and safely logs an email alert stub.
    Does NOT log sensitive personal document contents.
    """
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type.value,
        link=link,
        is_read=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # Safe email provider dispatch simulation (no sensitive payload logged)
    logger.info(f"[EMAIL DISPATCH SIMULATION] Sent to user_id={user_id}: {title}")
    return notif

def record_audit_event(
    db: Session,
    user_id: Optional[str],
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditEvent:
    """
    Records an immutable audit event for compliance tracking.
    """
    audit = AuditEvent(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        details=details or {},
        created_at=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit
