import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import type { CatalogResponse, DashboardSnapshot, DemoScenario } from '../types/contracts'

interface DashboardPayload {
  snapshot: DashboardSnapshot | null
  catalog: CatalogResponse | null
}

interface DashboardDataState extends DashboardPayload {
  loading: boolean
  refreshing: boolean
  error: string | null
  lastSuccessfulFetch: Date | null
  refresh: () => Promise<void>
  scenarioChanging: boolean
}

export function useDashboardData(scenario: DemoScenario, windowHours = 12): DashboardDataState {
  const [payload, setPayload] = useState<DashboardPayload>({ snapshot: null, catalog: null })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null)
  const mounted = useRef(true)
  const requestController = useRef<AbortController | null>(null)

  const performLoad = useCallback(async (initial: boolean): Promise<void> => {
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller

    try {
      if (initial) setLoading(true)
      setRefreshing(true)
      const [nextSnapshot, nextCatalog] = await Promise.all([
        api.getSnapshot(scenario, windowHours, controller.signal),
        api.getCatalog(scenario, controller.signal),
      ])
      if (!mounted.current || controller.signal.aborted) return
      if (nextSnapshot.scenario.id !== scenario || nextCatalog.scenario.id !== scenario) {
        throw new Error('La API devolvió un escenario distinto al solicitado.')
      }

      // Una sola actualización evita mostrar catálogo y snapshot de escenarios diferentes.
      setPayload({ snapshot: nextSnapshot, catalog: nextCatalog })
      setLastSuccessfulFetch(new Date())
      setError(null)
    } catch (err) {
      if (!mounted.current || controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) return
      setError(err instanceof Error ? err.message : 'No fue posible obtener los datos demo.')
    } finally {
      if (requestController.current === controller) requestController.current = null
      if (mounted.current && !controller.signal.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [scenario, windowHours])

  const refresh = useCallback(() => performLoad(false), [performLoad])

  useEffect(() => {
    mounted.current = true
    setPayload({ snapshot: null, catalog: null })
    setError(null)
    void performLoad(true)
    const interval = window.setInterval(() => void performLoad(false), 5000)

    return () => {
      mounted.current = false
      requestController.current?.abort()
      requestController.current = null
      window.clearInterval(interval)
    }
  }, [performLoad])

  const snapshot = payload.snapshot?.scenario.id === scenario ? payload.snapshot : null
  const catalog = payload.catalog?.scenario.id === scenario ? payload.catalog : null

  return {
    snapshot,
    catalog,
    loading,
    refreshing,
    error,
    lastSuccessfulFetch,
    refresh,
    scenarioChanging: !snapshot || !catalog,
  }
}
