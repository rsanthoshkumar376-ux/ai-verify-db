from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base
import enum

class ReviewDecisionType(str, enum.Enum):
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    NEEDS_INFORMATION = "NEEDS_INFORMATION"
    ESCALATED = "ESCALATED"

class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    decision = Column(String(50), nullable=False) # VERIFIED, REJECTED, NEEDS_INFORMATION, ESCALATED
    reason = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="review_decisions")
    reviewer = relationship("User")

class ReviewerNote(Base):
    __tablename__ = "reviewer_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    note_text = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=True, nullable=False) # Internal reviewer note vs visible to applicant
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="reviewer_notes")
    author = relationship("User")
