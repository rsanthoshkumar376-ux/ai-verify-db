from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    APPLICANT = "APPLICANT"
    REVIEWER = "REVIEWER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=True)
    role = Column(String(50), default=UserRole.APPLICANT.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    applications = relationship("Application", back_populates="applicant", foreign_keys="Application.applicant_id", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="user")
