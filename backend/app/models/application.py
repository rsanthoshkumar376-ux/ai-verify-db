from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base
import enum

class ApplicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PROCESSING = "PROCESSING"
    NEEDS_INFORMATION = "NEEDS_INFORMATION"
    UNDER_HUMAN_REVIEW = "UNDER_HUMAN_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"

class ApplicationCategory(Base):
    __tablename__ = "application_categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    required_documents = Column(JSON, default=list, nullable=False) # list of doc requirement specs
    form_schema = Column(JSON, default=dict, nullable=False) # dynamic field specifications
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    applications = relationship("Application", back_populates="category")

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_no = Column(String(64), unique=True, index=True, nullable=False)
    applicant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(String(36), ForeignKey("application_categories.id"), nullable=False)
    status = Column(String(50), default=ApplicationStatus.DRAFT.value, nullable=False)
    title = Column(String(255), nullable=False)
    form_data = Column(JSON, default=dict, nullable=False)
    current_risk_score = Column(String(50), default="LOW", nullable=False) # LOW, MEDIUM, HIGH
    assigned_reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    applicant = relationship("User", back_populates="applications", foreign_keys=[applicant_id])
    assigned_reviewer = relationship("User", foreign_keys=[assigned_reviewer_id])
    category = relationship("ApplicationCategory", back_populates="applications")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    verification_runs = relationship("VerificationRun", back_populates="application", cascade="all, delete-orphan")
    status_history = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan")
    reviewer_notes = relationship("ReviewerNote", back_populates="application", cascade="all, delete-orphan")
    review_decisions = relationship("ReviewDecision", back_populates="application", cascade="all, delete-orphan")

class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="status_history")
    changed_by = relationship("User")
