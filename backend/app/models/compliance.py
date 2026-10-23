from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base
import enum

class RuleSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class EvaluationOutcome(str, enum.Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    WARNING = "WARNING"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    UNABLE_TO_EVALUATE = "UNABLE_TO_EVALUATE"

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "CR-ID-01"
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    jurisdiction = Column(String(100), default="UNIVERSAL", nullable=False) # e.g. "US-FEDERAL", "EU-REG", "UNIVERSAL"
    application_category = Column(String(100), default="ALL", nullable=False) # category code or "ALL"
    document_type = Column(String(100), default="ALL", nullable=False)
    rule_source = Column(String(255), nullable=False) # e.g. "Demo Standard Reference 2026.1"
    version = Column(String(20), default="1.0.0", nullable=False)
    effective_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    review_date = Column(DateTime, nullable=True)
    severity = Column(String(50), default=RuleSeverity.ERROR.value, nullable=False)
    validation_logic = Column(JSON, default=dict, nullable=False) # e.g. {"type": "date_not_expired", "field": "expiry_date"}
    required_evidence = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True, nullable=False)
    is_demo_rule = Column(Boolean, default=True, nullable=False) # Labeled "Demonstration Rule — Not Legal Advice"
    last_reviewed_by = Column(String(255), default="System Compliance Architect", nullable=False)
    last_reviewed_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    evaluations = relationship("ComplianceEvaluation", back_populates="rule")

class ComplianceEvaluation(Base):
    __tablename__ = "compliance_evaluations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    verification_run_id = Column(String(36), ForeignKey("verification_runs.id", ondelete="CASCADE"), nullable=False)
    rule_id = Column(String(36), ForeignKey("compliance_rules.id", ondelete="CASCADE"), nullable=False)
    rule_version = Column(String(20), nullable=False)
    outcome = Column(String(50), default=EvaluationOutcome.PASSED.value, nullable=False)
    score = Column(Float, default=1.0, nullable=False) # 1.0 = pass, 0.0 = fail
    message = Column(Text, nullable=False)
    evidence_details = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    verification_run = relationship("VerificationRun", back_populates="compliance_evaluations")
    rule = relationship("ComplianceRule", back_populates="evaluations")
