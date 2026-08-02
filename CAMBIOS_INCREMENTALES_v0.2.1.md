# TORO MINING Dashboard v0.2.1

Cambio incremental aplicado sobre la versión 0.2.0 de Mina San Bernardo.

## Alcance implementado

### Etiquetas operativas RAG

Los contratos y códigos internos permanecen sin cambios:

- `green`
- `yellow`
- `red`
- `critical`

La representación visible se centralizó como:

- `green`: **En objetivo**
- `yellow`: **Precaución**
- `red`: **Alerta**
- `critical`: **Crítico**

La misma presentación se utiliza en tarjetas, tablas, catálogo, detalle de KPI y Reporte Operativo PDF. Los estados técnicos conservan su terminología contextual, por ejemplo `Operando`, `Detenido`, `Advertencia`, `Alarma` y `Sin comunicación`.

### Personalización del Resumen

Se agregó el control **Personalizar resumen** únicamente en la ruta Resumen.

Permite:

- mostrar u ocultar bloques completos;
- reordenarlos mediante **Subir** y **Bajar**;
- consultar el número de secciones ocultas;
- restaurar el diseño predeterminado.

La preferencia se almacena en:

```text
toro-mining-summary-layout-v1
```

La sección **Estado y alarmas relevantes** no se puede ocultar. La identificación del escenario demo, el estado de conexión, los datos desactualizados y los errores de carga continúan fuera del área personalizable.

## Archivos principales modificados

- `frontend/src/components/StatusBadge.tsx`
- `frontend/src/components/ProcessFlow.tsx`
- `frontend/src/components/SummaryCustomizer.tsx`
- `frontend/src/hooks/useSummaryLayout.ts`
- `frontend/src/pages/SummaryPage.tsx`
- `frontend/src/styles/global.css`
- `frontend/src/utils/statusPresentation.ts`
- `frontend/src/utils/summaryLayout.ts`
- `frontend/tests/presentation.test.cjs`
- `backend/app/services/report_service.py`
- `backend/tests/test_scenarios.py`
- `README.md`
- `VALIDATION.md`

También se regeneraron `frontend/dist` y los dos PDF de muestra.

## Elementos que no se modificaron

- Contratos de escenario `startup` y `target`.
- Cálculos y valores de datos demo.
- Consumo de API y rutas existentes.
- Selección y persistencia del escenario.
- Lógica funcional del reporte, salvo las etiquetas visibles de RAG.
- Tema claro/oscuro.
- Pantallas distintas de Resumen.

## Validación

- Compilación Python correcta.
- 10 pruebas backend aprobadas.
- 4 pruebas enfocadas de presentación aprobadas.
- Bundle offline regenerado con 44 módulos.
- Resumen comprobado en ambos temas, ambos escenarios, 1920x1080 y 1366x768.
- Persistencia, ocultamiento, reordenamiento y restauración comprobados.
- Cero errores de consola en la validación visual final.
- Dos PDF reales generados y revisados, tres páginas A4 cada uno.

Consulta `VALIDATION.md` para el detalle y las limitaciones del entorno de construcción.
