from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

from backend.app.models import CatalogResponse, DashboardSnapshot, DemoScenario, EquipmentDetailResponse


class DataProvider(ABC):
    """Contrato mínimo para sustituir la fuente demo en una etapa futura."""

    @abstractmethod
    def get_catalog(self, scenario: DemoScenario = DemoScenario.STARTUP) -> CatalogResponse:
        raise NotImplementedError

    @abstractmethod
    def get_snapshot(
        self,
        scenario: DemoScenario = DemoScenario.STARTUP,
        window_hours: int = 12,
    ) -> DashboardSnapshot:
        raise NotImplementedError

    @abstractmethod
    def get_equipment_detail(
        self,
        equipment_id: str,
        scenario: DemoScenario = DemoScenario.STARTUP,
        start: datetime | None = None,
        end: datetime | None = None,
    ) -> EquipmentDetailResponse:
        raise NotImplementedError
