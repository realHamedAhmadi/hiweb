# packages/database

Prisma schema for Hiweb — implements every entity approved in
`/docs/architecture/database-design.md`.

## Status: schema + entry point written, NOT run
- ✅ `prisma/schema.prisma` — all 9 models (`User`, `ServiceCategory`,
  `ServiceRequest`, `Quotation`, `PortfolioProject`,
  `ServiceRequestStatusHistory`, `AuditLog`, `SettingEntry`,
  `RefreshToken`), matching `database-design.md` exactly, plus
  `RefreshToken` (added while implementing `apps/api`'s auth — see
  `authentication-architecture.md` Section 2)
- ✅ `src/index.ts` — re-exports `@prisma/client` (PrismaClient + all
  generated types) so the rest of the monorepo imports from
  `@hiweb/database`, not `@prisma/client` directly
- ❌ **`prisma generate` has never been run** — no Prisma Client has
  been generated, because this development environment has no network
  access to install `@prisma/client`/`prisma` in the first place
- ❌ **No database exists** — no PostgreSQL instance has been
  provisioned anywhere, so no migration has ever been run against a
  real database
- ❌ **No migration history exists** — `prisma migrate dev` has never
  been run, so there's no `prisma/migrations/` folder yet

## ⚠️ Build order matters — this package must be built before `apps/api` can run
`apps/api` imports from `"@hiweb/database"`, which resolves (via the
npm workspace symlink) to this package's `main` field —
`./dist/index.js`. That file **does not exist until this package is
built**. Skipping this step means `apps/api` will fail immediately on
its very first import.

## To actually use this (on a machine with internet access)
```bash
cd packages/database
cp .env.example .env
# edit .env with a real DATABASE_URL pointing at a running PostgreSQL instance
npm install
npm run build          # runs `prisma generate` then compiles src/ → dist/
npm run migrate:dev    # creates the database schema + initial migration
```
Only after `npm run build` has completed here will `apps/api`'s own
`npm run dev` be able to resolve `@hiweb/database` successfully.

## What this means concretely
This schema file is a **complete, ready-to-use definition** — but it
is unverified. It has not been checked against a running Prisma CLI,
so it's possible (though the schema follows standard Prisma syntax
closely) that a typo or a Prisma-version-specific quirk only surfaces
the first time someone actually runs `prisma generate` or
`prisma migrate dev` against it. Treat the first real run as a
validation step, not a formality.

## Design notes worth knowing before extending this schema
- **Table and column names are snake_case** (via Prisma's `@map`/`@@map`),
  while the schema itself uses camelCase field names — a common Prisma
  convention, not a deviation from `database-design.md` (which used
  camelCase names throughout; the underlying SQL naming is a
  presentation detail this file adds).
- **`RequestStatus` enum values must stay in sync with**
  `packages/ui`'s `StatusBadge` component (which uses lowercase
  snake_case string literals like `"quotation_sent"`) — Prisma enums
  are conventionally UPPER_CASE. `apps/api` currently returns the raw
  Prisma enum value as-is in API responses — no mapping layer exists
  yet between `"QUOTATION_SENT"` (API) and `"quotation_sent"`
  (`StatusBadge`'s expected prop) — flagged here so it isn't missed
  when `apps/web` is eventually wired to real API data.
- **No migration has ever been run**, so there is no risk yet of this
  schema conflicting with existing data — but the moment a first
  migration runs against a real database, future schema changes need
  to go through `prisma migrate dev` (new migration files), never by
  hand-editing a database that already has one.
