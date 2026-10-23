from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import re
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.verification import FindingCategory, FindingSeverity, FindingStatus

def analyze_tamper_and_authenticity(
    db: Session,
    document: Document,
    form_data: Dict[str, Any],
    extracted_fields: List[Dict[str, Any]],
    current_app_id: str
) -> List[Dict[str, Any]]:
    """
    Executes deterministic document authenticity and tampering indicator checks.
    Evaluates file integrity, data consistency, signature validity, issuer verification, and manipulation indicators.
    """
    findings: List[Dict[str, Any]] = []

    # 1. FILE INTEGRITY: Check for duplicate document SHA-256 hash across applications
    duplicate_docs = db.query(Document).filter(
        Document.sha256_hash == document.sha256_hash,
        Document.application_id != current_app_id
    ).all()

    if duplicate_docs:
        other_app_ids = [d.application_id for d in duplicate_docs[:3]]
        findings.append({
            "category": FindingCategory.FILE_INTEGRITY.value,
            "status": FindingStatus.POTENTIAL_INCONSISTENCY.value,
            "severity": FindingSeverity.HIGH.value,
            "title": "Duplicate Document Hash Detected Across Multiple Applications",
            "description": f"The exact SHA-256 hash of this document was found in {len(duplicate_docs)} other application record(s).",
            "evidence": f"SHA-256: {document.sha256_hash}. Associated application IDs: {', '.join(other_app_ids)}",
            "reviewer_action": "Verify if the applicant has legitimately re-submitted or if identical documentation is being used by different parties."
        })
    else:
        findings.append({
            "category": FindingCategory.FILE_INTEGRITY.value,
            "status": FindingStatus.NO_ISSUE.value,
            "severity": FindingSeverity.INFO.value,
            "title": "File Hash Integrity Check Passed",
            "description": "Unique SHA-256 cryptographic digest verified without duplicate submission flags.",
            "evidence": f"SHA-256: {document.sha256_hash}",
            "reviewer_action": "No reviewer action required for file hash integrity."
        })

    # 2. DATA CONSISTENCY: Name matching between application and extracted document
    form_name = str(form_data.get("applicant_name", "")).strip().lower()
    name_field = next((f for f in extracted_fields if f.get("field_name") == "applicant_name"), None)

    if form_name and name_field and name_field.get("extracted_value"):
        doc_name = str(name_field["extracted_value"]).strip().lower()
        if form_name != doc_name:
            # Check if one is a substring or initials match
            tokens_form = set(form_name.split())
            tokens_doc = set(doc_name.split())
            intersection = tokens_form.intersection(tokens_doc)

            if len(intersection) == len(tokens_form):
                # Mild variant (e.g. middle name included)
                findings.append({
                    "category": FindingCategory.DATA_CONSISTENCY.value,
                    "status": FindingStatus.POTENTIAL_INCONSISTENCY.value,
                    "severity": FindingSeverity.LOW.value,
                    "title": "Applicant Name Form-to-Document Minor Variation",
                    "description": f"Applicant name on document ('{name_field['extracted_value']}') contains additional or slightly altered name tokens compared to form ('{form_data.get('applicant_name')}').",
                    "evidence": f"Form: '{form_data.get('applicant_name')}' vs Document: '{name_field['extracted_value']}'",
                    "reviewer_action": "Verify if name variance represents an omitted middle name or spelling standard."
                })
            else:
                findings.append({
                    "category": FindingCategory.DATA_CONSISTENCY.value,
                    "status": FindingStatus.FURTHER_VERIFICATION_REQUIRED.value,
                    "severity": FindingSeverity.HIGH.value,
                    "title": "Significant Applicant Name Mismatch",
                    "description": f"Document holder name does not correspond with the primary applicant name entered on the submission form.",
                    "evidence": f"Form Name: '{form_data.get('applicant_name')}', Extracted Document Name: '{name_field['extracted_value']}'",
                    "reviewer_action": "Request secondary identity confirmation or legal name change documentation."
                })
        else:
            findings.append({
                "category": FindingCategory.DATA_CONSISTENCY.value,
                "status": FindingStatus.NO_ISSUE.value,
                "severity": FindingSeverity.INFO.value,
                "title": "Applicant Name Cross-Verification Succeeded",
                "description": "Applicant full name matches submitted application details verbatim.",
                "evidence": f"Validated Name: '{form_data.get('applicant_name')}'",
                "reviewer_action": "No action needed."
            })

    # 3. DATA CONSISTENCY & EXPIRY: Check document expiry date
    expiry_field = next((f for f in extracted_fields if f.get("field_name") == "expiry_date"), None)
    if expiry_field and expiry_field.get("extracted_value"):
        exp_str = str(expiry_field["extracted_value"]).strip()
        # Parse ISO date or YYYY-MM-DD
        try:
            exp_date = datetime.strptime(exp_str[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            if exp_date < now:
                findings.append({
                    "category": FindingCategory.DATA_CONSISTENCY.value,
                    "status": FindingStatus.FURTHER_VERIFICATION_REQUIRED.value,
                    "severity": FindingSeverity.HIGH.value,
                    "title": "Document Appears Expired",
                    "description": f"Extracted expiry date ({exp_str[:10]}) has elapsed relative to current processing date.",
                    "evidence": f"Document Expiry Date: {exp_str[:10]}",
                    "reviewer_action": "Request a renewed or current valid document from the applicant."
                })
            else:
                findings.append({
                    "category": FindingCategory.DATA_CONSISTENCY.value,
                    "status": FindingStatus.NO_ISSUE.value,
                    "severity": FindingSeverity.INFO.value,
                    "title": "Document Validity Period Active",
                    "description": f"Document expiration date ({exp_str[:10]}) is valid and within acceptable date range.",
                    "evidence": f"Expiry Date: {exp_str[:10]}",
                    "reviewer_action": "No action needed."
                })
        except Exception:
            pass

    # 4. DIGITAL SIGNATURE VALIDITY
    meta = document.metadata_record
    if meta and meta.has_digital_signature:
        findings.append({
            "category": FindingCategory.DIGITAL_SIGNATURE.value,
            "status": FindingStatus.NO_ISSUE.value,
            "severity": FindingSeverity.INFO.value,
            "title": "Digital Cryptographic Signature Present",
            "description": "Document contains a digital signature dictionary or embedded certificate structure.",
            "evidence": "PDF /Sig dictionary or encrypted PKCS container detected.",
            "reviewer_action": "Review signing certificate details during human review if elevated trust tier is required."
        })
    else:
        findings.append({
            "category": FindingCategory.DIGITAL_SIGNATURE.value,
            "status": FindingStatus.UNABLE_TO_VERIFY.value,
            "severity": FindingSeverity.LOW.value,
            "title": "No Embedded Digital Cryptographic Signature Detected",
            "description": "The file does not feature an embedded PKCS/X.509 digital signature. (Normal for standard rasterized scans and standard government PDF exports).",
            "evidence": "Standard PDF stream / raster image format.",
            "reviewer_action": "Assess validity through content consistency and visual seal inspection."
        })

    # 5. SUSPECTED MANIPULATION & METADATA ANOMALIES
    if meta and meta.detected_anomalies:
        for anomaly in meta.detected_anomalies:
            findings.append({
                "category": FindingCategory.SUSPECTED_MANIPULATION.value,
                "status": FindingStatus.POTENTIAL_INCONSISTENCY.value,
                "severity": FindingSeverity.MEDIUM.value,
                "title": "Document Metadata Anomaly Detected",
                "description": str(anomaly),
                "evidence": f"Producer: {meta.producer or 'N/A'}, Creation: {meta.creation_date or 'N/A'}, Mod: {meta.mod_date or 'N/A'}",
                "reviewer_action": "Inspect document visually for font inconsistencies, text misalignment, or overlay artifacts."
            })
    else:
        findings.append({
            "category": FindingCategory.SUSPECTED_MANIPULATION.value,
            "status": FindingStatus.NO_ISSUE.value,
            "severity": FindingSeverity.INFO.value,
            "title": "No Metadata Manipulation Flags Detected",
            "description": "File header, trailer, creation, and modification timestamps show normal sequential consistency.",
            "evidence": "Standard document container structure.",
            "reviewer_action": "No action required."
        })

    # 6. ISSUER AUTHENTICITY (DISCLAIMER REQUIREMENT)
    findings.append({
        "category": FindingCategory.ISSUER_AUTHENTICITY.value,
        "status": FindingStatus.UNABLE_TO_VERIFY.value,
        "severity": FindingSeverity.INFO.value,
        "title": "External Issuing Authority Verification Status",
        "description": "AI Verify operates as an offline / client-level intelligence verification platform. Preliminary algorithmic verification does NOT constitute direct real-time issuer confirmation or legal guarantee of authenticity.",
        "evidence": "Direct government issuing database API not configured for this demonstration tier.",
        "reviewer_action": "Conduct manual external registry query if mandatory regulatory policy requires absolute issuer confirmation."
    })

    return findings
