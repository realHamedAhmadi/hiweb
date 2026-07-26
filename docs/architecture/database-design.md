# Hiweb — Database & Backend Entity Architecture (Draft)

Status: **Draft proposal for Section 5 (Database & Data Architecture)
review** — this document is the starting point for that discussion, not
a final decision. Section 5 in the Master Specification remains 🟡
Needs Discussion until this is reviewed and approved the same way
Section 1 was.

This document defines *entities and relationships only* — conceptual
data modeling. It does not contain SQL, a Prisma schema, migrations, or
any other implementation. Technology choice (PostgreSQL + Prisma) is
still the proposal noted in `repo-structure.md`, not a decision made
here or anywhere else yet.

---

## 1. Entities

### 1.1 `User`
Represents anyone with an account — both regular users and admins share
one entity, distinguished by `role`, per the MVP scope (Section 1, Item
6: "User role, Admin role").

| Field | Conceptual type | Notes |
|---|---|---|
| `id` | identifier | Primary key |
| `piUid` | string | Pi Network user identifier from Pi Login (Section 1, Item 6 — MVP auth method). Exact shape depends on Section 18 (Pi Network Integration), still Needs Discussion. |
| `displayName` | string | |
| `email` | string, optional | Not required by Pi Login itself; may be collected via User Profile. Whether it's mandatory is a Section 3 (Authentication) open question. |
| `role` | enum: `user`, `admin` | Only two roles exist at MVP. Section 2 (Users & Roles) flags possible future roles (moderator, support staff, enterprise sub-accounts) — **not modeled here**, since that's still open. |
| `accountStatus` | enum: `active`, `suspended`, `pending`, `deleted` | Listed in Section 2 as an open question; included here as a placeholder field so the shape exists, but the actual state machine (who can suspend, what triggers pending, etc.) is **not decided**. |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### 1.2 `ServiceCategory`
Represents an admin-managed service offering — what MVP's "Service
Management" (Section 1, Item 6) and the `/services` page display.

| Field | Conceptual type | Notes |
|---|---|---|
| `id` | identifier | |
| `title` | string | e.g. "Custom Software & Digital Solutions" (the 3 categories currently on the Services page are placeholder content pulled from Section 1, Item 5 — this table is what will eventually replace that hardcoded array) |
| `slug` | string, unique | **Approved decision.** URL-friendly identifier (e.g. `custom-software-digital-solutions`) for individual Service Pages once built (Section 1, Item 6 lists these as a separate MVP item from this overview) |
| `description` | text | |
| `publishStatus` | enum: `draft`, `published`, `archived` | **Approved decision** — replaces the earlier simpler `isActive` boolean. `draft` = admin still editing, not publicly visible; `published` = live on the public site; `archived` = no longer offered but retained for record-keeping rather than deleted |
| `sortOrder` | integer | For controlling display order in the Admin Dashboard / public page |
| `managedByUserId` | reference → `User.id` | Which admin created/last edited it — see Section 4 (Admin management relationships) below |
| `createdAt` / `updatedAt` | timestamp | |

