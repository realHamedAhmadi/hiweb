# Hiweb — Security Architecture (Draft)

Status: **Draft proposal for Section 4 (Security)** — a starting point
for review, not a final decision. Section 4 remains 🟡 Needs Discussion
in the Master Specification.

Builds directly on `database-design.md` (entities), `backend-architecture.md`
(API structure, roles/permissions concept), `authentication-architecture.md`
(Pi Login, sessions), and `request-workflow.md` (status transitions,
the open question about who can trigger them). No code, no
implementation — this document only describes principles and
proposed mechanisms.

---

## 1. Application security principles

- **Never trust client input.** Every request body, query parameter,
  and header is treated as untrusted until validated server-side —
  this applies as much to a `ServiceRequest.projectDetails` field as
  to an authentication token.
- **Fail closed, not open.** If a check can't be completed (auth
  verification fails, Pi's Platform API is unreachable, an
  authorization lookup errors), the default is to deny the action, not
  allow it — already stated for login in `authentication-architecture.md`
  Section 1; this principle applies platform-wide, not just at login.
- **Least privilege.** A `User` with `role: user` should be unable to
  reach admin-only data or actions even if they discover an endpoint
  URL — enforcement happens server-side (Section 3 below), never by
  hiding a button in the frontend.
- **Defense in depth.** No single control (e.g. a role check) is the
  only thing standing between a request and unauthorized access —
  authorization, input validation, and audit logging (Section 6 below)
  are layered, not substitutes for each other.
- **Minimal data retention.** Already stated in
  `authentication-architecture.md` for Pi Login specifically — restated
  here as a platform-wide principle: don't store data because it might
  be useful someday; store what the product actually uses.

## 2. API security

- **Transport security.** HTTPS/TLS on every endpoint, no exceptions —
  restates `authentication-architecture.md` Section 3, extended to all
  of `apps/api`, not just auth routes.
- **Input validation at the API boundary.** Every proposed endpoint in
  `backend-architecture.md` Section 1 needs request validation before
  reaching business logic — exact validation library/approach not
  decided, but the principle is that validation happens in one place
  per request (the `middleware`/`controllers` layer proposed there),
  not scattered ad hoc.
- **Standardized error responses that don't leak internals.** Section
  6's open item ("standardized error response format" — not yet
  decided) has a security dimension: error messages should never
  expose stack traces, database details, or internal file paths to
  the client, regardless of what format is eventually chosen.
- **Rate limiting.** Already specified for the login endpoint in
  `authentication-architecture.md` Section 3 — proposed here to extend
  to all public-facing endpoints, especially `POST /service-requests`
  (the Contact-page-driven endpoint), which is otherwise a target for
  spam submissions with no auth barrier if requests are ever allowed
  from unauthenticated users (still an open question per
  `backend-architecture.md` Section 2).
- **CORS policy.** `apps/api` should only accept browser requests from
  Hiweb's own frontend origin(s) — exact origin list depends on
  deployment domains, not decided (Section 17).
- **SSRF awareness for outbound calls.** The one outbound server-to-
  server call already designed — backend verifying a Pi access token
  against Pi's Platform API (`authentication-architecture.md` Section
  1, Step 5) — should call a fixed, allowlisted Pi endpoint, never a
  client-influenced URL.
- **Dependency vulnerability scanning.** Listed in the original
  requirements checklist (Section 4) as a CI-integrated concern —
  ties to Section 17 (Deployment/DevOps), which hasn't been designed
  yet; flagged here as a dependency, not solved here.

## 3. Authorization

Two layers, both required — one is not a substitute for the other:

**Role-level (coarse):** matches the table already proposed in
`backend-architecture.md` Section 3 — e.g. only `role: admin` may call
`POST /service-categories`. Enforced server-side, in the `middleware`
layer proposed in `backend-architecture.md` Section 1, before a
request reaches business logic.

**Object-level (fine-grained):** role alone is not sufficient. A
`user`-role request to `GET /service-requests/:id` must also confirm
the requesting `User.id` matches that `ServiceRequest.userId` (per
`database-design.md`) — otherwise any logged-in user could read any
other user's request by guessing/incrementing an ID. This applies to
every "own records only" row in the `backend-architecture.md`
permissions table (Service Requests, Quotations, own profile).

**Authorization must gate whatever the answer turns out to be for the
open question in `request-workflow.md` Section 4** (whether users can
trigger any status transitions at MVP, or everything is admin-only).
Whichever way that's resolved, the authorization layer is what
actually enforces it — this document doesn't resolve that question,
only notes that the enforcement point is here.

## 4. Admin protection

Admin accounts carry disproportionate risk — broad read/write access
across `ServiceCategory`, `PortfolioProject`, all `ServiceRequest` and
`Quotation` records (per `database-design.md`). Proposed protections:

