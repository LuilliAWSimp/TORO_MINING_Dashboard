from __future__ import annotations

import os
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TORO MINING - Mina San Juan"
    data_mode: str = "demo"
    host: str = "127.0.0.1"
    port: int = 8000
    open_browser: bool = True
    timezone: str = "America/Monterrey"

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_prefix="",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def tz(self) -> ZoneInfo:
        return ZoneInfo(self.timezone)

    @property
    def project_root(self) -> Path:
        if getattr(sys, "frozen", False):
            return Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent))
        return Path(__file__).resolve().parents[2]

    @property
    def frontend_dist(self) -> Path:
        return self.project_root / "frontend" / "dist"

    @property
    def assets_dir(self) -> Path:
        return self.project_root / "backend" / "app" / "static"

    @property
    def reports_dir(self) -> Path:
        override = os.getenv("REPORTS_DIR")
        if override:
            path = Path(override).expanduser()
        elif os.name == "nt" and os.getenv("LOCALAPPDATA"):
            path = Path(os.environ["LOCALAPPDATA"]) / "ToroMining" / "reports"
        else:
            path = Path.home() / ".toro_mining" / "reports"
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
