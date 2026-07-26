# Hiweb

Professional digital services platform for the Pi Network ecosystem.

This repository is a monorepo containing the web frontend, backend
API, database schema, and shared packages for Hiweb.

## Status
Full frontend, backend, database schema, and admin dashboard have been
built (code complete). **None of it has been run** — this development
environment has no network access, so dependencies have never been
installed and nothing has been executed against a real database or
Node process. See `/docs/architecture/project-status.md` for the
authoritative, detailed breakdown of what's real vs. stubbed.

**The one deliberate gap:** real Pi Network token verification
(`apps/api/src/lib/piNetwork.ts`) requires a genuine Pi Developer
account and network access, neither available here — everything
around it is built and ready.

## Getting started (on a machine with internet access)
```bash
# 1. Database
cd packages/database && cp .env.example .env   # fill in DATABASE_URL
npm install && npm run build && npm run migrate:dev

# 2. Backend
cd ../../apps/api && cp .env.example .env       # fill in JWT_ACCESS_SECRET at minimum
npm install && npm run dev

# 3. Frontend (separate terminal)
cd apps/web && cp .env.example .env
npm install && npm run dev
```
Then open `http://localhost:3000`. See each package's own README for
full details, and `apps/api/README.md` for a dev-only login bypass
that lets you test the admin dashboard without a real Pi account.

## Structure
See `/docs/architecture/repo-structure.md` for a full explanation of
every folder in this repository, and `/docs/architecture/` generally
for the full set of architecture decisions this project is built on.

## Specification
The approved Hiweb Master Specification lives in `/docs/specification/`.
