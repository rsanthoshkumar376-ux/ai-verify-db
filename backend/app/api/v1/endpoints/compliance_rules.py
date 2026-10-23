from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User, UserRole
from app.models.compliance import ComplianceRule
from app.schemas.all_schemas import ComplianceRuleCreate, ComplianceRuleUpdate, ComplianceRuleOut
from app.services.notification_service import record_audit_event

router = APIRouter()

@router.get("/", response_model=List[ComplianceRuleOut])
def list_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ComplianceRule).order_by(ComplianceRule.rule_code.asc()).all()

@router.post("/", response_model=ComplianceRuleOut, status_code=status.HTTP_201_CREATED)
def create_rule(
    request: ComplianceRuleCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    existing = db.query(ComplianceRule).filter(ComplianceRule.rule_code == request.rule_code.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rule with code '{request.rule_code}' already exists."
        )

    rule = ComplianceRule(
        rule_code=request.rule_code.strip(),
        name=request.name.strip(),
        description=request.description.strip(),
        jurisdiction=request.jurisdiction.strip(),
        application_category=request.application_category.strip(),
        document_type=request.document_type.strip(),
        rule_source=request.rule_source.strip(),
        version=request.version.strip(),
        effective_date=datetime.now(timezone.utc),
        severity=request.severity.value,
        validation_logic=request.validation_logic,
        required_evidence=request.required_evidence,
        is_enabled=request.is_enabled,
        is_demo_rule=request.is_demo_rule,
        last_reviewed_by=request.last_reviewed_by or admin_user.full_name,
        last_reviewed_date=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc)
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    record_audit_event(
        db=db,
        user_id=admin_user.id,
        action="COMPLIANCE_RULE_CREATED",
        resource_type="COMPLIANCE_RULE",
        resource_id=rule.id,
        details={"code": rule.rule_code, "name": rule.name}
    )

    return rule

@router.put("/{id}", response_model=ComplianceRuleOut)
def update_rule(
    id: str,
    request: ComplianceRuleUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    rule = db.query(ComplianceRule).filter(ComplianceRule.id == id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found.")

    if request.name:
        rule.name = request.name.strip()
    if request.description:
        rule.description = request.description.strip()
    if request.severity:
        rule.severity = request.severity.value
    if request.validation_logic is not None:
        rule.validation_logic = request.validation_logic
    if request.required_evidence is not None:
        rule.required_evidence = request.required_evidence
    if request.is_enabled is not None:
        rule.is_enabled = request.is_enabled

    rule.last_reviewed_by = admin_user.full_name
    rule.last_reviewed_date = datetime.now(timezone.utc)
    db.commit()

    record_audit_event(
        db=db,
        user_id=admin_user.id,
        action="COMPLIANCE_RULE_UPDATED",
        resource_type="COMPLIANCE_RULE",
        resource_id=rule.id,
        details={"code": rule.rule_code}
    )

    return rule

@router.post("/{id}/toggle", response_model=ComplianceRuleOut)
def toggle_rule(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    rule = db.query(ComplianceRule).filter(ComplianceRule.id == id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found.")

    rule.is_enabled = not rule.is_enabled
    db.commit()

    record_audit_event(
        db=db,
        user_id=admin_user.id,
        action="COMPLIANCE_RULE_TOGGLED",
        resource_type="COMPLIANCE_RULE",
        resource_id=rule.id,
        details={"code": rule.rule_code, "is_enabled": rule.is_enabled}
    )

    return rule
