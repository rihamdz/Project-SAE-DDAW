This repository includes Docker and docker-compose support for local development.

Quick steps

1. Build images:

```bash
docker compose build
```

2. Start services (MySQL, backend, frontend):

```bash
docker compose up -d
```

3. Check logs:

```bash
docker compose logs -f backend
```

4. Rebuild only backend:

```bash
docker compose build backend && docker compose up -d backend
```

Notes
- Backend listens on port 8080 (mapped to host 8080).
- Frontend is served by nginx and exposed on host port 5173 (mapped to container 80).
- Database: MySQL 8.0 with credentials in `docker-compose.yml` (for local development only).
- Spring Boot reads datasource configuration from environment variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.

Security
- For production, do not store secrets in `docker-compose.yml`. Use Docker secrets or environment-specific configuration.

If you want, I can:
- Change the frontend mapping to port 80 (instead of 5173)
- Add a `.dockerignore` for backend and frontend
- Add a healthcheck for the backend service
