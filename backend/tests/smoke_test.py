from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["data_mode"] == "demo"


def test_snapshot_is_coherent() -> None:
    response = client.get("/api/v1/dashboard/snapshot?window_hours=12")
    assert response.status_code == 200
    data = response.json()
    assert data["source_label"] == "DATOS DEMO"
    assert data["kpis"]["production_today_t"] >= 0
    assert data["kpis"]["specific_energy_kwh_t"] >= 0
    assert len(data["equipment"]) == 16
    assert len(data["trends"]) >= 16
    status_values = {item["status"] for item in data["equipment"]}
    assert {"running", "stopped", "warning", "alarm", "offline"}.issubset(status_values)


def test_report_download() -> None:
    response = client.get("/api/v1/reports/operational?period=current_shift&shift=current")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
    assert response.content.startswith(b"%PDF")
