# TORO MINING - Dashboard local de Mina San Bernardo

MVP industrial local e independiente para visualizar una planta minera Au-Ag conceptual. La aplicación usa datos deterministas de demostración y no está conectada a SCADA, PLC, historiadores ni bases de datos operativas.

> **DATOS DEMO:** ningún valor representa producción, inventario, ley, recuperación metalúrgica o medición real confirmada.

## Funcionalidad incluida

- Resumen operativo con flujo conceptual interactivo, KPIs y tendencias.
- Vistas de Proceso, Energía, Producción, Agua y jales, Alarmas y Reportes.
- Catálogo configurable de áreas, equipos y sensores conceptuales.
- Detalle reutilizable por equipo.
- Estados demo: operando, detenido, advertencia, alarma y sin comunicación.
- Tema oscuro y claro persistente en el navegador.
- Actualización aproximada cada cinco segundos.
- Reporte Operativo PDF generado localmente desde la misma fuente de datos del dashboard.
- Frontend compilado servido por FastAPI en un solo proceso.
- Lanzador de Windows y configuración reproducible de PyInstaller.

## Arquitectura

```text
frontend/src/
  components/       presentación reutilizable
  pages/            módulos navegables
  services/         cliente de API
  hooks/            actualización y tema
  types/            contratos TypeScript
  styles/           tokens y CSS propio

backend/app/
  api/              endpoints HTTP
  providers/        contrato DataProvider y DemoDataProvider
  services/         selección del proveedor y PDF
  catalog.py        áreas, equipos y sensores configurables
  models.py         contratos Pydantic
  main.py           API y archivos estáticos
```

`DATA_MODE=demo` selecciona `DemoDataProvider`. Una integración futura debe implementar el contrato de `backend/app/providers/base.py` y conservar los contratos del backend. Esta versión no contiene adaptadores ficticios o incompletos para SQL, OPC UA, API o historiadores.

## Requisitos para desarrollo

- Windows 10/11.
- Python 3.11 o superior.
- Node.js 20 o superior.
- npm.

## Instalación en Windows

Abra PowerShell en la carpeta del proyecto y ejecute:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup_windows.ps1
```

Después inicie la versión compilada con:

```text
Iniciar_Dashboard.bat
```

El navegador se abre en `http://127.0.0.1:8000`. El backend sirve el frontend ya compilado, por lo que la ejecución final utiliza un solo proceso local.

## Desarrollo

Después de la instalación:

```powershell
.\scripts\dev_windows.ps1
```

- Frontend Vite: `http://127.0.0.1:5173`
- API y documentación: `http://127.0.0.1:8000/api/docs`

Comandos manuales del frontend:

```powershell
cd frontend
npm run typecheck
npm run build
```

Validación del backend:

```powershell
.\.venv\Scripts\python.exe -m compileall backend run_dashboard.py
.\.venv\Scripts\python.exe -m pytest -q backend\tests\smoke_test.py
```

## Construcción del ejecutable de Windows

La compilación del `.exe` debe realizarse en Windows:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\build_windows_exe.ps1
```

Salida esperada:

```text
dist\TORO_MINING_Dashboard_San_Bernardo.exe
```

PyInstaller incluye `frontend/dist` y los recursos del PDF dentro del ejecutable. La aplicación abre el navegador automáticamente y mantiene un solo proceso local.

## Configuración

Copie `backend/.env.example` como `backend/.env` solamente cuando necesite cambiar valores locales:

```env
DATA_MODE=demo
HOST=127.0.0.1
PORT=8000
OPEN_BROWSER=true
TIMEZONE=America/Monterrey
```

No se requiere conexión a internet para ejecutar la versión compilada. La instalación inicial de dependencias sí requiere acceso al registro de npm y a PyPI, salvo que exista una caché local.

## Reportes PDF

Endpoint:

```text
GET /api/v1/reports/operational
```

Filtros:

- `period=current_shift|day|custom`
- `shift=current|1|2|3`
- `start` y `end` para un periodo personalizado.

Directorio predeterminado en Windows:

```text
%LOCALAPPDATA%\ToroMining\reports
```

Se puede modificar mediante `REPORTS_DIR`. No se generan Excel, HTML, PNG ni correos.

## Endpoints principales

- `GET /api/v1/health`
- `GET /api/v1/catalog`
- `GET /api/v1/dashboard/snapshot`
- `GET /api/v1/equipment/{equipment_id}`
- `GET /api/v1/reports/operational`
- `GET /api/v1/reports`

## Branding

Los archivos utilizados por frontend y PDF son:

```text
frontend/public/toro-mining-logo.png
frontend/public/toro-mining-mark.png
backend/app/static/toro-mining-logo.png
backend/app/static/toro-mining-mark.png
```

Los recursos incluidos fueron preparados con fondo transparente a partir de la referencia visual proporcionada. Para sustituirlos por los originales maestros, conserve esos nombres y proporciones; después ejecute nuevamente `npm run build`.

## Alcance y seguridad

- No existe autenticación en este MVP.
- No hay escritura a PLC o SCADA.
- No hay correo ni SMTP.
- No hay Docker.
- No se calcula recuperación metalúrgica ni ley de mineral.
- El catálogo se muestra permanentemente como conceptual y no confirmado.
- El proyecto de referencia no se modifica ni forma parte de esta entrega.

Consulte `VALIDATION.md` para los resultados de las pruebas realizadas en esta entrega.
