# Hiweb — Repository Structure Explained

This document explains *why* each folder exists, not what's currently
built inside it. For current build status (which pages exist, what's
wired up, what isn't), see `project-status.md` in this same folder.

## Top-level layout

```
hiweb/
├── apps/
│   ├── web/          → Frontend application (Next.js proposed)
│   └── api/           → Backend API service (Node.js proposed)
├── packages/
│   ├── ui/             → Shared UI component library
│   ├── types/          → Shared TypeScript types (frontend + backend)
│   ├── i18n/           → Translation resources (en, fa, ar, tr, fr)
│   ├── database/       → Prisma schema (added once Section 5 database design was approved — see database-design.md)
│   └── config/         → Shared lint/build/format configuration
├── infrastructure/
│   ├── docker/         → Container definitions
│   └── ci/             → CI/CD pipeline configuration
├── docs/
│   ├── specification/  → Approved specification documents
│   └── architecture/   → Architecture decisions and explainers (this file)
├── .github/workflows/   → GitHub Actions (CI/CD entry point, if GitHub used)
├── scripts/             → Developer tooling and automation
├── .env.example         → Template for required environment variables
├── .gitignore
├── package.json         → Monorepo workspace root
└── README.md
```

## Why a monorepo?

A single repository holding both frontend and backend, plus shared
packages, was chosen over separate repositories because:

- Shared types (`packages/types`) keep frontend and backend in sync as
  the request-status workflow (Submitted → ... → Cancelled) evolves —
  a change to that model updates once, not in two repos.
- Shared UI (`packages/ui`) and shared translations (`packages/i18n`)
  avoid duplication once a User Dashboard (Phase 2) and potentially a
  separate Admin app are added.
- Single CI/CD pipeline definition to start, rather than coordinating
  releases across multiple repos.

This is a **proposal**, not a locked-in architecture decision — it has
not yet gone through the formal Section 6 (Backend/API) review.

## Why apps/web and apps/api are separate (not one Next.js app)

Keeping the API as its own application, rather than using Next.js API
routes, means the backend can be:
- Scaled independently of the frontend under load
- Potentially split into multiple services later (Section 24 — Future
  Scalability) without a frontend rewrite
- Reused by a future mobile app (Phase 3) without duplicating logic

## What's intentionally NOT here yet

- No database schema (depends on Section 5 review)
- No authentication implementation (depends on Section 3 review)
- No API endpoints (depends on Section 6 review)
- No CI/CD pipeline logic (depends on Section 17 review)
- No Docker/deployment configuration (depends on Section 17 review)

(Frontend pages and shared UI components DO exist now — see
`project-status.md` for the current list. This section only covers
backend/infrastructure, which remains untouched.)

## Open decisions this structure assumes (pending confirmation)

| Assumption | Status |
|---|---|
| Next.js for frontend | Proposed, not yet formally decided |
| Node.js for backend API | Proposed, not yet formally decided |
| PostgreSQL + Prisma for database | Proposed, not yet formally decided |
| Monorepo (vs. separate repos) | Proposed, not yet formally decided |
| Separate `apps/api` (vs. Next.js API routes) | Proposed, not yet formally decided |

If any of these should change, the folder structure changes with them —
nothing beyond folder names and placeholder READMEs has been built.
