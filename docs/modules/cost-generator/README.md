# Cost Generator

Módulo aislado para crear cotizaciones.

## Editar catálogo
- Edita `catalog.js`.
- Cada actividad requiere: `id`, `rubro`, `nombre`, `unidad`, `precio_unitario_base`, `incluye`, `duracion_estimada_min`.
- Hay 4 rubros base con 10 actividades cada uno.

## Reglas
- Extras requieren evidencia (base64) antes de enviar.
- Usa `validateExtras` y `calculateQuote`.
