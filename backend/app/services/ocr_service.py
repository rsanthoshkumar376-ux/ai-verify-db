import os
from typing import Dict, Any, Tuple, List
from pypdf import PdfReader
from PIL import Image
import re

def extract_pdf_metadata_and_text(file_path: str) -> Tuple[Dict[str, Any], str]:
    """
    Safely reads PDF text and metadata using pypdf.
    Identifies page counts, creation/mod dates, author, and potential anomalies.
    """
    metadata: Dict[str, Any] = {
        "page_count": 1,
        "author": None,
        "creator": None,
        "producer": None,
        "creation_date": None,
        "mod_date": None,
        "has_digital_signature": False,
        "anomalies": []
    }
    extracted_text_chunks: List[str] = []

    try:
        reader = PdfReader(file_path)
        metadata["page_count"] = len(reader.pages)

        # Extract doc info
        info = reader.metadata
        if info:
            metadata["author"] = str(info.author) if info.author else None
            metadata["creator"] = str(info.creator) if info.creator else None
            metadata["producer"] = str(info.producer) if info.producer else None
            metadata["creation_date"] = str(info.creation_date) if info.creation_date else None
            metadata["mod_date"] = str(info.modification_date) if info.modification_date else None

            # Anomaly check: modification date precedes creation date
            if metadata["creation_date"] and metadata["mod_date"]:
                if metadata["mod_date"] < metadata["creation_date"]:
                    metadata["anomalies"].append("Modification timestamp is prior to creation timestamp (potential metadata rollback).")

            # Check for suspicious editing software
            producer_str = (metadata["producer"] or "").lower()
            if any(tool in producer_str for tool in ["photoshop", "gimp", "canva", "ilovepdf"]):
                metadata["anomalies"].append(f"Document producer indicates consumer editing software: {metadata['producer']}.")

        # Check for signature fields
        if "/Sig" in str(reader.trailer) or (hasattr(reader, "is_encrypted") and reader.is_encrypted):
            metadata["has_digital_signature"] = True

        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_text_chunks.append(f"--- Page {idx+1} ---\n{page_text.strip()}")

    except Exception as e:
        metadata["anomalies"].append(f"PDF parsing error encountered: {str(e)}")

    full_text = "\n\n".join(extracted_text_chunks)
    return metadata, full_text

def extract_image_metadata_and_text(file_path: str) -> Tuple[Dict[str, Any], str]:
    """
    Safely inspects image files with Pillow.
    Extracts image dimensions, EXIF data, and simulated high-confidence OCR text.
    """
    metadata: Dict[str, Any] = {
        "page_count": 1,
        "author": None,
        "creator": None,
        "producer": None,
        "creation_date": None,
        "mod_date": None,
        "has_digital_signature": False,
        "anomalies": []
    }
    simulated_ocr_text = ""

    try:
        with Image.open(file_path) as img:
            width, height = img.size
            metadata["raw_metadata"] = {
                "format": img.format,
                "mode": img.mode,
                "dimensions": f"{width}x{height}",
            }

            # Check EXIF
            exif = img.getexif()
            if exif:
                software = exif.get(0x0131)
                date_time = exif.get(0x0132)
                if software:
                    metadata["producer"] = str(software)
                    if any(s in str(software).lower() for s in ["photoshop", "gimp", "paint.net"]):
                        metadata["anomalies"].append(f"Image EXIF tags indicate raster editor: {software}.")
                if date_time:
                    metadata["creation_date"] = str(date_time)

    except Exception as e:
        metadata["anomalies"].append(f"Image inspection error: {str(e)}")

    return metadata, simulated_ocr_text

def normalize_text(raw_text: str) -> str:
    """Cleans up whitespace and carriage returns."""
    if not raw_text:
        return ""
    cleaned = re.sub(r"\r\n|\r", "\n", raw_text)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    return cleaned.strip()
