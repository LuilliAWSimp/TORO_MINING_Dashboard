# TORO MINING - Dashboard local de Mina San Bernardo

Dashboard industrial local e independiente para una operación minera Au-Ag conceptual. La aplicación utiliza datos deterministas de demostración y no está conectada con SCADA, PLC, ERP, CMMS, laboratorio, historiadores ni bases operativas.

> **DATOS DEMO:** ningún valor representa producción, inventario, ley, recuperación metalúrgica o medición real confirmada.

## Escenarios demo

El sistema incluye dos escenarios globales, resueltos por el backend mediante `DemoDataProvider`:

- `startup`: **Arranque · 400 t/d**. Es el escenario predeterminado y conserva el simulador operativo inicial.
- `target`: **Objetivo · 1,000 t/d · Mes 36**. Usa valores propios tomados de la referencia de operación al 100%; no es un escalamiento lineal del escenario de arranque.

La selección se realiza en la franja `DATOS DEMO`, se guarda en `localStorage` con la clave `toro-mining-demo-scenario` y es independiente del tema visual, almacenado en `toro-mining-theme`.

La ruta `Resumen` permite personalizar únicamente su presentación con la clave independiente `toro-mining-summary-layout-v1`. Se pueden mostrar, ocultar y reordenar bloques completos mediante controles Subir/Bajar. La sección de estado y alarmas relevantes permanece siempre visible, y la opción **Restaurar diseño predeterminado** elimina ocultamientos y recupera el orden original.

El cambio de escenario actualiza de forma conjunta el snapshot y el catálogo. Mientras se consulta el nuevo escenario se oculta el contenido anterior para evitar mezclar información.

## Funcionalidad incluida

- Resumen operativo con flujo conceptual interactivo, KPIs, tendencias y personalización persistente de secciones.
- Etiquetas operativas visibles para RAG: `En objetivo`, `Precaución`, `Alerta` y `Crítico`, sin modificar los códigos internos.
- Nueva vista `Ejecutivo` adaptada al sistema visual de TORO MINING.
- Estado general RAG calculado.
- Siete KPIs estratégicos con detalle de fuente, meta, umbrales y frecuencia.
- Catálogo configurable de 44 KPIs.
- Tendencias separadas de 12 semanas, plan contra real, SPI/CPI y burn-down de issues.
- Desempeño por área, riesgos, próximos hitos y logros del mes.
- Vistas de Proceso, Energía, Producción, Agua y jales, Alarmas y Reportes.
- Catálogo configurable de áreas, equipos y sensores conceptuales.
- Detalle reutilizable de equipos en ambos escenarios.
- Tema oscuro y claro persistente.
- Variables operativas actualizadas aproximadamente cada cinco segundos.
- KPIs diarios, semanales y mensuales con marcas de actualización estables según su frecuencia demo.
- Reporte Operativo PDF generado localmente desde el mismo escenario del dashboard.
- Frontend compilado servido por FastAPI en un solo proceso.
- Lanzador de Windows y configuración reproducible de PyInstaller.

## Catálogo KPI

Cada KPI contiene:

```text
id, nombre, dominio, valor, unidad, meta,
límite amarillo, límite rojo, dirección de evaluación,
fuente, frecuencia, responsable, definición, fórmula,
uso gerencial, fecha de actualización y estado RAG calculado
```

Las definiciones, fórmulas, frecuencias y responsables se trasladaron únicamente cuando estaban presentes en la hoja `Definiciones KPI`. Los campos no respaldados permanecen opcionales o muestran `Pendiente de definición`.

Las fuentes son metadatos demo. No representan conexiones activas.

## Reglas RAG

Los códigos internos y los contratos de API permanecen sin cambios:

```text
green, yellow, red, critical
```

Su representación visible en la interfaz y el PDF es:

- `green`: **En objetivo**.
- `yellow`: **Precaución**.
- `red`: **Alerta**.
- `critical`: **Crítico**.

Para `higher_is_better`:

- En objetivo: valor mayor o igual a la meta.
- Precaución: entre límite amarillo y meta.
- Alerta: entre límite rojo y límite amarillo.
- Crítico: inferior al límite rojo.

Para `lower_is_better`:

- En objetivo: valor menor o igual a la meta.
- Precaución: entre meta y límite amarillo.
- Alerta: entre límite amarillo y límite rojo.
- Crítico: superior al límite rojo.

