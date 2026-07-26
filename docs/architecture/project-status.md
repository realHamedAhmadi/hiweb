# Hiweb — Project Status

Living summary of what's actually built, current architecture state, and
what comes next. Other docs (`repo-structure.md`, `design-system.md`,
and each package's `README.md`) explain *why* things are structured a
certain way; this file tracks *what stage* the project is at.

Last updated: after review pass on Sections 5/6/3/18/4/17 drafts,
resolving 2 real gaps (missing endpoints, missing `isCurrent` field)
and deciding 3 previously-open questions (session mechanism, MVP
transition triggers, deployment shape).

---

## 0. Approved architecture decisions (not yet implemented in code)

- **Settings Management module** — `SettingEntry` entity added to
  `database-design.md` (Section 1.8); backs a future Admin Dashboard
  settings screen. Key/value store; actual setting list not decided.
- **Audit Log for admin actions** — `AuditLog` entity, previously a
  proposal in `security-architecture.md`, now approved and formalized
  in `database-design.md` (Section 1.7).
- **Request timeline** — `ServiceRequestStatusHistory` entity added
  (`database-design.md` Section 1.6), recording every status
  transition with timestamp and who triggered it — distinct from the
  general-purpose `AuditLog`.
- **Slug + publish status for content entities** — `ServiceCategory`
  and `PortfolioProject` both gained a `slug` field and a three-state
  `publishStatus` (`draft`/`published`/`archived`), replacing the
  earlier simple `isActive`/`isPublished` booleans.
- **`Quotation.isCurrent`** — resolves the previously-flagged gap
  around identifying which quotation is active when a request has
  multiple (`database-design.md` Section 1.4).
- **Session mechanism** — JWT access token (short-lived) + refresh
  token in an `httpOnly` cookie (`authentication-architecture.md`
  Section 2), chosen over a pure server-side session specifically
  because Phase 3 already commits to native mobile apps.
- **MVP transition triggers** — every `ServiceRequest` status change is
  admin-triggered at MVP; no user self-service until Phase 2's User
  Dashboard exists (`request-workflow.md` Section 4).
- **Deployment shape** — `apps/web` on a managed platform (Vercel-
  style), `apps/api` containerized via Docker
  (`infrastructure-architecture.md` Section 2). Specific hosting
  vendor still open.

None of these are implemented in code yet — documentation only.

## 0b. Real backend code now exists (apps/api + packages/database)

**`packages/database/prisma/schema.prisma`** — complete Prisma
implementation of every approved entity, plus `RefreshToken` (added to
support the session mechanism below).

**`apps/api`** — a full Express + TypeScript API implementing every
endpoint proposed in `backend-architecture.md`: Pi Login (JWT access +
rotating refresh token in an httpOnly cookie), self-service user
profile, Service Requests (create/list/read-only timeline/admin-only
status change — enforcing the Decided MVP rule that every transition
is admin-triggered), Quotations (auto-manages `isCurrent`, auto-
advances status), Service Categories & Portfolio Projects (public read
of published content, admin-only writes, no hard delete — archive
instead), Settings, and read-only Audit Logs. CORS, rate limiting
(general + a stricter limit on login), zod input validation, and
object-level authorization (not just role checks) are all wired in.

**The one deliberate stub:** `src/lib/piNetwork.ts`'s
`verifyPiAccessToken` always throws — real Pi Platform API
verification cannot be built without real Pi Developer credentials and
network access, neither of which exist in this environment. Every
other part of the auth flow is real and ready for it.

**Caught and fixed during this pass, not left in:** a `SettingEntry`
model that got accidentally deleted while adding `RefreshToken` (and
the resulting missing back-relation on `User`), and an incorrect
`as object` type cast on `SettingEntry.value` that would have broken
for any non-object setting value (a string, number, or boolean).

**Not verified:** `npm install` has never run for `apps/api` (no
network access in this environment), so nothing here has actually been
executed. The code is internally consistent (every import checked
against what `@hiweb/database` actually exports, every relation name
matched on both sides) but unverified against a real Node process. See
`apps/api/README.md` for the exact commands to actually run this, and
its "Known architecture deviations" section for two intentional
simplifications (no separate repository layer; `RequestStatus` enum
casing doesn't yet match `StatusBadge`'s expected format).

## 0c. Frontend now wired to fetch real API data (with fallback)

`apps/web/src/lib/api.ts` — a resilient fetch helper (3s timeout, fails
to `null` on any error) used by the **Services** and **Portfolio**
pages, which now attempt `GET /service-categories` and
`GET /portfolio-projects` respectively before falling back to their
original hardcoded placeholder arrays. Since `apps/api` has never
actually been started anywhere, this fallback path is what will run in
practice right now — but the moment a real API responds at the
configured `API_URL`, these two pages render real data with no further
frontend changes needed. Home page's preview sections and the Contact
form's actual submission were deliberately left untouched at this
stage — Contact requires an authenticated user, and Pi Login wiring
(below) came after this.

## 0d. Pi Login now wired client-side (frontend real, backend still stubbed)

`apps/web` now has a real `AuthProvider` (`src/context/AuthContext.tsx`)
wrapping the whole app, a real Pi SDK client wrapper
(`src/lib/piSdk.ts`), and a real client-side auth API layer
(`src/lib/authApi.ts`). The Header's "Login with Pi" button is no
longer a dead placeholder — it calls the actual Pi SDK authentication
popup (loaded via a real `<Script>` tag in `layout.tsx`), then sends
the resulting token to `apps/api`.

**What's genuinely real:** the Pi SDK call itself, session restore on
page load via the httpOnly refresh cookie, in-memory (not
localStorage) access token storage per
`authentication-architecture.md` Section 2, and a visible
logged-in/logged-out/error state in the Header.

**What will fail today, by design:** the moment the frontend sends the
Pi-issued token to `apps/api`'s `/auth/pi-login`, it hits
`verifyPiAccessToken`'s intentional stub and returns a 501 — surfaced
in the Header as a visible error message rather than a silent failure.
This is the same documented gap as before, now reachable from a real
button instead of a dead one.

**Caught and fixed while building this:** `AuthControl` was initially
written as a component function defined inside `Header`'s own function
body — a React anti-pattern (new function identity every render,
causing unnecessary remounts). Converted to a plain render function
(`renderAuthControl()`) instead.

## 0e. Admin Dashboard built (client-side, gated, unreachable until login works)

`apps/web/src/app/admin/*` — a full admin UI: an overview landing
page, and dedicated pages for Service Requests (view + change status,
enforcing the Decided MVP admin-only rule), Service Categories,
Portfolio Projects (both with create forms + publish-status control),
Settings (generic JSON key/value editor), and a read-only Audit Log.
All backed by a new `src/lib/adminApi.ts` client (bearer-token
authenticated calls to every admin endpoint already built in
`apps/api`).

**Gated by `app/admin/layout.tsx`**, which checks `useAuth()` for
`status === "authenticated" && role === "ADMIN"` before rendering
anything else. Explicitly documented in that file: this is a
client-side UX guard only, not the real security boundary — actual
enforcement is `apps/api`'s `requireRole("ADMIN")` middleware, which
already exists independently of this UI.

**Currently unreachable in practice**, same root cause as before: Pi
Login's backend verification is still stubbed, so nobody can actually
reach `"authenticated"` status yet. Built now anyway so it's ready the
moment that's resolved.

**A real, systemic bug caught and fixed while building this:**
`React.FormEvent` / `React.ReactNode` were used as types in **6
files** — including the root `layout.tsx`, written much earlier in
this project — without ever importing `React`. Whether that compiles
depends on TypeScript's UMD global-resolution behavior, which
couldn't be verified without actually running `tsc`. Rather than leave
that ambiguous, every occurrence was replaced with an explicit
`import type { FormEvent }` / `import type { ReactNode }` from
`"react"`. A full repo-wide grep after the fix confirmed zero remaining
unimported `React.` usages.

## 0f. Remaining buildable items completed

- **About page** — real content (Section 1, Items 1/3/4), using the 6
  value-prop points not already shown on Home's Trust section.
- **Individual Service/Portfolio detail pages** (`/services/[slug]`,
  `/portfolio/[slug]`) — required adding `GET /:slug` endpoints to
  `apps/api` (both controllers + routes) that didn't exist before.
- **Contact form wired to real API** — gated behind login; a bug in
  the first draft (the submit handler never actually called the API)
  was caught and fixed before this shipped.
- **Dev-only login bypass** (`POST /auth/dev-login`) — double-guarded
  (`NODE_ENV` + `ENABLE_DEV_LOGIN`, both required), returns 404 not 403
  when disabled, documented as an explicit exception in
  `security-architecture.md` Section 7b. Frontend gated the same way
  via `NEXT_PUBLIC_ENABLE_DEV_LOGIN`. A duplicated cookie-name constant
  was caught and extracted to a shared `lib/constants.ts` while
  building this.
- **Docker** — `apps/api/Dockerfile` (multi-stage) + a local-dev-only
  `docker-compose.yml` (Postgres + api; apps/web deliberately excluded,
  per the managed-platform deployment decision).
- **CI** — `.github/workflows/ci.yml`: install → build
  packages/database → typecheck both apps → run apps/api's test suite
  → dependency audit.
- **`packages/types`** — populated with real shared DTOs; explicitly
  not yet adopted by existing `any`-typed call sites (flagged, not
  silently left inconsistent).
- **`packages/config`** — a shared `tsconfig.base.json`; explicitly not
  yet adopted by any existing package's tsconfig.
- **Real tests** — Vitest added to `apps/api`; three test files
  (`hash.test.ts`, `devAuth.test.ts` — covering the double-guard logic
  specifically, since that's the highest-risk file in the backend —
  and `schemas.test.ts`).
- **Root-level accuracy fixes** — `package.json` scripts (previously
  all "Not yet configured" placeholders) and `README.md` (previously
  still describing "foundation/scaffolding stage") both rewritten to
  match reality.

**Bugs caught and fixed during this pass, not left in:** the Contact
form's non-functional submit handler; a duplicated cookie-name
constant; an inaccurate code comment referencing a file
(`devAuth.service.ts`) that doesn't exist (the real files are
`lib/devAuth.ts` and `controllers/devAuth.controller.ts`).

