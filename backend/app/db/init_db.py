from app.db.session import engine, Base, SessionLocal
import app.models # noqa: F401
from app.db.seed_data import seed_database

def init_db():
    print("Creating database schema tables...")
    Base.metadata.create_all(bind=engine)
    print("Schema tables created successfully.")

    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
