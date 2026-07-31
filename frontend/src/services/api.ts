import type { CatalogResponse, DashboardSnapshot, EquipmentDetailResponse } from '../types/contracts'

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

export const api = {
  getCatalog: (signal?: AbortSignal) => request<CatalogResponse>('/api/v1/catalog', signal),
  getSnapshot: (windowHours = 12, signal?: AbortSignal) =>
    request<DashboardSnapshot>(`/api/v1/dashboard/snapshot?window_hours=${windowHours}`, signal),
  getEquipment: (equipmentId: string, signal?: AbortSignal) =>
    request<EquipmentDetailResponse>(`/api/v1/equipment/${encodeURIComponent(equipmentId)}`, signal),
  reportUrl: (params: URLSearchParams) => `${API_BASE}/api/v1/reports/operational?${params.toString()}`,
}
