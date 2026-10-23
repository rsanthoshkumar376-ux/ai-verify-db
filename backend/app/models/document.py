from sqlalchemy import Column, String, Integer, BigInteger, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base
import enum

class DocumentProcessingStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False) # e.g. ID_PROOF, TAX_RETURN, ENROLLMENT_LETTER
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=False)
    sha256_hash = Column(String(64), index=True, nullable=False)
    status = Column(String(50), default=DocumentProcessingStatus.PENDING.value, nullable=False)
    extracted_text = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="documents")
    uploader = relationship("User")
    metadata_record = relationship("DocumentMetadata", back_populates="document", uselist=False, cascade="all, delete-orphan")
    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    findings = relationship("VerificationFinding", back_populates="document", cascade="all, delete-orphan")

class DocumentMetadata(Base):
    __tablename__ = "document_metadata"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False)
    page_count = Column(Integer, default=1, nullable=False)
    author = Column(String(255), nullable=True)
    creator = Column(String(255), nullable=True)
    producer = Column(String(255), nullable=True)
    creation_date = Column(String(100), nullable=True)
    mod_date = Column(String(100), nullable=True)
    has_digital_signature = Column(Boolean, default=False, nullable=False)
    raw_metadata = Column(JSON, default=dict, nullable=False)
    detected_anomalies = Column(JSON, default=list, nullable=False) # e.g. modified date earlier than created date

    document = relationship("Document", back_populates="metadata_record")
