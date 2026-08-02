# Resultados de validación

Fecha: 02/08/2026. Zona horaria de la aplicación: `America/Monterrey`.

## Backend y API

- `python -m compileall -q backend run_dashboard.py`: correcto.
- `python -m pytest -q backend/tests`: **9 pruebas aprobadas**.
- Escenario predeterminado: `startup`.
- Snapshot, catálogo, detalle de equipo y PDF verificados con `startup` y `target`.
- Los dos escenarios devuelven contratos completos y distintos.
- Catálogo ejecutivo: **44 KPIs** en ambos escenarios.
- Tendencia objetivo: **12 semanas**, comparada contra la hoja `Tendencias`.
- Valores objetivo de los 44 KPIs comparados contra `Datos Operación`: sin diferencias.
- Reglas RAG probadas en límites para `higher_is_better` y `lower_is_better`.
- Dirección explícita verificada en KPIs de ambos sentidos.
- Solo los diez KPIs respaldados por `Definiciones KPI` contienen definición completa; los demás conservan campos opcionales o `Pendiente de definición`.
- El detalle de `VF-102` fue verificado en ambos escenarios y conserva valores propios por escenario.
- El simulador de arranque mantiene estados operando, detenido, advertencia, alarma y sin comunicación.

## Frontend

### Construcción ejecutada

- `node scripts/build_offline_bundle.js`: correcto, **40 módulos compilados** desde los mismos archivos TS/TSX.
- Validación TypeScript estricta auxiliar con declaraciones locales de dependencias: correcta.
- `frontend/dist` fue regenerado y se incluye en la entrega.

### Validación visual y funcional

Se verificó la nueva vista `Ejecutivo` en Chromium headless con:

- 1920x1080 y 1366x768.
- Tema oscuro y tema claro.
- Escenario `startup` y escenario `target`.
- Selector segmentado y selección persistida en `toro-mining-demo-scenario`.
- Tema persistido de forma independiente en `toro-mining-theme`.
- Cambio global de escenario con actualización conjunta de snapshot y catálogo.
- Catálogo de 44 KPIs.
- Fechas legibles en lugar de seriales de Excel.
- Gráficas separadas para producción, disponibilidad, recuperación, agua, energía y MTBF.
- Plan contra real, SPI/CPI y burn-down.
- Detalle de equipo abierto en el escenario objetivo.
- Errores de consola durante la validación final: **0**.
- Ausencia del nombre incorrecto proveniente de la referencia: confirmada.

Capturas incluidas:

```text
docs/validation/executive-target-dark-1920x1080.png
docs/validation/executive-startup-dark-1366x768.png
docs/validation/executive-target-light-1366x768.png
docs/validation/scenario-target-equipment-1366x768.png
```

## Reportes PDF

Se generaron y revisaron dos archivos reales:

```text
sample_output/reporte_operativo_startup_demo.pdf
sample_output/reporte_operativo_target_demo.pdf
```

Resultados:

- Tres páginas A4 por reporte.
- Fondo blanco y diseño de impresión.
- Escenario visible en portada.
- Siete KPIs estratégicos con valor, meta, RAG, fuente y actualización.
- Tendencias de producción, demanda eléctrica y agua.
- Equipos y alarmas del escenario solicitado.
- Numeración de páginas.
- Renderizado a PNG a 150 DPI y revisión visual.
- Sin texto cortado, superposición, página vacía ni encabezado huérfano.

## Limitación del entorno npm

El entorno aislado utilizado para esta entrega no pudo completar `npm install`: el registro npm interno no proporcionó el paquete `yallist-3.1.1.tgz`. Como consecuencia, aquí no fue posible ejecutar con dependencias reales:

```text
npm run typecheck
npm run build
```

No se oculta esta limitación ni se afirma que esos dos comandos hayan pasado en este entorno. Para reducir el riesgo se realizaron las siguientes verificaciones:

1. Transpilación de todos los archivos TS/TSX con TypeScript mediante `build_offline_bundle.js`.
2. Validación estricta auxiliar de los contratos internos.
3. Ejecución visual completa del bundle generado en Chromium.
4. Pruebas independientes de todos los endpoints FastAPI.

En una computadora con acceso normal a npm deben ejecutarse los comandos oficiales antes de construir el `.exe`:

```powershell
cd frontend
npm install
npm run typecheck
npm run build
```

El script `setup_windows.ps1` realiza estas comprobaciones y se detiene si alguna falla.

## Ejecutable

No se generó un `.exe` de Windows porque el entorno actual es Linux. Se incluyen `ToroMiningDashboard.spec` y `scripts/build_windows_exe.ps1` para construirlo de forma reproducible en Windows 10/11.