### 1.3 `ServiceRequest`
The core entity behind the quotation/inquiry flow (Section 1, Item 6:
"no online payment at MVP... quotation/inquiry-based service
requests"). This is what the Contact page form will eventually create,
once wired to a backend.

| Field | Conceptual type | Notes |
|---|---|---|
| `id` | identifier | |
| `userId` | reference → `User.id` | Who submitted it |
| `serviceCategoryId` | reference → `ServiceCategory.id`, optional | Matches the Contact page's "Service Interest" field; optional since a request could be general-purpose |
| `projectDetails` | text | Free-form description (matches Contact page's "Project Details" field) |
| `status` | enum | **Fixed list per the Section 1 architecture note:** `submitted`, `under_review`, `quotation_sent`, `approved`, `rejected`, `in_progress`, `completed`, `cancelled` — same values already used by the `StatusBadge` component in `packages/ui`. |
| `createdAt` / `updatedAt` | timestamp | |

**Explicitly not modeled here:** status transition rules (which
statuses can follow which, who can trigger each transition). The
Section 1 architecture note defers that to a Workflow Engine design —
this document only defines the field and its fixed set of values, not
its behavior.

### 1.4 `Quotation`
Represents a price/scope proposal an admin sends in response to a
`ServiceRequest`. Modeled as a **separate entity in a one-to-many
relationship with `ServiceRequest`** (a request can receive more than
one quotation over time — e.g. a revised quote after negotiation),
rather than folding quotation fields directly onto `ServiceRequest`.

| Field | Conceptual type | Notes |
|---|---|---|
| `id` | identifier | |
| `serviceRequestId` | reference → `ServiceRequest.id` | |
| `preparedByUserId` | reference → `User.id` (role = admin) | Which admin prepared it |
| `amount` | decimal | |
| `currency` | string | Currency handling itself is a Section 19 (Payments) open question — this field only records what currency the quotation was denominated in |
| `scopeDescription` | text | What the quotation covers |
| `validUntil` | date, optional | |
| `isCurrent` | boolean | **Resolves a gap flagged in `request-workflow.md`**: with multiple `Quotation` rows possible per request, this field marks which one is the active one being decided on. Exactly one `Quotation` per `ServiceRequest` should have `isCurrent: true` at a time — when a revision is issued, the previous current quotation flips to `false` and the new one to `true`. Enforcing that invariant (not just declaring it) is application logic, not something this field alone guarantees. |
| `createdAt` / `updatedAt` | timestamp | |

**Design note, flagged rather than resolved:** this document proposes
`Quotation` as its own entity (supporting a history of revisions) over
the simpler alternative of putting quotation fields directly on
`ServiceRequest` (supporting only one quotation per request ever). The
simpler alternative is valid too — this is exactly the kind of
trade-off Section 5 review should confirm or reject, not something
this document is authorized to lock in.

### 1.5 `PortfolioProject`
Backs the `/portfolio` page and MVP's "Portfolio Management" feature
(Section 1, Item 6).

| Field | Conceptual type | Notes |
|---|---|---|
| `id` | identifier | |
| `title` | string | |
| `slug` | string, unique | **Approved decision.** URL-friendly identifier for a future individual project detail page |
| `summary` | text | |
| `categoryTag` | string | Matches the "Category placeholder" label currently hardcoded on the Portfolio page |
| `imageUrl` | string, optional | |
| `publishStatus` | enum: `draft`, `published`, `archived` | **Approved decision** — replaces the earlier simpler `isPublished` boolean. Same three states as `ServiceCategory.publishStatus`; ties into the CMS draft/publish workflow noted in Section 12 |
| `sortOrder` | integer | |
| `managedByUserId` | reference → `User.id` | |
| `createdAt` / `updatedAt` | timestamp | |

### 1.6 `ServiceRequestStatusHistory` — **Approved decision**
Records every status transition a `ServiceRequest` goes through,
giving both users and admins a timeline, not just the current status.
Directly supports the MVP "Request Status tracking" feature (Section
1, Item 6) with more than a single current value.

| Field | Conceptual type | Notes |
|---|---|---|
| `id` | identifier | |
| `serviceRequestId` | reference → `ServiceRequest.id` | |
| `fromStatus` | enum, nullable | Null for the very first entry (creation itself has no "from") |
| `toStatus` | enum | Same fixed 8-value status list as `ServiceRequest.status` |
| `changedByUserId` | reference → `User.id`, nullable | Nullable to allow for a system-triggered transition, if one is ever introduced; **who is actually allowed to trigger a transition remains the open question flagged in `request-workflow.md` Section 4** — this entity records whoever did it, it doesn't decide who's allowed to |
| `changedAt` | timestamp | |

This is distinct from `AuditLog` below by purpose, not by
accident: `ServiceRequestStatusHistory` is the user/admin-facing
timeline data source (what a "Request Timeline" UI would query
directly); `AuditLog` is the broader security/compliance record
covering every entity, not just status changes. The same transition
event may reasonably appear in both.

### 1.7 `AuditLog` — **Approved decision**
Originally proposed in `security-architecture.md` as a way to close
the audit-logging gap; now approved and formalized here as a real
entity in the data model, not just a proposal.

| Field | Conceptual type | Notes |
|---|---|---|
| `id` | identifier | |
| `actorUserId` | reference → `User.id`, nullable | Nullable to allow system-triggered events |
| `action` | string | e.g. `login_success`, `login_failure`, `service_request.status_changed`, `quotation.created`, `service_category.updated`, `setting.updated` |
| `targetType` | string | Which entity was affected (`ServiceRequest`, `Quotation`, `ServiceCategory`, `PortfolioProject`, `User`, `SettingEntry`) |
| `targetId` | identifier | |
| `metadata` | JSON | e.g. `{ "from": "under_review", "to": "quotation_sent" }` for a status change |
| `createdAt` | timestamp | |

Retention period and whether it's queryable from the Admin Dashboard
remain open (per `security-architecture.md` Section 6) — only the
entity itself is approved here, not its full lifecycle.

### 1.8 `SettingEntry` — **Approved decision**
Backs a Settings Management module for the Admin Dashboard (Section
13) — a simple key/value store for platform-wide configuration an
admin can adjust without a code change (e.g. feature toggles, contact
details shown in the Footer, future notification templates).

| Field | Conceptual type | Notes |
|---|---|---|
| `id` | identifier | |
| `key` | string, unique | e.g. `footer.contact_email`, `feature.pi_payments_enabled` |
| `value` | JSON or text | Shape depends on the setting — deliberately generic rather than one column per setting |
| `updatedByUserId` | reference → `User.id` | Which admin last changed it |
| `updatedAt` | timestamp | |

**Not decided:** the actual list of settings Hiweb needs, validation
per setting-key (a JSON/text blob has no inherent schema per key —
whether that's enforced at the application layer or left loose is
open), and whether some settings should be environment-specific
(ties to `infrastructure-architecture.md` Section 4's configuration
layering, which is a separate mechanism from this admin-editable
store).

## 2. Relationships

```
User (role: admin) 1 ──── * ServiceCategory      (managedByUserId)
User (role: admin) 1 ──── * PortfolioProject      (managedByUserId)
User (role: user)  1 ──── * ServiceRequest        (userId)
User (role: admin) 1 ──── * Quotation             (preparedByUserId)
ServiceCategory    1 ──── * ServiceRequest        (serviceCategoryId, optional)
ServiceRequest     1 ──── * Quotation             (serviceRequestId)
ServiceRequest     1 ──── * ServiceRequestStatusHistory  (serviceRequestId)
User               1 ──── * ServiceRequestStatusHistory  (changedByUserId, optional)
User               1 ──── * AuditLog                     (actorUserId, optional)
User (role: admin) 1 ──── * SettingEntry                 (updatedByUserId)
```

In words:
- A **User** with role `admin` manages many `ServiceCategory` and
  `PortfolioProject` records, and prepares many `Quotation` records.
- A **User** with role `user` submits many `ServiceRequest` records.
- A **ServiceRequest** optionally belongs to one `ServiceCategory`, and
  can accumulate multiple `Quotation` records over its lifetime, and
  many `ServiceRequestStatusHistory` entries (one per transition).
- **Admin management** (per the task's framing) is not a separate
  entity — it's the set of `managedByUserId` / `preparedByUserId`
  relationships above, all pointing back to `User` records with
  `role = admin`. This keeps a single `User` table instead of a
  parallel `Admin` table, consistent with Section 1's MVP scope
  listing "User role, Admin role" as roles on one account system, not
  two separate account types.
- **`AuditLog`** relates to every entity generically via
  `targetType`/`targetId` rather than a dedicated foreign key per
  entity — deliberately loose coupling, since it needs to cover
  entities added in the future without a schema change to `AuditLog`
  itself.

## 3. What this document does NOT decide

- **Database technology** — PostgreSQL + Prisma remains a *proposal*
  (see `repo-structure.md`), not confirmed by this document.
- **Section 2 (Users & Roles)** — the fuller role list, permission
  matrix, and account lifecycle rules beyond the two MVP roles.
- **Workflow Engine** — status transition rules for `ServiceRequest`
  (which statuses can follow which, who can trigger each) remain
  undecided, as repeatedly flagged in the Section 1 architecture note
  and `request-workflow.md`. `ServiceRequestStatusHistory` now records
  *that* a transition happened and *who* did it — it does not decide
  *which* transitions are valid.
- **Indexing, constraints, cascade/delete behavior, soft-delete vs.
  hard-delete** — all Section 5 checklist items not addressed here;
  this document only establishes entities and relationships as a
  starting point for that fuller review.
- **Section 19 (Payments)** — how `Quotation.amount`/`currency` connect
  to actual Pi Payments once Phase 2 arrives.
- **`AuditLog` and `SettingEntry` lifecycle details** — retention
  period, Admin Dashboard exposure, and (for settings) the actual list
  of setting keys Hiweb needs — the entities themselves are approved,
  their full behavior is not.

## 4. Suggested next step
Review this document section-by-section the same way Section 1 was
reviewed (Decided / Needs Discussion / Deferred per field or entity),
before any schema or migration code is written.
