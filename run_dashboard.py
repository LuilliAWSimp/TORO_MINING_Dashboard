from __future__ import annotations

import threading
import time
import webbrowser

import uvicorn

from backend.app.config import settings


def open_dashboard() -> None:
    time.sleep(1.2)
    webbrowser.open(f"http://{settings.host}:{settings.port}")


if __name__ == "__main__":
    if settings.open_browser:
        threading.Thread(target=open_dashboard, daemon=True).start()
    uvicorn.run(
        "backend.app.main:app",
        host=settings.host,
        port=settings.port,
        log_level="info",
        reload=False,
    )
