# Figxly docs SPA MVP

## Rutas hash disponibles
- `#/` Hero (sin rediseño, ahora con navegación activa)
- `#/search`
- `#/results`
- `#/pro/:id`
- `#/schedule/:id`
- `#/checkout/:jobId`
- `#/job/:jobId/quote`
- `#/review/:jobId`
- `#/claims/:jobId`
- `#/auth/login`
- `#/auth/register`
- `#/dashboard`

## Cómo probar el flujo completo
1. En Hero completa búsqueda y pulsa **Buscar** (o usa tarjetas de categoría).
2. Si no hay sesión, entra por `#/auth/login` o `#/auth/register`.
3. En Search describe necesidad y sube fotos (mock base64 a localStorage).
4. En Results elige profesional y agenda una consulta de `$500`.
5. Paga en Checkout para pasar a Dashboard.
6. En Dashboard (rol Ingeniero/Técnico) abre **Crear presupuesto**.
7. En Quote selecciona actividades + extras. Si agregas extra, debes adjuntar evidencia.
8. Envía presupuesto. Como cliente puedes aceptarlo/rechazarlo; si aceptas va a checkout final.
9. Cierra con reseña y/o reclamo desde Dashboard.

## Persistencia localStorage
- auth/token/user
- role demo
- draftRequest
- jobs (incluye timeline, quote y estado)
- reviews
- claims
- quoteDrafts

## Editar catálogo del generador
Revisa `docs/modules/cost-generator/README.md` y modifica `catalog.js`.
