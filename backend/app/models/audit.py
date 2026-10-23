from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "APPLICATION_SUBMITTED", "VERIFICATION_RUN", "DECISION_RECORDED"
    resource_type = Column(String(100), nullable=False) # e.g. "APPLICATION", "DOCUMENT", "COMPLIANCE_RULE"
    resource_id = Column(String(255), nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="audit_events")
