function parseDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatNumber(value: number, decimals = 1) {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatTime(value: string, includeSeconds = false) {
  const date = parseDate(value)
  if (!date) return value || 'N/D'
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(date)
}

export function formatDateTime(value: string, includeTime = true, dateOnly = false) {
  const date = parseDate(value)
  if (!date) return value || 'N/D'
  if (dateOnly) {
    return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
  }
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
    hour12: false,
  }).format(date)
}

export function compactTime(value: string) {
  const date = parseDate(value)
  if (!date) return value || 'N/D'
  return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

export function formatShortDate(value: string) {
  const date = parseDate(value)
  if (!date) return value || 'N/D'
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' }).format(date)
}

export function formatKpiValue(value: number, unit: string) {
  const decimals = Number.isInteger(value) ? 0 : Math.abs(value) < 10 ? 2 : 1
  return `${formatNumber(value, decimals)} ${unit}`
}
