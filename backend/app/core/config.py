import os
from pydantic_settings import BaseSettings
from typing import List

is_serverless = os.getenv("VERCEL", "") == "1" or "AWS_LAMBDA_FUNCTION_NAME" in os.environ

def _get_database_url() -> str:
    raw = os.getenv("DATABASE_URL", f"sqlite:///{'/tmp/ai_verify.db' if is_serverless else './ai_verify.db'}")
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql://", 1)
    return raw

def _get_storage_dir() -> str:
    return os.getenv("STORAGE_DIR", "/tmp/storage_data" if is_serverless else "./storage_data")

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Verify — Intelligent Application & Compliance Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ai-verify-super-secure-production-ready-jwt-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = _get_database_url()
    
    # Private storage directory for uploaded documents
    STORAGE_DIR: str = _get_storage_dir()
    MAX_FILE_SIZE_MB: int = 15
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg"
    ]
    
    # AI & Demo Mode
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Ensure storage directory exists safely
try:
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.STORAGE_DIR, "reports"), exist_ok=True)
except Exception:
    pass
