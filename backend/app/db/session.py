import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("ai_verify.db")

db_url = settings.DATABASE_URL
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

try:
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        echo=False
    )
except Exception as e:
    logger.error(f"Failed to create engine with {db_url}: {e}. Falling back to SQLite.")
    engine = create_engine(
        "sqlite:////tmp/ai_verify.db",
        connect_args={"check_same_thread": False},
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
