import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_SUMMARY_LAYOUT,
  SUMMARY_LAYOUT_STORAGE_KEY,
  SUMMARY_SECTIONS,
  moveSummarySection,
  normalizeSummaryLayout,
  toggleSummarySection,
  type SummaryLayoutPreference,
  type SummarySectionId,
} from '../utils/summaryLayout'

function readStoredLayout(): SummaryLayoutPreference {
  try {
    const stored = window.localStorage.getItem(SUMMARY_LAYOUT_STORAGE_KEY)
    return stored ? normalizeSummaryLayout(JSON.parse(stored)) : normalizeSummaryLayout(DEFAULT_SUMMARY_LAYOUT)
  } catch {
    return normalizeSummaryLayout(DEFAULT_SUMMARY_LAYOUT)
  }
}

export function useSummaryLayout() {
  const [layout, setLayout] = useState<SummaryLayoutPreference>(readStoredLayout)

  useEffect(() => {
    window.localStorage.setItem(SUMMARY_LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  const toggleSection = useCallback((sectionId: SummarySectionId) => {
    setLayout((current) => toggleSummarySection(current, sectionId))
  }, [])

  const moveSection = useCallback((sectionId: SummarySectionId, direction: -1 | 1) => {
    setLayout((current) => moveSummarySection(current, sectionId, direction))
  }, [])

  const restoreDefault = useCallback(() => {
    setLayout(normalizeSummaryLayout(DEFAULT_SUMMARY_LAYOUT))
  }, [])

  const hiddenCount = layout.hidden.length
  const orderedSections = useMemo(
    () => layout.order.map((id) => SUMMARY_SECTIONS.find((section) => section.id === id)).filter((section): section is (typeof SUMMARY_SECTIONS)[number] => Boolean(section)),
    [layout.order],
  )

  return {
    layout,
    orderedSections,
    hiddenCount,
    toggleSection,
    moveSection,
    restoreDefault,
  }
}
