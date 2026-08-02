# Incremental TORO MINING v0.2.0

Este paquete se aplica sobre la version analizada de `TORO_MINING_Dashboard-main`.

## Aplicacion

1. Extraiga el contenido dentro de la carpeta raiz del proyecto actual.
2. Acepte reemplazar los archivos existentes.
3. Abra PowerShell en la carpeta del proyecto.
4. Ejecute:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\APLICAR_INCREMENTAL.ps1
.\scripts\setup_windows.ps1
```

El script elimina artefactos generados de la version previa y conserva la arquitectura existente.

## Incluye

- Escenarios demo Arranque 400 t/d y Objetivo 1,000 t/d Mes 36.
- Catalogo configurable de 44 KPIs y calculo RAG.
- Nueva vista Ejecutiva.
- Parametro de escenario en API, equipos y PDF.
- Frontend compilado, capturas de validacion y dos PDF de muestra.
