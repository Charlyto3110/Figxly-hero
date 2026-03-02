# Figxly MVP Monorepo

Monorepo full-stack para marketplace de servicios técnicos (tipo Rappi/Airbnb/Uber) manteniendo el landing hero original en `docs/`.

## Estructura
- `apps/web`: React + Vite + Tailwind.
- `apps/api`: Express + TypeScript + Prisma.
- `infra/docker/docker-compose.yml`: web, api, postgres, redis, minio.
- `infra/nginx/figxly.conf`: reverse proxy Ubuntu 24.04.4.
- `docs/`: landing estático original (GitHub Pages compatible).

## Ejecutar local
1. `cp .env.example .env`
2. `npm install`
3. `docker compose -f infra/docker/docker-compose.yml up -d db redis minio`
4. `npm run db:migrate --workspace apps/api`
5. `npm run db:seed --workspace apps/api`
6. `npm run dev`

## Credenciales seed
- cliente: `cliente@figxly.com` / `secret123`
- técnico: `tecnico@figxly.com` / `secret123`

## Flujo MVP
- Registro/login: `/login` y `/registro`.
- Explorar: `/explorar`.
- Detalle + agenda: `/servicio/:id`.
- Booking estados: `requested/confirmed/completed/cancelled` con `PATCH /bookings/:id/status`.
- Reviews: `POST /reviews` (solo con booking completed).
- Soporte: `POST /support/tickets`.
- Pagos stub: `POST /payments/intent`, `POST /payments/confirm`.
- Reclamos stub: `POST /claims`, `PATCH /claims/:id/status`.

## Deploy Ubuntu 24.04.4 + Nginx
```bash
sudo apt update && sudo apt install -y nginx docker.io docker-compose-v2
sudo cp infra/nginx/figxly.conf /etc/nginx/sites-available/figxly.conf
sudo ln -s /etc/nginx/sites-available/figxly.conf /etc/nginx/sites-enabled/figxly.conf
sudo nginx -t && sudo systemctl reload nginx
```

Levanta web/api en servicios systemd o docker compose y enruta:
- `/` -> frontend
- `/api` -> backend
- `/assets` cacheado

## CI
GitHub Actions ejecuta `lint`, `test`, `build` para web y api.

## Notas de assets
No se incluyen binarios. Usa placeholders y agrega recursos según `assets/README.md`.
