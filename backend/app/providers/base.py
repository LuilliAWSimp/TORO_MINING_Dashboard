from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

from backend.app.models import DashboardSnapshot, EquipmentDetailResponse


class DataProvider(ABC):
    """Contrato mínimo para sustituir la fuente demo en una etapa futura."""

    @abstractmethod
    def get_snapshot(self, window_hours: int = 12) -> DashboardSnapshot:
        raise NotImplementedError

    @abstractmethod
    def get_equipment_detail(
        self,
        equipment_id: str,
        start: datetime | None = None,
        end: datetime | None = None,
    ) -> EquipmentDetailResponse:
        raise NotImplementedError
