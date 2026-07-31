import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import type { CatalogResponse, DashboardSnapshot } from '../types/contracts'

interface DashboardDataState {
  snapshot: DashboardSnapshot | null
  catalog: CatalogResponse | null
  loading: boolean
  refreshing: boolean
  error: string | null
  lastSuccessfulFetch: Date | null
  refresh: () => Promise<void>
}

export function useDashboardData(windowHours = 12): DashboardDataState {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null)
  const mounted = useRef(true)
  const requestController = useRef<AbortController | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller

    try {
      setRefreshing(true)
      const [nextSnapshot, nextCatalog] = await Promise.all([
        api.getSnapshot(windowHours, controller.signal),
        catalog ? Promise.resolve(catalog) : api.getCatalog(controller.signal),
      ])
      if (!mounted.current || controller.signal.aborted) return

      setSnapshot(nextSnapshot)
      setCatalog(nextCatalog)
      setLastSuccessfulFetch(new Date())
      setError(null)
    } catch (err) {
      if (!mounted.current || controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) return
      setError(err instanceof Error ? err.message : 'No fue posible obtener los datos demo.')
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
      }
      if (mounted.current && !controller.signal.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [catalog, windowHours])

  useEffect(() => {
    mounted.current = true
    void refresh()
    const interval = window.setInterval(() => void refresh(), 5000)

    return () => {
      mounted.current = false
      requestController.current?.abort()
      requestController.current = null
      window.clearInterval(interval)
    }
  }, [refresh])

  return { snapshot, catalog, loading, refreshing, error, lastSuccessfulFetch, refresh }
}
