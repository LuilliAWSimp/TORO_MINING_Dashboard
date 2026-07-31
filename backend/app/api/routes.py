from __future__ import annotations

from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

from backend.app.catalog import AREAS, EQUIPMENT
from backend.app.config import settings
from backend.app.models import CatalogResponse, DashboardSnapshot, EquipmentDetailResponse
from backend.app.services.provider_service import get_data_provider
from backend.app.services.report_service import generate_operational_report

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "app": settings.app_name,
        "data_mode": settings.data_mode,
        "source": "DATOS DEMO",
    }


@router.get("/catalog", response_model=CatalogResponse)
def catalog() -> CatalogResponse:
    return CatalogResponse(
        mine="Mina San Bernardo",
        phase="Fase inicial conceptual",
        objective_tpd=400,
        future_target_tpd=1000,
        inventory_status="Catálogo conceptual no confirmado",
        source_label="DATOS DEMO",
        areas=AREAS,
        equipment=EQUIPMENT,
    )


@router.get("/dashboard/snapshot", response_model=DashboardSnapshot)
def dashboard_snapshot(
    window_hours: int = Query(default=12, ge=1, le=48),
) -> DashboardSnapshot:
    return get_data_provider().get_snapshot(window_hours=window_hours)


@router.get("/equipment/{equipment_id}", response_model=EquipmentDetailResponse)
def equipment_detail(
    equipment_id: str,
    start: datetime | None = None,
    end: datetime | None = None,
) -> EquipmentDetailResponse:
    try:
        return get_data_provider().get_equipment_detail(equipment_id, start=start, end=end)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Equipo conceptual no encontrado") from exc


@router.get("/reports/operational")
def operational_report(
    period: str = Query(default="current_shift", pattern="^(current_shift|day|custom)$"),
    shift: str = Query(default="current", pattern="^(current|1|2|3)$"),
    start: datetime | None = None,
    end: datetime | None = None,
) -> FileResponse:
    if period == "custom" and (start is None or end is None):
        raise HTTPException(status_code=422, detail="El periodo personalizado requiere fecha inicial y final")
    if start and end and start >= end:
        raise HTTPException(status_code=422, detail="La fecha inicial debe ser anterior a la fecha final")
    path = generate_operational_report(
        provider=get_data_provider(),
        period=period,
        shift=shift,
        start=start,
        end=end,
    )
    return FileResponse(
        path=path,
        media_type="application/pdf",
        filename=path.name,
        headers={"X-Data-Source": "DATOS DEMO"},
    )


@router.get("/reports")
def list_reports() -> dict[str, list[dict[str, str | int]]]:
    items = []
    for path in sorted(settings.reports_dir.glob("*.pdf"), reverse=True)[:20]:
        stat = path.stat()
        items.append({"name": path.name, "size": stat.st_size, "path": str(path)})
    return {"reports": items}
