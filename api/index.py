import sys
import os

# Add root and backend directory to sys.path so modules can import correctly
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Ensure serverless environment flag
os.environ.setdefault("VERCEL", "1")

from app.main import app
from app.db.init_db import init_db

# Ensure schemas and seeds are ready on serverless cold starts
try:
    init_db()
except Exception as exc:
    print(f"[Vercel Init Warning]: {exc}")
