import sys
import os
import traceback

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

real_app = None
init_error = None

try:
    from app.main import app as _loaded_app
    real_app = _loaded_app
except Exception as exc:
    init_error = traceback.format_exc()
    print("FATAL IMPORT EXCEPTION IN app.main:", file=sys.stderr)
    print(init_error, file=sys.stderr)

if real_app is not None:
    app = real_app
else:
    # Pure Python ASGI fallback with zero external dependencies
    async def app(scope, receive, send):
        if scope.get("type") == "http":
            body = (
                f"=== FASTAPI COLD START IMPORT EXCEPTION ===\n\n"
                f"{init_error}\n\n"
                f"Python: {sys.version}\n"
                f"sys.path: {sys.path}\n"
                f"cwd: {os.getcwd()}\n"
                f"files in cwd: {os.listdir('.')}\n"
            ).encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 500,
                "headers": [[b"content-type", b"text/plain; charset=utf-8"]],
            })
            await send({
                "type": "http.response.body",
                "body": body,
                "more_body": False,
            })
