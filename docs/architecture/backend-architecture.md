# Hiweb — Backend Architecture (Draft)

Status: **Draft proposal for Section 6 (Backend/API), Section 3
(Authentication), Section 2 (Users & Roles), and the Section 1
architecture note (request/quotation workflow)** — a starting point for
review, not a final decision. All four remain 🟡 Needs Discussion in
the Master Specification until reviewed the same way Section 1 was.

Builds directly on `database-design.md` — entity names (`User`,
`ServiceCategory`, `ServiceRequest`, `Quotation`, `PortfolioProject`)
match that document exactly. No backend code or API implementation is
included here — this is architecture description only.

---

## 1. API architecture

**Style:** REST, organized by resource — one endpoint group per entity
from `database-design.md`. GraphQL was considered but REST keeps the
mapping to database entities direct and easier to review section by
section, matching how this project has approached everything else.
This is a **proposal**, not confirmed.

**Location:** `apps/api`, as a separate Node.js service from
`apps/web` (already scaffolded, empty). Internal layering proposal:

```
apps/api/src/
├── routes/          → HTTP route definitions, one file per resource
├── controllers/     → Request/response handling per route
├── services/        → Business logic (e.g. "create a ServiceRequest",
│                       "attach a Quotation") — where any future
│                       Workflow Engine rules would live
├── repositories/     → Data access layer (talks to the database)
└── middleware/       → Auth checks, error handling, request logging
```

This is a conventional layered structure, not yet confirmed against
Section 6's fuller checklist (monolith vs. modular vs. microservices —
this assumes the "modular monolith" framing already used in
`repo-structure.md`).

**Proposed endpoint groups** (illustrative — not a committed API
contract):

| Resource | Example routes | Notes |
|---|---|---|
| Auth | `POST /auth/pi-login` | See Section 2 (Authentication flow) below |
| Users | `GET /users/me`, `PATCH /users/me` | Self-service profile only at MVP; admin user management is a Section 2 open item |
| Service Categories | `GET /service-categories`, admin-only `POST`/`PATCH`/`DELETE` | Public read, admin-managed write |
| Service Requests | `POST /service-requests`, `GET /service-requests` (own, or all if admin) | See Section 4 (workflow) below |
| Quotations | `POST /service-requests/:id/quotations` (admin), `GET /service-requests/:id/quotations` | One request can have many quotations, per `database-design.md` |
| Portfolio Projects | `GET /portfolio-projects`, admin-only write | Public read, admin-managed write |
| Request Timeline | `GET /service-requests/:id/history` | Reads `ServiceRequestStatusHistory` (approved decision, `database-design.md` 1.6) — read-only, no write endpoint since history entries are created as a side effect of a status change, not directly |
| Settings | `GET /settings`, admin-only `PATCH /settings/:key` | Reads/writes `SettingEntry` (approved decision, `database-design.md` 1.8) — admin-only |
| Audit Log | `GET /audit-logs` (admin-only) | Reads `AuditLog` (approved decision, `database-design.md` 1.7) — no write endpoint, since entries are created as a side effect of other actions, never directly by a client |

**Not decided here:** exact request/response shapes, pagination
approach, versioning scheme (e.g. `/v1/...`), rate limiting, or the
standardized error response format — all still open Section 6 checklist
items.

## 2. Authentication flow (preparation only)

Conceptual flow for Pi Login, the MVP-committed auth method (Section 1,
Item 6). Described as a sequence, not implemented:

1. User initiates login in `apps/web` via the Pi SDK (client-side),
   which is Pi Network's own authentication widget — not something
   Hiweb builds itself.
2. Pi SDK returns an access token / user identifier to the frontend.
3. Frontend sends that token to the backend (`POST /auth/pi-login`).
4. Backend verifies the token against Pi's Platform API (server-to-
   server call to Pi Network, not yet designed — depends on Section 18
   sandbox vs. mainnet decision).
5. Backend looks up or creates a `User` record keyed by `piUid` (per
   `database-design.md`).
