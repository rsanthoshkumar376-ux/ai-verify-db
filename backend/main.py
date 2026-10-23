import sys
import os
import traceback

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import_error_trace = None

try:
    from app.main import app as real_app
    app = real_app
except Exception as exc:
    import_error_trace = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import PlainTextResponse
    
    app = FastAPI(title="Diagnostic App")
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
    async def error_reporter(path: str):
        return PlainTextResponse(
            f"=== FASTAPI COLD START IMPORT EXCEPTION ===\n\n{import_error_trace}",
            status_code=500
        )
