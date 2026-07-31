from __future__ import annotations

from functools import lru_cache

from backend.app.config import settings
from backend.app.providers.base import DataProvider
from backend.app.providers.demo import DemoDataProvider


@lru_cache(maxsize=1)
def get_data_provider() -> DataProvider:
    if settings.data_mode.lower() != "demo":
        raise RuntimeError(
            f"DATA_MODE={settings.data_mode!r} no está implementado. "
            "La primera versión solo incluye DemoDataProvider."
        )
    return DemoDataProvider()
