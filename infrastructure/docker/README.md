# infrastructure/docker

Container definitions.

## Status
- ✅ `docker-compose.yml` — local development convenience (PostgreSQL +
  apps/api). NOT a production deployment manifest.
- ✅ Production Dockerfile for apps/api lives at `apps/api/Dockerfile`
  (not here) — colocated with the app it builds, per common convention.
- ❌ Never built or run anywhere — this environment has no Docker
  daemon and no network access to pull base images.
- ❌ apps/web deliberately has no Dockerfile — deploys to a managed
  platform per `infrastructure-architecture.md` Section 2, not a
  container.

## Local development
```bash
cd infrastructure/docker
docker compose up
```
Then run `apps/web` separately with `npm run dev` (not containerized).
