import os
import uuid
import hashlib
from typing import Tuple, Dict, Any
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

# Recognized magic byte signatures
MAGIC_NUMBERS = {
    b"%PDF-": "application/pdf",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
}

def validate_file_signature(header_bytes: bytes) -> str:
    """
    Validates the real file format using magic byte inspection,
    ensuring uploaded content cannot masquerade under a fake extension.
    """
    for magic, mime in MAGIC_NUMBERS.items():
        if header_bytes.startswith(magic):
            return mime
    # Check for EXIF JPEG which might start with FF D8 FF
    if len(header_bytes) >= 3 and header_bytes[0:2] == b"\xff\xd8":
        return "image/jpeg"
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported file signature. Uploaded file must be a valid PDF, PNG, or JPEG file."
    )

def calculate_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

def sanitize_filename(filename: str) -> str:
    """Removes unsafe characters and path traversal tokens."""
    clean = os.path.basename(filename)
    clean = "".join(c for c in clean if c.isalnum() or c in "._- ")
    return clean or "document"

async def save_uploaded_file(file: UploadFile) -> Tuple[str, str, int, str, str]:
    """
    Saves an uploaded file to private storage.
    Returns (stored_filename, relative_file_path, file_size, mime_type, sha256_hash).
    """
    content = await file.read()
    file_size = len(content)

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    if file_size < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty or corrupted."
        )

    # Magic byte verification
    header = content[:16]
    detected_mime = validate_file_signature(header)

    # Calculate SHA-256 for file integrity and duplicate checking
    sha256_hash = calculate_sha256(content)

    # Generate randomized UUID-based storage name to prevent collisions and directory traversal
    ext = ".pdf" if "pdf" in detected_mime else (".png" if "png" in detected_mime else ".jpg")
    stored_filename = f"{uuid.uuid4().hex}{ext}"
    
    # Store in private storage directory
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    full_path = os.path.join(settings.STORAGE_DIR, stored_filename)

    with open(full_path, "wb") as f:
        f.write(content)

    return stored_filename, full_path, file_size, detected_mime, sha256_hash
