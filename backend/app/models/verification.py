from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base
import enum

class FieldMatchStatus(str, enum.Enum):
    MATCHED = "MATCHED"
    MISMATCH = "MISMATCH"
    MISSING = "MISSING"
    UNVERIFIED = "UNVERIFIED"

class FindingSeverity(str, enum.Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class FindingCategory(str, enum.Enum):
    FILE_INTEGRITY = "FILE_INTEGRITY"
    DATA_CONSISTENCY = "DATA_CONSISTENCY"
    DIGITAL_SIGNATURE = "DIGITAL_SIGNATURE"
    ISSUER_AUTHENTICITY = "ISSUER_AUTHENTICITY"
    SUSPECTED_MANIPULATION = "SUSPECTED_MANIPULATION"

class FindingStatus(str, enum.Enum):
    NO_ISSUE = "NO_ISSUE"
    POTENTIAL_INCONSISTENCY = "POTENTIAL_INCONSISTENCY"
    FURTHER_VERIFICATION_REQUIRED = "FURTHER_VERIFICATION_REQUIRED"
    UNABLE_TO_VERIFY = "UNABLE_TO_VERIFY"

class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    triggered_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="COMPLETED", nullable=False)
    ai_provider = Column(String(100), default="GEMINI_FLASH", nullable=False)
    risk_level = Column(String(50), default="LOW", nullable=False) # LOW, MEDIUM, HIGH
    risk_score = Column(Float, default=0.1, nullable=False) # 0.0 - 1.0
    summary = Column(Text, nullable=True)
    is_demo_simulated = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="verification_runs")
    triggered_by = relationship("User")
    extracted_fields = relationship("ExtractedField", back_populates="verification_run", cascade="all, delete-orphan")
    findings = relationship("VerificationFinding", back_populates="verification_run", cascade="all, delete-orphan")
    compliance_evaluations = relationship("ComplianceEvaluation", back_populates="verification_run", cascade="all, delete-orphan")

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    verification_run_id = Column(String(36), ForeignKey("verification_runs.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    field_name = Column(String(100), nullable=False)
    extracted_value = Column(Text, nullable=True)
    expected_value = Column(Text, nullable=True)
    confidence = Column(Float, default=0.95, nullable=False)
    source_page = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default=FieldMatchStatus.MATCHED.value, nullable=False)
    explanation = Column(Text, nullable=True)

    verification_run = relationship("VerificationRun", back_populates="extracted_fields")
    document = relationship("Document", back_populates="extracted_fields")

class VerificationFinding(Base):
    __tablename__ = "verification_findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    verification_run_id = Column(String(36), ForeignKey("verification_runs.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(50), default=FindingCategory.DATA_CONSISTENCY.value, nullable=False)
    status = Column(String(50), default=FindingStatus.NO_ISSUE.value, nullable=False)
    severity = Column(String(50), default=FindingSeverity.LOW.value, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    reviewer_action = Column(Text, nullable=True)

    verification_run = relationship("VerificationRun", back_populates="findings")
    document = relationship("Document", back_populates="findings")
