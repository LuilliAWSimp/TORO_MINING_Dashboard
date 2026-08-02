const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function loadTypeScriptModule(relativePath) {
  const filePath = path.resolve(__dirname, '..', relativePath)
  const source = fs.readFileSync(filePath, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filePath,
  }).outputText
  const module = { exports: {} }
  const execute = new Function('exports', 'module', 'require', '__filename', '__dirname', compiled)
  execute(module.exports, module, require, filePath, path.dirname(filePath))
  return module.exports
}

const layout = loadTypeScriptModule('src/utils/summaryLayout.ts')
const presentation = loadTypeScriptModule('src/utils/statusPresentation.ts')

test('normaliza preferencias y conserva todas las secciones conocidas', () => {
  const normalized = layout.normalizeSummaryLayout({
    order: ['trends', 'trends', 'unknown'],
    hidden: ['process', 'status_alarms', 'unknown'],
  })
  assert.deepEqual(normalized.order, ['trends', 'kpis', 'process', 'status_alarms'])
  assert.deepEqual(normalized.hidden, ['process'])
})

test('la sección con alarmas relevantes no puede ocultarse', () => {
  const next = layout.toggleSummarySection(layout.DEFAULT_SUMMARY_LAYOUT, 'status_alarms')
  assert.deepEqual(next, layout.DEFAULT_SUMMARY_LAYOUT)
})

test('oculta y reordena únicamente bloques completos del resumen', () => {
  const hidden = layout.toggleSummarySection(layout.DEFAULT_SUMMARY_LAYOUT, 'process')
  assert.deepEqual(hidden.hidden, ['process'])
  const moved = layout.moveSummarySection(hidden, 'trends', -1)
  assert.deepEqual(moved.order, ['kpis', 'trends', 'process', 'status_alarms'])
  assert.deepEqual(moved.hidden, ['process'])
})

test('las etiquetas RAG visibles son operativas y los estados técnicos se conservan', () => {
  assert.equal(presentation.STATUS_LABELS.green, 'En objetivo')
  assert.equal(presentation.STATUS_LABELS.yellow, 'Precaución')
  assert.equal(presentation.STATUS_LABELS.red, 'Alerta')
  assert.equal(presentation.STATUS_LABELS.critical, 'Crítico')
  assert.equal(presentation.STATUS_LABELS.running, 'Operando')
  assert.equal(presentation.STATUS_LABELS.stopped, 'Detenido')
  assert.equal(presentation.STATUS_LABELS.offline, 'Sin comunicación')
})

const compliance = loadTypeScriptModule('src/utils/kpiCompliance.ts')

test('cumplimiento higher_is_better usa meta y umbrales sin alterar el valor', () => {
  const base = { target: 100, yellow_limit: 90, red_limit: 80, evaluation_direction: 'higher_is_better' }
  assert.equal(compliance.calculateKpiCompliance({ ...base, value: 100 }), 100)
  assert.equal(compliance.calculateKpiCompliance({ ...base, value: 95 }), 87.5)
  assert.equal(compliance.calculateKpiCompliance({ ...base, value: 85 }), 62.5)
  assert.equal(compliance.calculateKpiCompliance({ ...base, value: 40 }), 25)
})

test('cumplimiento lower_is_better disminuye cuando el valor aumenta', () => {
  const base = { target: 10, yellow_limit: 12, red_limit: 15, evaluation_direction: 'lower_is_better' }
  const atTarget = compliance.calculateKpiCompliance({ ...base, value: 10 })
  const warning = compliance.calculateKpiCompliance({ ...base, value: 11 })
  const red = compliance.calculateKpiCompliance({ ...base, value: 13.5 })
  const critical = compliance.calculateKpiCompliance({ ...base, value: 30 })
  assert.equal(atTarget, 100)
  assert.equal(warning, 87.5)
  assert.equal(red, 62.5)
  assert.equal(critical, 25)
  assert.ok(atTarget > warning && warning > red && red > critical)
})

