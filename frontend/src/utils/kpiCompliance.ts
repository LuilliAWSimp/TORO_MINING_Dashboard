import type { KpiDefinition } from '../types/contracts'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function interpolate(value: number, startValue: number, endValue: number, startScore: number, endScore: number) {
  if (startValue === endValue) return endScore
  const position = (value - startValue) / (endValue - startValue)
  return startScore + position * (endScore - startScore)
}

/**
 * Normaliza el cumplimiento a una escala de 0 a 100 sin alterar el valor real.
 * La meta equivale a 100. Los límites amarillo y rojo anclan las bandas 75 y 50.
 * El sentido lower_is_better invierte correctamente la lectura: un valor mayor
 * reduce el cumplimiento en lugar de aumentarlo.
 */
export function calculateKpiCompliance(kpi: Pick<KpiDefinition, 'value' | 'target' | 'yellow_limit' | 'red_limit' | 'evaluation_direction'>): number {
  const { value, target, yellow_limit: yellow, red_limit: red, evaluation_direction: direction } = kpi
  if (![value, target, yellow, red].every(Number.isFinite)) return 0

  if (direction === 'higher_is_better') {
    if (value >= target) return 100
    if (value >= yellow) return clamp(interpolate(value, yellow, target, 75, 100), 75, 100)
    if (value >= red) return clamp(interpolate(value, red, yellow, 50, 75), 50, 75)
    if (red <= 0) return 0
    return clamp((value / red) * 50, 0, 50)
  }

  if (value <= target) return 100
  if (value <= yellow) return clamp(interpolate(value, target, yellow, 100, 75), 75, 100)
  if (value <= red) return clamp(interpolate(value, yellow, red, 75, 50), 50, 75)
  if (value <= 0 || red <= 0) return 0
  return clamp((red / value) * 50, 0, 50)
}
