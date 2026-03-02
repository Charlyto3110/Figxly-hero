dev:
	docker compose -f infra/docker/docker-compose.yml up --build

seed:
	npm run db:seed
