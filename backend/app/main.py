from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.api.routes import router
from backend.app.config import settings

app = FastAPI(
    title=settings.app_name,
    version="0.2.0",
    docs_url="/api/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.include_router(router)


def _mount_frontend() -> None:
    dist = settings.frontend_dist
    assets = dist / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=str(assets)), name="assets")
    if dist.exists():
        @app.get("/", include_in_schema=False)
        def index() -> FileResponse:
            return FileResponse(dist / "index.html")

        @app.get("/{full_path:path}", include_in_schema=False)
        def spa(full_path: str):
            candidate = dist / full_path
            if candidate.is_file():
                return FileResponse(candidate)
            if full_path.startswith("api/"):
                return JSONResponse(status_code=404, content={"detail": "No encontrado"})
            return FileResponse(dist / "index.html")
    else:
        @app.get("/", include_in_schema=False)
        def frontend_not_built() -> JSONResponse:
            return JSONResponse({
                "message": "Frontend no compilado. Ejecute npm install y npm run build dentro de frontend.",
                "api_docs": "/api/docs",
                "source": "DATOS DEMO",
            })


_mount_frontend()