6. Backend issues a session of some kind back to the frontend (exact
   mechanism — signed cookie vs. JWT bearer token — **not decided**,
   a Section 3 open item).
7. Subsequent requests carry that session; backend middleware
   validates it and attaches the resolved `User` (with `role`) to the
   request context for authorization checks (Section 3 below).

**Explicitly not decided by this document:**
- Session/token type, expiry, and refresh strategy
- MFA (not applicable to Pi Login itself, but relevant if an email/
  password fallback is ever added — still open per Section 3)
- Sandbox vs. mainnet Pi Platform API usage (Section 18)
- What happens to a `ServiceRequest` submitted anonymously before
  login, if that's ever allowed — not addressed; current assumption is
  login is required before submitting a request, but that's an
  assumption, not a decision

## 3. User / Admin roles & permissions (concept)

Only two roles exist at MVP (`User.role`: `user` | `admin`), per
`database-design.md`. Section 2's fuller role list (moderator, support
staff, enterprise sub-accounts) is **not modeled** — this table covers
only what's already committed.

| Action | `user` | `admin` |
|---|---|---|
| View own profile / edit own profile | ✅ | ✅ |
| View/manage other users' profiles | ❌ | 🟡 Open — Section 2 doesn't yet define what "manage" means (suspend? edit? impersonate?) |
| Submit a `ServiceRequest` | ✅ (own only) | ✅ (on behalf of, if ever needed — not decided) |
| View `ServiceRequest` records | Own only | All |
| Change a `ServiceRequest.status` | ❌ | ✅ — but **which transitions are valid is still undefined** (see Section 4 below) |
| Create a `Quotation` | ❌ | ✅ |
| View `Quotation` records | Own request's only | All |
| Create/edit `ServiceCategory` | ❌ | ✅ |
| Create/edit `PortfolioProject` | ❌ | ✅ |

This table is a **starting concept**, not a permission matrix ready for
implementation — Section 2 review should confirm or revise every row,
especially the 🟡 marked one.

## 4. Request & quotation workflow structure

A **suggested** sequence connecting `ServiceRequest` and `Quotation`
(per `database-design.md`), shown as a flow — **not** the formal
transition rule set the Section 1 architecture note defers to a
Workflow Engine design. This is descriptive scaffolding for that future
discussion, not a substitute for it.

```
User submits ServiceRequest
        │
        ▼
   status: submitted
        │  (admin reviews)
        ▼
   status: under_review
        │  (admin prepares a Quotation record)
        ▼
   status: quotation_sent  ──── Quotation created, linked to this request
        │
        │  (user/admin decision — exact trigger not decided)
        ├──────────────┐
        ▼              ▼
  status: approved   status: rejected
        │
        ▼
  status: in_progress
        │
        ├──────────────┐
        ▼              ▼
  status: completed   status: cancelled
```

**What this section does NOT define** (left to the Workflow Engine
design, as already flagged in Section 1):
- Whether `cancelled` can be reached from every state or only some
- Whether a rejected request can be revived (new quotation → back to
  `under_review`) or is terminal
- Who can trigger each transition (admin only? can a user cancel their
  own request?)
- Whether multiple `Quotation` records on one request (revisions)
  re-trigger `quotation_sent`, or introduce a new status
- Any notification side effects (Phase 2 — Notifications module, not
  MVP)

## 5. What this document does NOT decide

- Database technology, schema details — see `database-design.md`
- API technology stack specifics beyond "Node.js" (framework choice —
  Express, Fastify, NestJS, etc. — not decided)
- Exact authentication token mechanism (Section 3)
- Pi Network sandbox/mainnet integration detail (Section 18)
- Full roles/permissions matrix beyond the two MVP roles (Section 2)
- Status transition rules (Workflow Engine — repeatedly deferred since
  Section 1)

## 6. Suggested next step
Review this document the same way Section 1 and `database-design.md`
were reviewed — section by section, Decided / Needs Discussion /
Deferred — before any API route or authentication code is written.