---

## 1. Completed frontend pages (`apps/web`)

| Route | Status | Notes |
|---|---|---|
| `/` (Home) | ✅ Built | Hero, Services preview, Portfolio preview, Trust/Security, CTA — real copy pulled from the approved spec where decided content exists |
| `/services` | ✅ Built | Overview + 3 service category cards (from Section 1, Item 5); individual per-service detail pages not started |
| `/portfolio` | ✅ Built | 6 placeholder project cards; no real case studies exist yet — waiting on Admin Portfolio Management |
| `/contact` | ✅ Built | Form UI (name, email, service interest, project details) — **not wired to any backend**; `onSubmit` only calls `preventDefault()` |
| `/about` | 🟡 Route stub only | No content built yet |

**Shared layout components:**
- `Header` — ✅ Full nav, active-route highlighting, mobile menu (with Escape-to-close), language switcher placeholder, Pi Login button placeholder (no auth wired)
- `Footer` — ✅ Brand area, nav links (shared with Header via `navLinks.ts`), legal placeholders (Terms/Privacy — no routes exist), social icon placeholders (disabled, not linked anywhere)

## 2. Current architecture status

**Frontend (`apps/web`):**
- Next.js 14 (App Router) + TypeScript + Tailwind — configured and in use
- Design tokens (`@hiweb/ui`) wired into `tailwind.config.ts` and used consistently across every page built so far
- `transpilePackages: ["@hiweb/ui"]` set in `next.config.js` so the workspace package resolves correctly

