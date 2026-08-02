from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.executive_catalog import evaluate_rag, infer_direction
from backend.app.main import app
from backend.app.models import EvaluationDirection, RagStatus


client = TestClient(app)


def test_rag_higher_is_better_boundaries() -> None:
    direction = infer_direction(100, 90, 80)
    assert direction == EvaluationDirection.HIGHER_IS_BETTER
    assert evaluate_rag(100, 100, 90, 80) == RagStatus.GREEN
    assert evaluate_rag(95, 100, 90, 80) == RagStatus.YELLOW
    assert evaluate_rag(85, 100, 90, 80) == RagStatus.RED
    assert evaluate_rag(79.9, 100, 90, 80) == RagStatus.CRITICAL


def test_rag_lower_is_better_boundaries() -> None:
    direction = infer_direction(10, 12, 15)
    assert direction == EvaluationDirection.LOWER_IS_BETTER
    assert evaluate_rag(10, 10, 12, 15) == RagStatus.GREEN
    assert evaluate_rag(11, 10, 12, 15) == RagStatus.YELLOW
    assert evaluate_rag(14, 10, 12, 15) == RagStatus.RED
    assert evaluate_rag(15.1, 10, 12, 15) == RagStatus.CRITICAL


def test_scenarios_are_complete_and_distinct() -> None:
    startup = client.get('/api/v1/dashboard/snapshot?scenario=startup&window_hours=12')
    target = client.get('/api/v1/dashboard/snapshot?scenario=target&window_hours=12')
    assert startup.status_code == 200
    assert target.status_code == 200
    startup_data = startup.json()
    target_data = target.json()

    assert startup_data['scenario']['id'] == 'startup'
    assert startup_data['kpis']['objective_tpd'] == 400
    assert target_data['scenario']['id'] == 'target'
    assert target_data['scenario']['target_month'] == 36
    assert target_data['kpis']['objective_tpd'] == 1000
    assert len(startup_data['executive']['kpis']) == 44
    assert len(target_data['executive']['kpis']) == 44
    assert len(target_data['executive']['trends']) == 12

    target_kpis = {item['id']: item for item in target_data['executive']['kpis']}
    assert target_kpis['KPI-001']['value'] == 1000
    assert target_kpis['KPI-029']['value'] == 0.72
    assert target_kpis['KPI-041']['value'] == 99.7
    assert target_data['executive']['trends'][-1]['plan_cumulative_t'] == 84000
    assert target_data['executive']['trends'][-1]['actual_cumulative_t'] == 82642

    assert target_data['kpis']['production_current_tph'] > startup_data['kpis']['production_current_tph'] * 2
    assert target_data['kpis']['power_kw'] > startup_data['kpis']['power_kw'] * 2


def test_catalog_and_equipment_respect_scenario() -> None:
    catalog = client.get('/api/v1/catalog?scenario=target')
    detail_startup = client.get('/api/v1/equipment/VF-102?scenario=startup')
    detail_target = client.get('/api/v1/equipment/VF-102?scenario=target')
    assert catalog.status_code == 200
    assert catalog.json()['scenario']['id'] == 'target'
    assert catalog.json()['objective_tpd'] == 1000
    assert len(catalog.json()['kpis']) == 44

    startup_flow = detail_startup.json()['equipment']['measurements'][0]['value']
    target_flow = detail_target.json()['equipment']['measurements'][0]['value']
    assert detail_startup.json()['scenario']['id'] == 'startup'
    assert detail_target.json()['scenario']['id'] == 'target'
    assert target_flow > startup_flow * 2


def test_report_endpoint_returns_selected_scenario() -> None:
    for scenario in ('startup', 'target'):
        response = client.get(f'/api/v1/reports/operational?scenario={scenario}&period=current_shift&shift=current')
        assert response.status_code == 200
        assert response.headers['x-demo-scenario'] == scenario
        assert response.content.startswith(b'%PDF')


def test_kpi_metadata_uses_only_supported_definitions() -> None:
    response = client.get('/api/v1/catalog?scenario=target')
    assert response.status_code == 200
    kpis = {item['id']: item for item in response.json()['kpis']}
    defined = {kpi_id for kpi_id, item in kpis.items() if item['definition'] != 'Pendiente de definición'}
    assert defined == {
        'KPI-001', 'KPI-003', 'KPI-019', 'KPI-029', 'KPI-032',
        'KPI-034', 'KPI-035', 'KPI-038', 'KPI-041', 'KPI-043',
    }
    assert kpis['KPI-002']['formula'] is None
    assert kpis['KPI-002']['frequency'] is None
    assert kpis['KPI-002']['responsible'] is None
    assert kpis['KPI-009']['evaluation_direction'] == 'lower_is_better'
    assert kpis['KPI-021']['evaluation_direction'] == 'higher_is_better'
