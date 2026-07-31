import { LoaderCircle, TriangleAlert } from 'lucide-react'

export function LoadingState({ error }: { error?: string | null }) {
  if (error) {
    return (
      <div className="state-panel error-panel">
        <TriangleAlert size={30} />
        <h2>No fue posible cargar el dashboard</h2>
        <p>{error}</p>
      </div>
    )
  }
  return (
    <div className="state-panel">
      <img src="toro-mining-logo.png" alt="TORO MINING" />
      <LoaderCircle className="spin" size={28} />
      <h2>Preparando Mina San Bernardo</h2>
      <p>Cargando datos demo locales…</p>
    </div>
  )
}
