# TORO MINING Dashboard v0.2.2

## Alcance

- Barras horizontales de cumplimiento para los siete KPIs estratégicos en Resumen y Ejecutivo.
- Las tendencias históricas existentes permanecen sin cambios.
- La meta equivale a 100 % de cumplimiento y el valor real con unidad sigue visible.
- El cálculo respeta `higher_is_better` y `lower_is_better`, incluyendo sus límites amarillo y rojo.
- No se aplican porcentajes de condición a sensores de temperatura, nivel, presión, pH, densidad u ORP.
- El contrato KPI queda preparado con campos opcionales `optimal_min`, `optimal_max`, `warning_min`, `warning_max`, `critical_min` y `critical_max`; todos permanecen en `null` hasta contar con límites documentados.

## Validación ejecutada

- Compilación Python correcta.
- 11 pruebas backend aprobadas.
- 6 pruebas enfocadas frontend aprobadas.
- Validación TypeScript auxiliar sin errores.
- Bundle offline generado: 47 módulos.
- Resumen y Ejecutivo comprobados en startup/oscuro/1366x768 y target/claro/1920x1080.
- Sin errores de consola en las comprobaciones visuales.

## Limitación del entorno

`npm ci`, y por consecuencia el `typecheck` y build oficiales con Vite, no pudieron ejecutarse en el entorno aislado porque el registro interno devolvió 404 para `yallist-3.1.1.tgz`. El código fue validado mediante TypeScript global, pruebas enfocadas y el constructor offline. En Windows, use los comandos indicados en LEEME_INCREMENTAL_v0.2.2.txt.