test('el estado operativo explica la causa prioritaria sin alterar el contrato', () => {
  const base = {
    production_current_tph: 0,
    production_today_t: 0,
    objective_tpd: 400,
    objective_progress_pct: 0,
    power_kw: 0,
    energy_today_kwh: 0,
    specific_energy_kwh_t: 0,
    water_recirculation_pct: 0,
    equipment_running: 10,
    equipment_stopped: 0,
    equipment_warning: 0,
    equipment_alarm: 0,
    equipment_offline: 0,
    active_alarms: 0,
  }
  assert.deepEqual(presentation.getOperationalStatePresentation(base), { type: 'good', cause: 'Operación estable' })
  assert.deepEqual(presentation.getOperationalStatePresentation({ ...base, equipment_warning: 2 }), { type: 'warning', cause: '2 equipos en precaución' })
  assert.deepEqual(presentation.getOperationalStatePresentation({ ...base, equipment_warning: 2, equipment_alarm: 1 }), { type: 'alarm', cause: '1 equipo en alarma' })
  assert.deepEqual(presentation.getOperationalStatePresentation({ ...base, equipment_alarm: 1, equipment_offline: 1 }), { type: 'offline', cause: '1 equipo sin comunicación' })
})

test('los estados compartidos usan iconos distintos y colores semánticos', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'src/components/StatusBadge.tsx'), 'utf8')
  assert.match(source, /running:\s*CirclePlay/)
  assert.match(source, /stopped:\s*CirclePause/)
  assert.match(source, /warning:\s*TriangleAlert/)
  assert.match(source, /alarm:\s*BellRing/)
  assert.match(source, /critical:\s*OctagonAlert/)
  assert.match(source, /offline:\s*WifiOff/)
  assert.match(source, /info:\s*Info/)
  assert.match(source, /demo:\s*Database/)

  const css = fs.readFileSync(path.resolve(__dirname, '..', 'src/styles/global.css'), 'utf8')
  assert.match(css, /--status-stable:\s*#22c55e/i)
  assert.match(css, /--status-caution:\s*#eab308/i)
  assert.match(css, /--status-alert:\s*#f97316/i)
  assert.match(css, /--status-critical:\s*#ef4444/i)
  assert.match(css, /:root\[data-theme="light"\][\s\S]*--status-alert:\s*#c2410c/i)
  assert.match(css, /:root\[data-theme="light"\][\s\S]*--status-critical:\s*#b91c1c/i)
})

test('todas las tendencias reutilizan tooltip compartido, cursor y punto activo', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'src/components/TimeSeriesChart.tsx'), 'utf8')
  assert.match(source, /<Tooltip/)
  assert.match(source, /SharedChartTooltip/)
  assert.match(source, /cursor=\{\{ stroke:/)
  assert.match(source, /activeDot=\{\{ r: 5/)
  assert.match(source, /allowEscapeViewBox=\{\{ x: true, y: true \}\}/)
  assert.match(source, /Number\.isFinite/)

  const pages = [
    'src/pages/SummaryPage.tsx',
    'src/pages/ExecutivePage.tsx',
    'src/pages/ProductionPage.tsx',
    'src/pages/EnergyPage.tsx',
    'src/pages/WaterTailingsPage.tsx',
    'src/components/EquipmentDetailDrawer.tsx',
    'src/components/KpiDetailPanel.tsx',
  ]
  for (const relativePath of pages) {
    const pageSource = fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')
    assert.match(pageSource, /TimeSeriesChart/, `${relativePath} debe usar TimeSeriesChart compartido`)
  }
})

test('el control de actualización usa RefreshCw y bloquea repeticiones durante la carga', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'src/components/Header.tsx'), 'utf8')
  assert.match(source, /RefreshCw size=\{19\}/)
  assert.match(source, /aria-label="Actualizar datos"/)
  assert.match(source, /title="Actualizar datos"/)
  assert.match(source, /disabled=\{refreshing\}/)
  assert.match(source, /refreshing \? 'spin' : ''/)
})

test('Resumen presenta Estado operativo con causa y elimina Calidad general', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'src/pages/SummaryPage.tsx'), 'utf8')
  assert.doesNotMatch(source, /Calidad general/)
  assert.match(source, /label="Estado operativo"/)
  assert.match(source, /operationalState\.cause/)
})

test('el bundle offline conserva tooltips interactivos e iconos Lucide relevantes', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', '..', 'scripts/build_offline_bundle.js'), 'utf8')
  assert.match(source, /onPointerMove:setFromPointer/)
  assert.match(source, /React\.cloneElement\(tooltip\.props\.content/)
  assert.match(source, /name==='RefreshCw'/)
  assert.match(source, /name==='BellRing'/)
  assert.match(source, /name==='OctagonAlert'/)
})
