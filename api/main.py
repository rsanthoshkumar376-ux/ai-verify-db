import os
import sys
import logging
from typing import Optional
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_verify_api_gateway")

# Retrieve the internal service binding URL injected by Vercel
# Vercel service binding format: { "type": "service", "service": "backend", "format": "url", "env": "BACKEND_URL" }
BACKEND_URL: Optional[str] = os.getenv("BACKEND_URL")

app = FastAPI(
    title="AI Verify API Gateway",
    description="Public Edge API Gateway forwarding requests to internal backend service via Vercel Service Bindings",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fallback: if BACKEND_URL is not provided (e.g. running monolithic/local), import backend directly
backend_app = None
if not BACKEND_URL:
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(current_dir)
        backend_dir = os.path.join(root_dir, "backend")
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        from app.main import app as imported_backend_app
        from app.db.init_db import init_db
        try:
            init_db()
        except Exception:
            pass
        backend_app = imported_backend_app
        logger.info("Local backend imported as fallback (no BACKEND_URL binding found)")
    except Exception as e:
        logger.warning(f"Could not load local backend fallback: {e}")

@app.get("/health")
@app.get("/api/health")
async def gateway_health():
    return {
        "status": "healthy",
        "service": "api-gateway",
        "backend_binding": "configured" if BACKEND_URL else "local-fallback",
        "backend_url": BACKEND_URL or "internal-import"
    }

# Forward all requests to the internal backend service
@app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def gateway_proxy(request: Request, full_path: str):
    # 1. If BACKEND_URL service binding is active (Vercel Services environment)
    if BACKEND_URL:
        target_base = BACKEND_URL.rstrip("/")
        path = request.url.path
        query = request.url.query
        
        target_url = f"{target_base}{path}"
        if query:
            target_url = f"{target_url}?{query}"
            
        headers = dict(request.headers)
        headers.pop("host", None)
        
        body = await request.body()
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                resp = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=headers,
                    content=body
                )
                
                # Exclude hop-by-hop headers
                excluded_headers = {"content-encoding", "transfer-encoding", "content-length", "connection"}
                response_headers = {
                    k: v for k, v in resp.headers.items() if k.lower() not in excluded_headers
                }
                
                return Response(
                    content=resp.content,
                    status_code=resp.status_code,
                    headers=response_headers,
                    media_type=resp.headers.get("content-type")
                )
            except Exception as exc:
                logger.error(f"Error proxying request to backend at {target_url}: {exc}")
                return JSONResponse(
                    status_code=502,
                    content={"detail": f"Bad Gateway: Failed to reach internal backend service at {target_url} ({exc})"}
                )

    # 2. Local fallback when BACKEND_URL is not provided
    if backend_app:
        response_data = []
        async def send(message):
            response_data.append(message)
        await backend_app(request.scope, request.receive, send)
        
        status_code = 200
        headers = {}
        body = b""
        for msg in response_data:
            if msg["type"] == "http.response.start":
                status_code = msg["status"]
                headers = {k.decode("latin1"): v.decode("latin1") for k, v in msg.get("headers", [])}
            elif msg["type"] == "http.response.body":
                body += msg.get("body", b"")
        return Response(content=body, status_code=status_code, headers=headers)
        
    return JSONResponse(
        status_code=503,
        content={"detail": "Service Unavailable: BACKEND_URL service binding is not configured."}
    )
