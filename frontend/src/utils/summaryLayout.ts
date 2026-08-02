export type SummarySectionId = 'kpis' | 'process' | 'trends' | 'status_alarms'

export interface SummarySectionDefinition {
  id: SummarySectionId
  label: string
  description: string
  required: boolean
}

export interface SummaryLayoutPreference {
  order: SummarySectionId[]
  hidden: SummarySectionId[]
}

export const SUMMARY_LAYOUT_STORAGE_KEY = 'toro-mining-summary-layout-v1'

export const SUMMARY_SECTIONS: SummarySectionDefinition[] = [
  {
    id: 'kpis',
    label: 'Indicadores principales',
    description: 'Producción, energía, agua, equipos y alarmas activas.',
    required: false,
  },
  {
    id: 'process',
    label: 'Flujo de planta',
    description: 'Diagrama conceptual e interacción con equipos.',
    required: false,
  },
  {
    id: 'trends',
    label: 'Tendencias operativas',
    description: 'Producción, energía y agua de las últimas horas.',
    required: false,
  },
  {
    id: 'status_alarms',
    label: 'Estado y alarmas relevantes',
    description: 'Distribución de equipos y eventos críticos activos.',
    required: true,
  },
]

const ALL_SECTION_IDS = SUMMARY_SECTIONS.map((section) => section.id)
const REQUIRED_SECTION_IDS = new Set(
  SUMMARY_SECTIONS.filter((section) => section.required).map((section) => section.id),
)

export const DEFAULT_SUMMARY_LAYOUT: SummaryLayoutPreference = {
  order: [...ALL_SECTION_IDS],
  hidden: [],
}

function isSectionId(value: unknown): value is SummarySectionId {
  return typeof value === 'string' && ALL_SECTION_IDS.includes(value as SummarySectionId)
}

export function normalizeSummaryLayout(value: unknown): SummaryLayoutPreference {
  if (!value || typeof value !== 'object') return { ...DEFAULT_SUMMARY_LAYOUT, order: [...DEFAULT_SUMMARY_LAYOUT.order] }

  const candidate = value as Partial<SummaryLayoutPreference>
  const order = Array.isArray(candidate.order)
    ? candidate.order.filter(isSectionId).filter((id, index, list) => list.indexOf(id) === index)
    : []
  const completeOrder = [...order, ...ALL_SECTION_IDS.filter((id) => !order.includes(id))]
  const hidden = Array.isArray(candidate.hidden)
    ? candidate.hidden
      .filter(isSectionId)
      .filter((id, index, list) => list.indexOf(id) === index)
      .filter((id) => !REQUIRED_SECTION_IDS.has(id))
    : []

  return { order: completeOrder, hidden }
}

export function moveSummarySection(
  layout: SummaryLayoutPreference,
  sectionId: SummarySectionId,
  direction: -1 | 1,
): SummaryLayoutPreference {
  const currentIndex = layout.order.indexOf(sectionId)
  const nextIndex = currentIndex + direction
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= layout.order.length) return layout

  const order = [...layout.order]
  const [section] = order.splice(currentIndex, 1)
  order.splice(nextIndex, 0, section)
  return { ...layout, order }
}

export function toggleSummarySection(
  layout: SummaryLayoutPreference,
  sectionId: SummarySectionId,
): SummaryLayoutPreference {
  if (REQUIRED_SECTION_IDS.has(sectionId)) return layout
  const hidden = layout.hidden.includes(sectionId)
    ? layout.hidden.filter((id) => id !== sectionId)
    : [...layout.hidden, sectionId]
  return { ...layout, hidden }
}
