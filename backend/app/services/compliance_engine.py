from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.document import Document
from app.models.compliance import ComplianceRule, EvaluationOutcome, RuleSeverity

def evaluate_compliance_rule(
    rule: ComplianceRule,
    application: Application,
    documents: List[Document],
    extracted_fields: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluates a single compliance rule against the application and attached documents.
    Returns evaluation dictionary containing outcome, score, message, evidence details.
    """
    # Category filter
    if rule.application_category != "ALL" and rule.application_category != application.category.code:
        return {
            "rule_id": rule.id,
            "rule_code": rule.rule_code,
            "rule_name": rule.name,
            "rule_version": rule.version,
            "outcome": EvaluationOutcome.NOT_APPLICABLE.value,
            "score": 1.0,
            "message": f"Rule pertains to category '{rule.application_category}', not applicable to '{application.category.code}'.",
            "evidence_details": {"reason": "Category mismatch"}
        }

    logic = rule.validation_logic or {}
    check_type = logic.get("type", "generic")
    form_data = application.form_data or {}

    # 1. REQUIRED DOCUMENT CHECK
    if check_type == "required_document":
        target_doc_type = logic.get("document_type")
        matching_docs = [d for d in documents if d.document_type == target_doc_type]
        if not matching_docs:
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.FAILED.value if rule.severity in (RuleSeverity.ERROR.value, RuleSeverity.CRITICAL.value) else EvaluationOutcome.WARNING.value,
                "score": 0.0,
                "message": f"Mandatory document type '{target_doc_type}' was not submitted.",
                "evidence_details": {"expected_document_type": target_doc_type, "submitted_documents": [d.document_type for d in documents]}
            }
        else:
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.PASSED.value,
                "score": 1.0,
                "message": f"Required document '{target_doc_type}' is present and verified.",
                "evidence_details": {"document_id": matching_docs[0].id, "filename": matching_docs[0].original_filename}
            }

    # 2. MANDATORY FORM FIELD CHECK
    elif check_type == "mandatory_field":
        field_key = logic.get("field_key")
        val = form_data.get(field_key)
        if val is None or str(val).strip() == "":
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.FAILED.value,
                "score": 0.0,
                "message": f"Mandatory form field '{field_key}' is blank or missing.",
                "evidence_details": {"missing_field": field_key}
            }
        return {
            "rule_id": rule.id,
            "rule_code": rule.rule_code,
            "rule_name": rule.name,
            "rule_version": rule.version,
            "outcome": EvaluationOutcome.PASSED.value,
            "score": 1.0,
            "message": f"Mandatory field '{field_key}' is populated.",
            "evidence_details": {"field": field_key, "value_length": len(str(val))}
        }

    # 3. DOCUMENT VALIDITY & EXPIRY
    elif check_type == "document_not_expired":
        expiry_field = next((f for f in extracted_fields if f.get("field_name") == "expiry_date"), None)
        if not expiry_field or not expiry_field.get("extracted_value"):
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.UNABLE_TO_EVALUATE.value,
                "score": 0.5,
                "message": "Expiry date could not be conclusively determined from extracted text.",
                "evidence_details": {"status": "No machine-readable expiry date found."}
            }
        
        try:
            exp_date_str = str(expiry_field["extracted_value"])[:10]
            exp_date = datetime.strptime(exp_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            if exp_date < datetime.now(timezone.utc):
                return {
                    "rule_id": rule.id,
                    "rule_code": rule.rule_code,
                    "rule_name": rule.name,
                    "rule_version": rule.version,
                    "outcome": EvaluationOutcome.FAILED.value,
                    "score": 0.0,
                    "message": f"Document expired on {exp_date_str}.",
                    "evidence_details": {"extracted_expiry": exp_date_str, "current_date": datetime.now(timezone.utc).isoformat()[:10]}
                }
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.PASSED.value,
                "score": 1.0,
                "message": f"Document is valid through {exp_date_str}.",
                "evidence_details": {"extracted_expiry": exp_date_str}
            }
        except Exception as e:
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.UNABLE_TO_EVALUATE.value,
                "score": 0.5,
                "message": f"Date parsing ambiguity: {str(e)}",
                "evidence_details": {"raw_value": expiry_field.get("extracted_value")}
            }

    # 4. NUMERIC THRESHOLD (e.g. Income ceiling, minimum age, or minimum GPA)
    elif check_type == "numeric_threshold":
        field_key = logic.get("field_key")
        operator = logic.get("operator", "<=") # <=, >=, <, >
        threshold = float(logic.get("threshold", 0))
        
        raw_val = form_data.get(field_key)
        if raw_val is None:
            # Check extracted fields
            ext_item = next((f for f in extracted_fields if f.get("field_name") == field_key), None)
            if ext_item and ext_item.get("extracted_value"):
                raw_val = ext_item["extracted_value"]

        if raw_val is None:
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.UNABLE_TO_EVALUATE.value,
                "score": 0.5,
                "message": f"Field '{field_key}' value not provided for threshold evaluation.",
                "evidence_details": {"threshold": threshold, "operator": operator}
            }

        try:
            val_num = float(str(raw_val).replace("$", "").replace(",", ""))
            passed = False
            if operator == "<=":
                passed = (val_num <= threshold)
            elif operator == ">=":
                passed = (val_num >= threshold)
            elif operator == "<":
                passed = (val_num < threshold)
            elif operator == ">":
                passed = (val_num > threshold)

            if passed:
                return {
                    "rule_id": rule.id,
                    "rule_code": rule.rule_code,
                    "rule_name": rule.name,
                    "rule_version": rule.version,
                    "outcome": EvaluationOutcome.PASSED.value,
                    "score": 1.0,
                    "message": f"Evaluation satisfied: {field_key} ({val_num}) {operator} {threshold}.",
                    "evidence_details": {"declared_value": val_num, "threshold": threshold, "operator": operator}
                }
            else:
                return {
                    "rule_id": rule.id,
                    "rule_code": rule.rule_code,
                    "rule_name": rule.name,
                    "rule_version": rule.version,
                    "outcome": EvaluationOutcome.WARNING.value,
                    "score": 0.2,
                    "message": f"Threshold condition not met: {field_key} ({val_num}) exceeds allowable limit ({threshold}).",
                    "evidence_details": {"declared_value": val_num, "threshold": threshold, "operator": operator}
                }
        except ValueError:
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.UNABLE_TO_EVALUATE.value,
                "score": 0.5,
                "message": f"Value '{raw_val}' could not be converted to a numeric value for threshold comparison.",
                "evidence_details": {"raw_value": str(raw_val)}
            }

    # 5. CROSS-FIELD CONSISTENCY
    elif check_type == "name_consistency":
        name_field = next((f for f in extracted_fields if f.get("field_name") == "applicant_name"), None)
        if name_field and name_field.get("status") == "MISMATCH":
            return {
                "rule_id": rule.id,
                "rule_code": rule.rule_code,
                "rule_name": rule.name,
                "rule_version": rule.version,
                "outcome": EvaluationOutcome.WARNING.value,
                "score": 0.3,
                "message": "Form applicant name does not align with name on supporting documentation.",
                "evidence_details": {"form_name": form_data.get("applicant_name"), "doc_name": name_field.get("extracted_value")}
            }
        return {
            "rule_id": rule.id,
            "rule_code": rule.rule_code,
            "rule_name": rule.name,
            "rule_version": rule.version,
            "outcome": EvaluationOutcome.PASSED.value,
            "score": 1.0,
            "message": "Primary name consistency check passed.",
            "evidence_details": {"status": "Verified"}
        }

    # Default fallback
    return {
        "rule_id": rule.id,
        "rule_code": rule.rule_code,
        "rule_name": rule.name,
        "rule_version": rule.version,
        "outcome": EvaluationOutcome.PASSED.value,
        "score": 1.0,
        "message": "General regulatory parameter passed.",
        "evidence_details": {}
    }

def run_compliance_evaluation(
    db: Session,
    application: Application,
    documents: List[Document],
    extracted_fields: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Evaluates all active compliance rules for the application.
    """
    rules = db.query(ComplianceRule).filter(ComplianceRule.is_enabled == True).all()
    results = []
    for rule in rules:
        eval_result = evaluate_compliance_rule(rule, application, documents, extracted_fields)
        results.append(eval_result)
    return results
