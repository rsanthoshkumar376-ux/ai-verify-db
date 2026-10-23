from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base

class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_code = Column(String(64), unique=True, index=True, nullable=False)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    generated_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    report_title = Column(String(255), nullable=False)
    pdf_filename = Column(String(255), nullable=False)
    pdf_path = Column(String(512), nullable=False)
    verification_summary = Column(JSON, default=dict, nullable=False)
    disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application")
    generated_by = relationship("User")

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
