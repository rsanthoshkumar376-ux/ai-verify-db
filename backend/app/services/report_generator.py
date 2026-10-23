import os
import uuid
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from app.core.config import settings
from app.models.application import Application
from app.models.verification import VerificationRun

def generate_pdf_report(
    application: Application,
    verification_run: VerificationRun,
    report_code: str
) -> str:
    """
    Generates a professional enterprise compliance verification PDF report using ReportLab.
    Saves to the private storage reports directory and returns the absolute file path.
    """
    reports_dir = os.path.join(settings.STORAGE_DIR, "reports")
    os.makedirs(reports_dir, exist_ok=True)
    pdf_filename = f"{report_code}.pdf"
    file_path = os.path.join(reports_dir, pdf_filename)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a')
    )

    badge_style = ParagraphStyle(
        'BadgeStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1e40af'),
        alignment=TA_CENTER
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=12,
        spaceAfter=6
    )

    normal_text = ParagraphStyle(
        'NormalText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748b')
    )

    elements = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>AI VERIFY</b><br/><font size=9 color='#64748b'>Enterprise Application & Compliance Verification Platform</font>", header_title_style),
            Paragraph(f"<b>REPORT ID:</b> {report_code}<br/><b>APP REF:</b> {application.reference_no}<br/><b>DATE:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", ParagraphStyle('Meta', parent=normal_text, alignment=TA_RIGHT))
        ]
    ]
    t_header = Table(header_data, colWidths=[340, 200])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8)
    ]))
    elements.append(t_header)

    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#cbd5e1'), spaceBefore=4, spaceAfter=10))

    # Preliminary Banner
    status_label = "AI-ASSISTED PRELIMINARY ASSESSMENT — SUBJECT TO HUMAN REVIEW" if application.status != "VERIFIED" else "COMPLIANCE VERIFICATION SUMMARY REPORT"
    banner_bg = colors.HexColor('#eff6ff') if application.status != "VERIFIED" else colors.HexColor('#f0fdf4')
    banner_border = colors.HexColor('#bfdbfe') if application.status != "VERIFIED" else colors.HexColor('#bbf7d0')

    banner_data = [[Paragraph(f"<b>{status_label}</b>", badge_style)]]
    t_banner = Table(banner_data, colWidths=[540])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), banner_bg),
        ('BOX', (0,0), (-1,-1), 1, banner_border),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_banner)
    elements.append(Spacer(1, 10))

    # 2. Application Summary Table
    elements.append(Paragraph("Application & Submission Details", section_heading))
    app_info = [
        [Paragraph("<b>Application Title:</b>", normal_text), Paragraph(application.title, normal_text), Paragraph("<b>Current Status:</b>", normal_text), Paragraph(f"<b>{application.status}</b>", normal_text)],
        [Paragraph("<b>Category:</b>", normal_text), Paragraph(application.category.name if application.category else "General", normal_text), Paragraph("<b>Risk Tier:</b>", normal_text), Paragraph(f"<b>{application.current_risk_score}</b>", normal_text)],
        [Paragraph("<b>Applicant ID:</b>", normal_text), Paragraph(application.applicant.full_name if application.applicant else "N/A", normal_text), Paragraph("<b>Submission Date:</b>", normal_text), Paragraph(application.created_at.strftime('%Y-%m-%d %H:%M UTC'), normal_text)],
    ]
    t_app = Table(app_info, colWidths=[110, 160, 110, 160])
    t_app.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_app)
    elements.append(Spacer(1, 10))

    # 3. Document Extraction & Field Cross-Comparison
    elements.append(Paragraph("AI Document Field Extraction & Consistency Comparison", section_heading))
    field_rows = [["Field Name", "Application Form", "Extracted Document", "Confidence", "Status"]]
    for f in (verification_run.extracted_fields or []):
        field_rows.append([
            Paragraph(f.field_name.replace('_', ' ').title(), normal_text),
            Paragraph(f.expected_value or "—", normal_text),
            Paragraph(f.extracted_value or "—", normal_text),
            Paragraph(f"{int(f.confidence * 100)}%", normal_text),
            Paragraph(f"<b>{f.status}</b>", normal_text)
        ])
    if len(field_rows) == 1:
        field_rows.append([Paragraph("No field extractions recorded.", normal_text), "", "", "", ""])

    t_fields = Table(field_rows, colWidths=[120, 130, 150, 70, 70])
    t_fields.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,1), (-1,-1), 4),
        ('BOTTOMPADDING', (0,1), (-1,-1), 4),
    ]))
    elements.append(t_fields)
    elements.append(Spacer(1, 10))

    # 4. Compliance Rules Results
    elements.append(Paragraph("Regulatory & Institutional Compliance Rule Evaluation", section_heading))
    rule_rows = [["Rule Code", "Rule Description", "Version", "Outcome"]]
    for ce in (verification_run.compliance_evaluations or []):
        r_code = ce.rule.rule_code if ce.rule else "CR-DEMO"
        r_name = ce.rule.name if ce.rule else "Compliance Parameter"
        rule_rows.append([
            Paragraph(f"<b>{r_code}</b>", normal_text),
            Paragraph(f"{r_name}<br/><font size=7 color='#64748b'>{ce.message}</font>", normal_text),
            Paragraph(ce.rule_version, normal_text),
            Paragraph(f"<b>{ce.outcome}</b>", normal_text)
        ])
    if len(rule_rows) == 1:
        rule_rows.append([Paragraph("No compliance evaluations executed.", normal_text), "", "", ""])

    t_rules = Table(rule_rows, colWidths=[90, 310, 60, 80])
    t_rules.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,1), (-1,-1), 4),
        ('BOTTOMPADDING', (0,1), (-1,-1), 4),
    ]))
    elements.append(t_rules)
    elements.append(Spacer(1, 12))

    # 5. Reviewer Decisions
    if application.review_decisions:
        elements.append(Paragraph("Authorized Compliance Review Decision", section_heading))
        dec = application.review_decisions[-1]
        dec_info = [
            [Paragraph("<b>Decision:</b>", normal_text), Paragraph(f"<b>{dec.decision}</b>", normal_text), Paragraph("<b>Recorded At:</b>", normal_text), Paragraph(dec.created_at.strftime('%Y-%m-%d %H:%M UTC'), normal_text)],
            [Paragraph("<b>Reason:</b>", normal_text), Paragraph(dec.reason, normal_text), Paragraph("<b>Reviewer:</b>", normal_text), Paragraph(dec.reviewer.full_name if dec.reviewer else "Compliance Officer", normal_text)],
            [Paragraph("<b>Detailed Notes:</b>", normal_text), Paragraph(dec.explanation, normal_text), "", ""]
        ]
        t_dec = Table(dec_info, colWidths=[100, 170, 100, 170])
        t_dec.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('SPAN', (1,2), (3,2)),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        elements.append(t_dec)
        elements.append(Spacer(1, 10))

    # 6. Legal Disclaimer & Limitations
    elements.append(Paragraph("Regulatory Notice & Verification Limitations", section_heading))
    disclaimer_p = (
        "<b>LEGAL NOTICE & LIMITATION OF LIABILITY:</b> This document represents an automated, algorithmic "
        "preliminary verification assessment generated by AI Verify for workflow acceleration and evidentiary assistance. "
        "This preliminary report does not constitute a legal determination, official government certification, or "
        "unconditional guarantee of authenticity. Rule sets labeled 'Demonstration Rule' are illustrative. Final verification "
        "and adverse decisions remain the sole responsibility of authorized human compliance officers in accordance with "
        "applicable sector regulations."
    )
    elements.append(Paragraph(disclaimer_p, disclaimer_style))

    # Build the document
    doc.build(elements)
    return file_path
