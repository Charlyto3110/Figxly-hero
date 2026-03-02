# Figxly docs SPA (MVP estático)

## Ejecutar local
Abre `docs/index.html` directamente en el navegador (router hash `#/`).

## Roles de prueba (dev)
Usa el selector de rol del header para cambiar entre:
- cliente
- ingeniero
- tecnico
- transportista

También puedes iniciar sesión mock en `#/auth/login` con usuarios semilla.

## Rutas principales
- `#/` Home / servicios
- `#/request/new?service=plomeria` crear solicitud
- `#/requests` solicitudes del cliente
- `#/request/:id` detalle + timeline
- `#/request/:id/schedule` agenda
- `#/request/:id/payment` pago consulta mock ($500)
- `#/request/:id/chat` chat grupal
- `#/request/:id/review` reseña/favoritos
- `#/request/:id/dispute` reclamo con evidencia
- `#/dashboard` panel por rol
- `#/dashboard/inbox` asignación de casos/viajes
- `#/dashboard/request/:id` detalle operativo
- `#/dashboard/request/:id/status` actualización de estados
- `#/account`, `#/account/favorites`, `#/account/settings`

## Flujo MVP
1. Cliente crea solicitud con descripción, ubicación y fotos.
2. Ingeniero y técnico aceptan desde inbox.
3. Cliente agenda y paga consulta ($500 mock).
4. Se habilita chat grupal.
5. Roles actualizan estados (en camino/trabajando/completado).
6. Cliente cierra con reseña/favoritos o abre reclamo con evidencia.
7. Reclamo se resuelve mock (fix/refund).