**Design system (`packages/ui`):**
- Tokens: colors, typography (unified Vazirmatn for Latin/Arabic/Persian), radius — all in use
- Components: `Button`, `Card` (+Header/Body/Footer), `StatusBadge` (all 8 request statuses), `NodeMark` (signature element)
- All components use logical CSS properties (RTL-ready), but **no locale switching or `dir` attribute logic exists yet** — everything currently renders LTR only
- **Not yet built in `packages/ui`:** form inputs, selects, modals, nav, tables. The Contact page's form fields are raw HTML elements styled inline, not shared components — a candidate for extraction into `@hiweb/ui` once a second form exists

**Backend / database / infrastructure:**
- `apps/api` — folder scaffolded only (empty `src/`, placeholder README). No server, no routes, no framework installed.
- No database exists. No ORM configured. No schema written.
- No authentication of any kind — Pi Login button in the Header has no `onClick`, no SDK, no session logic.
- No CI/CD, no Docker, no deployment configuration.
- No environment variables are actually consumed by any code yet — `.env.example` lists anticipated keys only.

**What this means concretely:** every page that exists is fully static. Nothing persists, nothing calls an API, no data survives a page refresh. The project is a frontend shell with no working data layer.

## 3. Upcoming backend/auth phases (not started — sequencing proposal only)

