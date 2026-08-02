import { LayoutDashboard, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { SummaryLayoutPreference, SummarySectionDefinition, SummarySectionId } from '../utils/summaryLayout'

export function SummaryCustomizer({
  open,
  sections,
  layout,
  hiddenCount,
  onClose,
  onToggle,
  onMove,
  onRestore,
}: {
  open: boolean
  sections: SummarySectionDefinition[]
  layout: SummaryLayoutPreference
  hiddenCount: number
  onClose: () => void
  onToggle: (sectionId: SummarySectionId) => void
  onMove: (sectionId: SummarySectionId, direction: -1 | 1) => void
  onRestore: () => void
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return undefined
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="summary-customizer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section
        className="summary-customizer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-customizer-title"
        aria-describedby="summary-customizer-description"
      >
        <div className="summary-customizer-header">
          <div>
            <span><LayoutDashboard size={16} aria-hidden="true" /> Resumen</span>
            <h2 id="summary-customizer-title">Personalizar resumen</h2>
            <p id="summary-customizer-description">Muestra, oculta y ordena bloques completos. Los datos y el escenario no cambian.</p>
          </div>
          <button ref={closeButtonRef} className="icon-button" type="button" onClick={onClose} aria-label="Cerrar personalización">
            <X size={18} />
          </button>
        </div>

        <div className="summary-customizer-status" aria-live="polite">
          <strong>{hiddenCount}</strong>
          <span>{hiddenCount === 1 ? 'sección oculta' : 'secciones ocultas'}</span>
        </div>

        <div className="summary-section-settings">
          {sections.map((section, index) => {
            const hidden = layout.hidden.includes(section.id)
            return (
              <div className="summary-section-setting" key={section.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={!hidden}
                    disabled={section.required}
                    onChange={() => onToggle(section.id)}
                  />
                  <span>
                    <strong>{section.label}</strong>
                    <small>{section.description}</small>
                  </span>
                </label>
                <div className="summary-setting-actions">
                  {section.required && <span className="required-section"><ShieldCheck size={13} /> Siempre visible</span>}
                  <button type="button" onClick={() => onMove(section.id, -1)} disabled={index === 0}>Subir</button>
                  <button type="button" onClick={() => onMove(section.id, 1)} disabled={index === sections.length - 1}>Bajar</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="summary-customizer-footer">
          <p>La identificación de datos demo, conexión, errores y alarmas relevantes permanecen visibles.</p>
          <button type="button" className="secondary-button" onClick={onRestore}>
            <RefreshCw size={15} /> Restaurar diseño predeterminado
          </button>
        </div>
      </section>
    </div>
  )
}
