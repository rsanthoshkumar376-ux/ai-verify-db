import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Any

is_serverless = (
    os.getenv("VERCEL", "") == "1" 
    or "AWS_LAMBDA_FUNCTION_NAME" in os.environ
    or os.getenv("VERCEL_ENV") is not None
    or (os.path.exists("/tmp") and os.access("/tmp", os.W_OK))
)

def _get_database_url() -> str:
    raw = (os.getenv("DATABASE_URL") or "").strip()
    # Only use remote DB if it is a real connection string and not a placeholder like '<Your Neon PostgreSQL URL>'
    if (
        raw 
        and not raw.startswith("<") 
        and not raw.startswith("[") 
        and not raw.startswith("YOUR_") 
        and "example.com" not in raw.lower()
        and (raw.startswith("postgresql://") or raw.startswith("postgres://") or raw.startswith("sqlite://"))
    ):
        if raw.startswith("postgres://"):
            raw = raw.replace("postgres://", "postgresql+pg8000://", 1)
        elif raw.startswith("postgresql://") and "+pg8000" not in raw and "+psycopg" not in raw:
            raw = raw.replace("postgresql://", "postgresql+pg8000://", 1)
        return raw
    # Automatically use /tmp/ai_verify.db in serverless/container environments
    db_path = "/tmp/ai_verify.db" if is_serverless else "./ai_verify.db"
    return f"sqlite:///{db_path}"

def _get_storage_dir() -> str:
    custom = os.getenv("STORAGE_DIR")
    if custom:
        return custom
    return "/tmp/storage_data" if is_serverless else "./storage_data"

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Verify — Intelligent Application & Compliance Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ai-verify-super-secure-production-ready-jwt-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = _get_database_url()
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def sanitize_database_url(cls, v: Any) -> str:
        raw = str(v or "").strip()
        if (
            raw 
            and not raw.startswith("<") 
            and not raw.startswith("[") 
            and not raw.startswith("YOUR_") 
            and "example" not in raw.lower()
            and (raw.startswith("postgresql://") or raw.startswith("postgres://") or raw.startswith("sqlite://"))
        ):
            if raw.startswith("postgres://"):
                raw = raw.replace("postgres://", "postgresql+pg8000://", 1)
            elif raw.startswith("postgresql://") and "+pg8000" not in raw and "+psycopg" not in raw:
                raw = raw.replace("postgresql://", "postgresql+pg8000://", 1)
            return raw
        db_path = "/tmp/ai_verify.db" if is_serverless else "./ai_verify.db"
        return f"sqlite:///{db_path}"
    
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