- **Admin role is never self-granted.** Already stated in
  `authentication-architecture.md` Section 3 ("Pi Login proves
  identity, never authorization") — restated and extended here: there
  is no signup flow that results in `role: admin`. Every `User`
  defaults to `role: user`; elevation is a separate, deliberate,
  out-of-band action. Mechanism (manual database edit vs. an internal
  invite flow) is explicitly not decided, per that document.
- **Every admin action should be attributable and logged.** See
  Section 6 (Audit logging) below — this is the primary mitigation
  against a compromised or malicious admin account, since prevention
  alone (role checks) can't cover every case.
- **Admin impersonation** — flagged as an open item in the original
  Users & Roles checklist (Section 2) and not designed here. If ever
  built (e.g. an admin viewing the platform "as" a user for support
  purposes), it should be logged distinctly from normal admin actions,
  not silently.
- **Consider step-up/re-authentication for high-impact admin actions**
  (e.g. changing another user's `role`, if that ever becomes a UI
  action rather than a manual process) — proposed as worth designing,
  not committed to, since the session mechanism itself
  (`authentication-architecture.md` Section 2) isn't decided yet
  either.
- **Rate limiting and input validation apply to admin requests too.**
  An admin account is a higher-value target, not an exemption from
  the controls in Section 2 above.

## 5. Data protection

- **Encryption in transit** — covered under API security (Section 2).
- **Encryption at rest** — for whichever database technology is
  eventually confirmed (PostgreSQL proposed, not decided, per
  `repo-structure.md`); specific mechanism (full-disk vs. column-level
  for particularly sensitive fields) not decided.
- **PII minimization on `User`** — per `database-design.md`, `User`
  already stores only `piUid`, `displayName`, `email` (optional),
  `role`, `accountStatus`. No unnecessary personal data fields
  proposed beyond this.
- **Secrets management** — API keys, database credentials, and any
  future Pi Network credentials should never live in source code;
  `.env.example` already establishes the pattern of environment
  variables, but the actual secrets storage mechanism in production
  (plain env vars vs. a secrets manager/vault) is a Section 17
  deployment decision, not made here.
- **Sanitization of admin/CMS-authored content.** `ServiceCategory`
  and `PortfolioProject` content (per `database-design.md`) is
  displayed on public pages. If any rich-text/HTML input is ever
  allowed for these fields (vs. plain text, which is what's assumed
  today), it must be sanitized server-side before storage or before
  rendering, to prevent stored XSS — flagged since Section 12 (CMS)
  hasn't addressed content format yet.
- **Backup and retention policy** — Section 15 territory, not
  addressed here; noted only as a dependency.

## 6. Audit logging

**Approved decision.** Originally proposed here as a gap-closing
measure (referencing gaps flagged in both `database-design.md` Section
3 and `authentication-architecture.md` Section 3) — the `AuditLog`
entity is now approved and formalized as a real entity in
`database-design.md` Section 1.7. This section keeps the operational
guidance (what to log, at minimum) without duplicating the field
table, which now lives in `database-design.md` as the single source of
truth for the entity's shape.

Also approved alongside it: **`ServiceRequestStatusHistory`**
(`database-design.md` Section 1.6) — a dedicated timeline specifically
for `ServiceRequest` transitions, distinct from the broader `AuditLog`.
Both may record the same event for different purposes: `AuditLog` for
security/compliance, `ServiceRequestStatusHistory` for a user/admin-
facing timeline view.

**What should be logged, at minimum:**
- Authentication events (success, failure) — per
  `authentication-architecture.md` Section 3
- Every `ServiceRequest.status` change — who triggered it, from what,
  to what (directly supports resolving disputes about the open
  transition-trigger question in `request-workflow.md`)
- Every `Quotation` creation
- Every admin write to `ServiceCategory` / `PortfolioProject`
- Failed authorization attempts (a `user`-role request hitting an
  admin-only endpoint, or attempting to access another user's
  resource) — these are potential probing/attack signals, not just
  errors

**Not decided:** retention period for audit logs, whether they're
queryable from the Admin Dashboard (Section 13, not yet built), and
whether `AuditLog` itself needs write-protection (should even an admin
be able to delete audit entries? Proposed: no — but not confirmed).

## 7. What this document does NOT decide

- Specific validation library/framework
- Rate limit thresholds (requests per minute, etc.)
- CORS allowed-origin list (depends on Section 17 deployment domains)
- Secrets management tooling (env vars vs. vault — Section 17)
- Encryption-at-rest mechanism (depends on Section 5 database
  technology confirmation)
- CMS content format (plain text vs. rich text — Section 12)
- Audit log retention and Admin Dashboard exposure
- Admin elevation mechanism (still open per `authentication-architecture.md`)

## 7b. Documented exception: dev-only login bypass

`apps/api`'s `POST /auth/dev-login` (`src/lib/devAuth.ts`) intentionally
bypasses Pi Network verification entirely — built to make the Admin
Dashboard and Contact form testable without a real Pi Developer
account. This is a deliberate exception to "never trust client input"
(Section 1) and "role is never derived from Pi Login itself" (Section
4), scoped as tightly as possible:

- Double-guarded: requires both `NODE_ENV !== "production"` AND
  `ENABLE_DEV_LOGIN === "true"` — both must hold, not either.
- Returns 404 (not 403) when disabled, so as not to confirm the route
  exists to anyone probing a real deployment.
- Both `.env.example` files default the corresponding flags to
  blank/unset — it requires deliberate opt-in, never on by accident.
- Frontend gating (`NEXT_PUBLIC_ENABLE_DEV_LOGIN`) only controls
  whether the UI buttons render — it is not itself a security control;
  the server-side double-guard is what actually matters.

**This exists only so the rest of the built system can be tested.**
It should never ship enabled in any real deployment — if this
project ever moves toward launch, removing (not just disabling) this
endpoint entirely is worth considering as a pre-launch checklist item.

## 8. Suggested next step
`AuditLog` and `ServiceRequestStatusHistory` are now approved entities
(`database-design.md` Sections 1.6–1.7) — the remaining open item is
their operational lifecycle (retention, Admin Dashboard exposure).
Review the rest of this document line by line — particularly Section 4
(Admin protection), since that carries the highest risk if implemented
incorrectly — before any API or authorization code is written.
