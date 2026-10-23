from app.services.compliance_engine import evaluate_compliance_rule
from app.models.compliance import ComplianceRule, RuleSeverity, EvaluationOutcome
from app.models.application import Application, ApplicationCategory
from datetime import datetime, timezone

def test_compliance_rule_date_not_expired():
    rule = ComplianceRule(
        rule_code="CR-TEST-01",
        name="Validity Test Rule",
        description="Test",
        jurisdiction="UNIVERSAL",
        application_category="ALL",
        document_type="ID_PROOF",
        rule_source="Test Source",
        version="1.0.0",
        effective_date=datetime.now(timezone.utc),
        severity=RuleSeverity.CRITICAL.value,
        validation_logic={"type": "document_not_expired"},
        is_enabled=True,
        is_demo_rule=True
    )
    cat = ApplicationCategory(code="SCH-2026", name="Scholarship")
    app = Application(category=cat, form_data={})

    # Test with valid future date
    extracted_valid = [{"field_name": "expiry_date", "extracted_value": "2030-05-20"}]
    res = evaluate_compliance_rule(rule, app, [], extracted_valid)
    assert res["outcome"] == EvaluationOutcome.PASSED.value

    # Test with expired past date
    extracted_expired = [{"field_name": "expiry_date", "extracted_value": "2020-01-01"}]
    res_expired = evaluate_compliance_rule(rule, app, [], extracted_expired)
    assert res_expired["outcome"] == EvaluationOutcome.FAILED.value

def test_compliance_rule_numeric_threshold():
    rule = ComplianceRule(
        rule_code="CR-TEST-GPA",
        name="GPA Minimum",
        description="GPA test",
        jurisdiction="ACADEMIC",
        application_category="SCH-2026",
        document_type="TRANSCRIPT",
        rule_source="Test",
        version="1.0.0",
        effective_date=datetime.now(timezone.utc),
        severity=RuleSeverity.ERROR.value,
        validation_logic={"type": "numeric_threshold", "field_key": "declared_gpa", "operator": ">=", "threshold": 3.0},
        is_enabled=True,
        is_demo_rule=True
    )
    cat = ApplicationCategory(code="SCH-2026", name="Scholarship")
    app_pass = Application(category=cat, form_data={"declared_gpa": 3.5})
    res_pass = evaluate_compliance_rule(rule, app_pass, [], [])
    assert res_pass["outcome"] == EvaluationOutcome.PASSED.value

    app_fail = Application(category=cat, form_data={"declared_gpa": 2.7})
    res_fail = evaluate_compliance_rule(rule, app_fail, [], [])
    assert res_fail["outcome"] == EvaluationOutcome.WARNING.value