These are recommended next phases, **not decisions** — each still requires the same section-by-section review used for Section 1, since Sections 3, 5, 6, and 18 in the Master Specification remain 🟡 Needs Discussion.

1. **Section 5 — Database design.** Needed first: the request-status model (Submitted → ... → Cancelled) has to exist as real schema before anything else can be built on top of it. Blocks Sections 6, 13, and the Contact form ever doing anything. **A draft entity/relationship proposal now exists at `database-design.md`** (User, ServiceCategory, ServiceRequest, Quotation, PortfolioProject) — still needs the same Decided/Needs Discussion review Section 1 went through.
2. **Section 6 — Backend/API architecture.** Framework choice, API style, and whether `apps/api` stays a separate Node service (as scaffolded) or changes shape. **A draft proposal now exists at `backend-architecture.md`** (REST, resource-based endpoint groups, layered `apps/api` structure) — still needs review.
3. **Section 3 — Authentication.** Pi Login is already committed at MVP (Section 1, Item 6) — this phase turns the placeholder Header button into a real flow. **A detailed draft now exists at `authentication-architecture.md`** — Pi Login flow including failure branches, a session-mechanism comparison (cookie vs. JWT, undecided), security considerations, and identity/`piUid` handling.
4. **Section 18 — Pi Network integration detail.** SDK scope, sandbox vs. mainnet, and how Pi Login connects to whatever auth system comes out of Section 3.
5. **Section 13 — Admin Dashboard.** Needs the database (Section 5) and auth (Section 3) in place first; this is what will eventually populate the Services and Portfolio pages with real content instead of placeholders.

Also see `request-workflow.md` for the full Workflow Engine draft —
status meanings, `ServiceRequest`/`Quotation` lifecycle, and a proposed
(not decided) transition table. It flags one major open question that
affects everything above it: whether any status transitions are
user-triggered at MVP at all, given no User Dashboard exists yet
(that's Phase 2), or whether every transition is admin-triggered on
the user's behalf until then.

A **Section 4 (Security) draft now exists at `security-architecture.md`**
— application security principles, API security, a two-layer
(role-level + object-level) authorization model, admin-account
protections, data protection, and a proposed `AuditLog` entity closing
the audit-logging gap flagged in both `database-design.md` and
`authentication-architecture.md`.

A **Section 17 (Deployment & DevOps) draft now exists at
`infrastructure-architecture.md`** — dev/staging/production
environments (including Pi sandbox-vs-mainnet tied to environment,
answering part of the Section 18 question), a proposed deployment
shape for `apps/web` vs. `apps/api`, a CI/CD pipeline concept for the
already-scaffolded (empty) `infrastructure/ci/` and
`.github/workflows/` folders, and secrets/configuration handling.

No code exists yet for any of these five phases.
