# Resultados de validación

Fecha: 31/07/2026, zona horaria America/Monterrey.

## Backend

- `python -m compileall -q backend run_dashboard.py`: correcto.
- `python -m pytest -q backend/tests/smoke_test.py`: **3 pruebas aprobadas**.
- `/api/v1/health`: HTTP 200, `DATA_MODE=demo`.
- `/api/v1/catalog`: siete áreas conceptuales y dieciséis equipos representativos.
- `/api/v1/dashboard/snapshot`: KPIs, dieciséis equipos, tres alarmas y tendencias coherentes.
- Estados presentes en la misma instantánea: operando, detenido, advertencia, alarma y sin comunicación.
- La producción, energía y agua se derivan del mismo bloque temporal determinista de cinco segundos.

## Frontend

- Se compiló el código TS/TSX mediante el constructor local `scripts/build_offline_bundle.js` sin diagnósticos de sintaxis.
- Se verificaron las siete rutas: Resumen, Proceso, Energía, Producción, Agua y jales, Alarmas y Reportes.
- Se abrió el detalle de Tolva HT-101.
- Se verificó cambio oscuro/claro y persistencia de `toro-mining-theme`.
- Se verificaron 1920x1080 y 1366x768 en Chromium headless.
- Errores de consola durante la validación final: **0**.
- Los recursos de la compilación local no realizan solicitudes a CDN ni cargan fuentes externas.

### Limitación del entorno de construcción

El registro npm disponible en este entorno aislado devolvió errores y el navegador bloqueó la navegación HTTP local mediante una política administrativa. Por ello:

1. No se afirma que `npm install`, `npm run typecheck` o el build normal de Vite se hayan ejecutado aquí.
2. Se conservan `package.json`, TypeScript, Vite, Recharts y Lucide React para ejecutar el build normal en un equipo con npm disponible.
3. Para validar la entrega se generó `frontend/dist` a partir del mismo código React/TypeScript con un runtime React local y adaptadores offline de validación.
4. Los endpoints HTTP reales se probaron por separado contra FastAPI; el layout se probó en Chromium con la misma compilación y una instantánea obtenida del endpoint real.

## Reporte Operativo

- Endpoint probado: HTTP 200 y `application/pdf`.
- Indicador `DATOS DEMO`: presente.
- Documento final: tres páginas A4, fondo blanco.
- Incluye marca, mina, generación, periodo, turno, KPIs, tres gráficas, equipos, alarmas, actualización y numeración.
- PDF renderizado a PNG a 150 DPI y revisado visualmente.
- Sin texto cortado, superposición o página vacía en la versión final.

## Ejecutable

No se generó un `.exe` de Windows porque el entorno actual es Linux. Se incluye `ToroMiningDashboard.spec` y `scripts/build_windows_exe.ps1` para producirlo de forma reproducible en Windows 10/11.
