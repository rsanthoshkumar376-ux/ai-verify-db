import sys
import os

# Ensure backend directory is in sys.path so app module can be found
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.main import app

# Ensure schemas and seeds are ready on serverless cold starts
from app.db.init_db import init_db
try:
    init_db()
except Exception as exc:
    print(f"[Vercel Init Notice]: {exc}")
