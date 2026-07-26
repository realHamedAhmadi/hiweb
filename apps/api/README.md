# apps/api

Backend API — Express + TypeScript, implementing the endpoints proposed
in `backend-architecture.md` against the Prisma schema in
`packages/database`.

## Status: real code, NEVER RUN
Every file described below has been written and is internally
consistent (relation names checked, imports verified against
`@hiweb/database`'s actual exports) — but **none of it has been
executed**. This environment has no network access, so `npm install`
has never run for this package, there is no `node_modules`, and
therefore no way to start the server or catch a runtime error that
only appears once real packages are installed.

## Before this can run at all
1. `packages/database` must be built first — see its README. `apps/api`
   imports from `@hiweb/database`, which doesn't resolve until that
   package's `dist/` exists.
2. A real PostgreSQL database must exist and be migrated (also in
   `packages/database`'s README).
3. `.env` must be populated from `.env.example` — in particular
   `JWT_ACCESS_SECRET` (auth will throw immediately without it — see
   "fail closed" comment in `src/lib/jwt.ts`).

```bash
# from repo root, in order:
cd packages/database && npm install && npm run build && npm run migrate:dev
cd ../../apps/api && npm install
cp .env.example .env   # then fill in JWT_ACCESS_SECRET at minimum
npm run dev
```

## What's implemented
- **Auth** (`/auth/pi-login`, `/auth/refresh`, `/auth/logout`) — the
  JWT-access + refresh-token-in-httpOnly-cookie mechanism decided in
  `authentication-architecture.md` Section 2, with refresh token
  rotation and hashed storage (`RefreshToken.tokenHash`, never
  plaintext).
- **Users** — self-service `GET/PATCH /users/me` only, per MVP scope.
- **Service Requests** — create, list (own vs. all, by role),
  read-only timeline (`/service-requests/:id/history`), and admin-only
  status change — implementing the Decided MVP rule from
  `request-workflow.md` Section 4 (every transition is admin-triggered,
  no user self-service yet).
- **Quotations** — admin-only create (auto-manages
  `Quotation.isCurrent`, auto-advances the request to
  `QUOTATION_SENT`), list.
- **Service Categories & Portfolio Projects** — public read (published
  only, or everything if the requester is an authenticated admin),
  admin-only create/update. No delete endpoint exists on purpose —
  content is archived (`publishStatus: ARCHIVED`), never hard-deleted.
- **Settings** — admin-only list/update, backing `SettingEntry`.
- **Audit Logs** — admin-only, read-only (no write/delete route
  exists — entries are only ever created as a side effect of other
  actions).
- **Security controls actually wired in**: CORS restricted to
  `APP_URL`, general rate limiting on all routes + a stricter limit on
  `/auth/pi-login`, input validation via `zod` on every endpoint that
  accepts a body, object-level authorization on Service Requests and
  Quotations (a user-role request 404s on another user's record rather
  than 403ing — deliberately not confirming the record exists),
  standardized error responses that hide internals outside development.

## The one deliberate stub: Pi Network verification
`src/lib/piNetwork.ts`'s `verifyPiAccessToken` always throws. This is
not an oversight — it's the single piece of this backend that cannot
be honestly implemented without a real Pi Developer account, real
credentials, and network access to Pi's Platform API, none of which
exist in this environment. Every other piece of the auth flow (user
lookup/creation, JWT issuance, refresh rotation) is real and ready —
only this one verification call needs to be replaced with an actual
HTTP call before login can ever succeed. See the file's own header
comment for what that replacement needs to do.

## Known architecture deviations from backend-architecture.md
- No separate `repositories/` layer — Prisma calls happen directly
  inside `services/`. The originally proposed layered structure
  included a repository layer between services and the database; this
  implementation collapsed that distinction as unnecessary overhead at
  this project's current size, not as an oversight.
- `RequestStatus` enum values are UPPER_CASE (Prisma convention) while
  `packages/ui`'s `StatusBadge` expects lowercase snake_case (e.g.
  `"quotation_sent"`). No mapping layer exists yet — API responses
  currently return the raw Prisma value as-is. This will need a
  translation step wherever `apps/web` starts consuming real API data
  instead of its current hardcoded placeholders.

## Not implemented / explicitly out of scope for this pass
- Pi Network verification (see above — the one real blocker)
- Structured logging / log aggregation (Section 14) — currently just
  console.log/console.error
- Pagination beyond a simple limit/offset on the audit log list
- API versioning, OpenAPI/Swagger documentation
- Enforcement of request-workflow.md's proposed transition table — any
  ServiceRequest.status can currently move to any other status; that
  table is still explicitly a first draft, not a locked rule set

## Tests
`npm test` runs Vitest against `src/**/*.test.ts`. Coverage is
intentionally narrow, not comprehensive (Section 16 — Testing & QA —
remains a separate, largely undesigned area):
- `lib/hash.test.ts` — token hashing determinism/uniqueness
- `lib/devAuth.test.ts` — the dev-login double-guard logic
  specifically, since that file's own header calls it the single most
  dangerous file in this backend if misconfigured
- `validation/schemas.test.ts` — a sample of zod schema validation

Never run — same network limitation as everything else here.
