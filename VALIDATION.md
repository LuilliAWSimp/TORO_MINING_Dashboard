# Resultados de validación

Fecha: 02/08/2026. Zona horaria de la aplicación: `America/Monterrey`.

## Backend y API

- `python -m compileall -q backend run_dashboard.py`: correcto.
- `python -m pytest -q backend/tests`: **10 pruebas aprobadas**.
- Las pruebas existentes de escenarios, catálogo, equipos, API, PDF y RAG continúan aprobadas.
- Nueva prueba de presentación confirma que los códigos internos permanecen `green`, `yellow`, `red`, `critical`.
- Nueva prueba confirma las etiquetas del PDF: `En objetivo`, `Precaución`, `Alerta`, `Crítico`.
- No se modificaron `DemoDataProvider`, selección de escenario, contratos de consumo de API ni cálculos RAG.

## Frontend

### Pruebas enfocadas

Se agregó `frontend/tests/presentation.test.cjs`, ejecutado con Node y la dependencia TypeScript ya declarada por el proyecto:

```text
4 pruebas aprobadas
```

Cobertura enfocada:

- Normalización de preferencias guardadas y descarte de identificadores inválidos.
- Imposibilidad de ocultar la sección `Estado y alarmas relevantes`.
- Ocultamiento y reordenamiento de bloques completos.
- Etiquetas RAG operativas y conservación de estados técnicos como `Operando`, `Detenido` y `Sin comunicación`.

Comando disponible después de instalar dependencias:

```powershell
cd frontend
npm run test:focused
```

### Construcción auxiliar ejecutada

- `node scripts/build_offline_bundle.js`: correcto, **44 módulos compilados** desde los archivos TS/TSX actuales.
- Validación TypeScript estricta auxiliar con declaraciones locales de dependencias: correcta.
- `frontend/dist` fue regenerado y se incluye en la entrega.

### Validación visual y funcional

Se verificó el Resumen en Chromium headless con:

- 1920x1080 y 1366x768.
- Tema oscuro y tema claro.
- Escenario `startup` y escenario `target`.
- Apertura y cierre accesible del diálogo `Personalizar resumen`.
- Ocultamiento de `Flujo de planta` y contador de una sección oculta.
- Persistencia al recrear la aplicación mediante `toro-mining-summary-layout-v1`.
- Independencia respecto a `toro-mining-demo-scenario` y `toro-mining-theme`.
- Reordenamiento de bloques completos mediante Subir/Bajar.
- Restauración del orden predeterminado.
- Sección de estado y alarmas relevantes siempre visible y control de visibilidad deshabilitado.
- Estados técnicos visibles con texto, icono y color en 1366x768.
- Etiquetas RAG visibles `En objetivo` y `Precaución`; ausencia de `Verde`, `Amarillo` y `Rojo` como estados visibles.
- Errores de consola durante la validación final: **0**.

Capturas incluidas:

```text
docs/validation/summary-customizer-target-dark-1920x1080.png
docs/validation/summary-startup-light-1366x768.png
```

## Reportes PDF

Se regeneraron y revisaron dos archivos reales:

```text
sample_output/reporte_operativo_startup_demo.pdf
sample_output/reporte_operativo_target_demo.pdf
```

Resultados:

- Tres páginas A4 por reporte.
- Fondo blanco y diseño de impresión conservados.
- Escenario visible en portada.
- Siete KPIs estratégicos con valor, meta, fuente y actualización.
- Etiquetas visibles `En objetivo` y `Precaución` en los datos actuales.
- Ausencia de las etiquetas anteriores `Verde`, `Amarillo` y `Rojo` en el texto extraído.
- Tendencias, equipos, alarmas y numeración sin cambios funcionales.
- Renderizado a PNG a 160 DPI y revisión visual.
- Sin texto cortado, superposición ni páginas vacías.

## Comandos npm oficiales

Se intentó instalar las dependencias con `npm ci`, pero el registro npm aislado del entorno devolvió `404` para `yallist-3.1.1.tgz`. Debido a que `node_modules` no pudo instalarse, los comandos oficiales se ejecutaron pero no pudieron completar por ausencia de `vite/client`, `vite` y `@vitejs/plugin-react`:

```text
npm run typecheck
npm run build
```

Esta limitación corresponde al registro del entorno, no a un error encontrado por la validación auxiliar. En una computadora con acceso normal a npm deben ejecutarse:

```powershell
cd frontend
npm install
npm run typecheck
npm run build
npm run test:focused
```

El instalador de Windows ya ejecuta typecheck y build y se detiene cuando alguno falla.

## Ejecutable

No se generó un `.exe` de Windows porque el entorno actual es Linux. Se conservan `ToroMiningDashboard.spec` y `scripts/build_windows_exe.ps1` sin cambios de arquitectura.