La dirección se infiere inicialmente desde el orden de meta y umbrales, se guarda explícitamente en el catálogo y se prueba para ambos sentidos. Estados técnicos como `Operando`, `Detenido`, `Advertencia`, `Alarma` y `Sin comunicación` conservan su significado y se muestran con texto, icono y color semántico.

## Arquitectura

```text
frontend/src/
  components/       presentación reutilizable, selector de escenario y personalizador del Resumen
  pages/            módulos navegables, incluida la vista Ejecutiva
  services/         cliente de API con parámetro scenario
  hooks/            actualización atómica, tema y preferencias del Resumen
  types/            contratos TypeScript
  styles/           tokens y CSS propio

backend/app/
  api/                    endpoints HTTP
  providers/              contrato DataProvider y DemoDataProvider
  services/               selección de proveedor y PDF
  catalog.py              áreas, equipos y sensores conceptuales
  executive_catalog.py    escenarios, 44 KPIs, RAG y tendencias ejecutivas
  models.py               contratos Pydantic
  main.py                 API y archivos estáticos
```

`DATA_MODE=demo` selecciona `DemoDataProvider`. El Excel de referencia no se utiliza en tiempo de ejecución.

## Requisitos para desarrollo

- Windows 10/11 de 64 bits.
- **Python 3.11 o 3.12 de 64 bits. Python 3.12 recomendado.**
- Node.js 20 o superior.
- npm.

Python 3.13 y 3.14 no deben utilizarse con las versiones de dependencias fijadas en esta entrega.

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

El navegador se abre en `http://127.0.0.1:8000`. El backend sirve el frontend compilado y la aplicación final utiliza un solo proceso local.

## Desarrollo

```powershell
.\scripts\dev_windows.ps1
```

- Frontend Vite: `http://127.0.0.1:5173`
- API y documentación: `http://127.0.0.1:8000/api/docs`

Validación manual:

```powershell
cd frontend
npm run typecheck
npm run build
npm run test:focused
cd ..
.\.venv\Scripts\python.exe -m compileall backend run_dashboard.py
.\.venv\Scripts\python.exe -m pytest -q backend\tests
```

## Endpoints y escenario

Todos los endpoints funcionales principales aceptan `scenario=startup|target` y usan `startup` de manera predeterminada:

```text
GET /api/v1/catalog?scenario=startup
GET /api/v1/dashboard/snapshot?scenario=startup&window_hours=12
GET /api/v1/equipment/ML-201?scenario=target
GET /api/v1/reports/operational?scenario=target&period=day
```

Otros endpoints:

- `GET /api/v1/health`
- `GET /api/v1/reports`

## Reporte Operativo PDF

El reporte muestra uno de los siguientes encabezados:

```text
ESCENARIO DEMO · ARRANQUE 400 t/d
ESCENARIO DEMO · OBJETIVO 1,000 t/d · MES 36
```

Incluye los siete KPIs estratégicos y su RAG con etiquetas operativas (`En objetivo`, `Precaución`, `Alerta`, `Crítico`), además de indicadores operativos, tendencias, equipos y alarmas del mismo escenario solicitado. La personalización del Resumen no modifica el PDF.

Filtros disponibles:

- `period=current_shift|day|custom`
- `shift=current|1|2|3`
- `start` y `end` para un periodo personalizado.

Directorio predeterminado en Windows:

```text
%LOCALAPPDATA%\ToroMining\reports
```

No se generan Excel, HTML, PNG ni correos.

## Construcción del ejecutable de Windows

La compilación debe realizarse en Windows:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\build_windows_exe.ps1
```

Salida esperada:

```text
dist\TORO_MINING_Dashboard_San_Bernardo.exe
```

## Configuración

```env
DATA_MODE=demo
HOST=127.0.0.1
PORT=8000
OPEN_BROWSER=true
TIMEZONE=America/Monterrey
```

No se requiere internet para ejecutar la versión compilada. La instalación inicial de dependencias sí requiere acceso a npm y PyPI.

## Alcance y seguridad

- No existe autenticación en este MVP.
- No hay edición de KPIs.
- No hay escritura hacia PLC o SCADA.
- No hay conexiones reales con sistemas externos.
- No hay correo ni SMTP.
- No hay Docker.
- El catálogo de equipos continúa marcado como conceptual y no confirmado.
- El nombre visible de la operación es exclusivamente **Mina San Bernardo**.

Consulte `VALIDATION.md` para conocer las pruebas y limitaciones reales de esta entrega.
