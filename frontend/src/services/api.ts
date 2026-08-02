import type { CatalogResponse, DashboardSnapshot, DemoScenario, EquipmentDetailResponse } from '../types/contracts'

const API_BASE = ''

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Error ${response.status}`)
  }
  return response.json() as Promise<T>
}

function scenarioParams(scenario: DemoScenario) {
  return new URLSearchParams({ scenario })
}

export const api = {
  getCatalog: (scenario: DemoScenario, signal?: AbortSignal) =>
    request<CatalogResponse>(`/api/v1/catalog?${scenarioParams(scenario).toString()}`, signal),
  getSnapshot: (scenario: DemoScenario, windowHours = 12, signal?: AbortSignal) => {
    const params = scenarioParams(scenario)
    params.set('window_hours', String(windowHours))
    return request<DashboardSnapshot>(`/api/v1/dashboard/snapshot?${params.toString()}`, signal)
  },
  getEquipment: (equipmentId: string, scenario: DemoScenario, signal?: AbortSignal) =>
    request<EquipmentDetailResponse>(
      `/api/v1/equipment/${encodeURIComponent(equipmentId)}?${scenarioParams(scenario).toString()}`,
      signal,
    ),
  reportUrl: (params: URLSearchParams) => `${API_BASE}/api/v1/reports/operational?${params.toString()}`,
}
