# Hiweb — Request & Quotation Workflow Architecture (Draft)

Status: **Draft proposal for the Workflow Engine**, first flagged as
deferred in the Section 1 architecture note ("Transition rules between
statuses are intentionally undefined... to be fully designed during
Database Design, Admin Dashboard, User Dashboard, and Workflow Engine
sections"). This document is that design work — still a **proposal**,
not a final decision, and should be reviewed the same way every other
architecture draft has been.

Builds on `database-design.md` (`ServiceRequest`, `Quotation` entities)
and `backend-architecture.md` (Section 3's roles/permissions concept,
Section 4's earlier high-level flow sketch). No code, no API
implementation — this document only describes lifecycle, meaning, and
a proposed transition concept.

---

## 1. Status meanings

Each of the 8 fixed `ServiceRequest.status` values (per
`database-design.md`), defined precisely:

| Status | Meaning | Whose "turn" it is |
|---|---|---|
| `submitted` | User has submitted a request; no admin action has happened yet | Admin (to review) |
| `under_review` | An admin has started evaluating the request | Admin (to respond) |
| `quotation_sent` | An admin has prepared and sent at least one `Quotation` | User (to respond) |
| `approved` | User has accepted a quotation | Admin (to begin work) |
| `rejected` | Request was declined — either the admin couldn't/wouldn't quote it, or the user declined the quotation sent | Terminal (see Section 3) |
| `in_progress` | Admin has started the actual work | Admin (to complete) |
| `completed` | Work is finished and delivered | Terminal |
| `cancelled` | Request was withdrawn before completion, by either party | Terminal |

**Note on `rejected` covering two different situations** (admin
declines vs. user declines a quote): this document treats them as the
same status for now, since the Section 1 architecture note fixed the
status list as-is. If distinguishing "admin declined" from "user
declined" turns out to matter operationally (e.g. for the KPIs in
Section 1, Item 7 — "cancellation rate", "rejection" isn't separately
tracked there either), that would require adding a new status or a
separate `rejectionReason`/`rejectedBy` field — **flagged as a
possible gap, not decided or added here**, since the fixed status list
itself isn't this document's to change.

## 2. ServiceRequest lifecycle

End-to-end path a single `ServiceRequest` follows, tied to
`Quotation` creation:

1. **User submits** a request (via the Contact page form, once wired
   to a backend) → `status: submitted`.
2. **Admin reviews** the request → transitions to `under_review`.
   No `Quotation` exists yet at this point.
3. **Admin prepares a `Quotation`** record (per `database-design.md`,
   linked via `serviceRequestId`) → `ServiceRequest.status` moves to
   `quotation_sent`.
4. **User responds to the quotation** → either `approved` or
   `rejected`.
5. **If approved, admin begins work** → `in_progress`.
6. **Admin finishes the work** → `completed`.
7. **At various points, either party may withdraw** → `cancelled`
   (see Section 3 for which points this document proposes allowing
   this).

## 3. Quotation workflow

Directly extends `database-design.md`'s one-to-many
`ServiceRequest`–`Quotation` relationship:

- **First quotation** — created when the request first reaches
  `quotation_sent`. This is the common case.
- **Revised quotations** — if a user wants changes before deciding,
  an admin may create an **additional** `Quotation` row linked to the
  same `ServiceRequest`. Proposed behavior: `ServiceRequest.status`
  **stays** `quotation_sent` (it doesn't need a new status value for a
  revision — the request is still "awaiting a decision on a
  quotation").
- **Identifying the "current" quotation** — **resolved.**
  `database-design.md` Section 1.4 now includes an `isCurrent` boolean
  on `Quotation`, with exactly one current quotation per request at a
  time. Enforcing that invariant is application logic, not something
  the field alone guarantees — worth a test case whenever this is
  implemented.
- **Quotation → decision link** — the transition out of
  `quotation_sent` (to `approved` or `rejected`) is conceptually a
  decision *on the current quotation specifically* (`isCurrent: true`),
  which is now identifiable per the resolved gap above.

## 4. Status transition concept (proposed state machine)

**This is a proposal to review, not a locked rule set.**

```
submitted ──────────────► under_review ──────────────► quotation_sent
    │                          │                             │
    │ (user withdraws)         │ (admin declines,             │ (user decides)
    │                          │  no quote offered)           ├──────────────┐
    ▼                          ▼                              ▼              ▼
cancelled                  rejected                       approved       rejected
                                                                │
                                                                ▼
                                                          in_progress
                                                                │
                                                    ┌───────────┴───────────┐
                                                    ▼                       ▼
                                               completed               cancelled
```

**Proposed transition table**, with who triggers each and open
questions inline:

| From | To | Trigger | Open question |
|---|---|---|---|
| `submitted` | `under_review` | Admin | — |
| `submitted` | `cancelled` | User | Can a user cancel before any admin action? Proposed: yes. |
| `under_review` | `quotation_sent` | Admin (creates a `Quotation`) | — |
| `under_review` | `rejected` | Admin | Admin declines without ever quoting — allowed here as "can't/won't service this request" |
| `under_review` | `cancelled` | User | Same as above — user can still withdraw while admin is reviewing |
| `quotation_sent` | `quotation_sent` | Admin (revised `Quotation`) | Self-loop — see Section 3 above |
| `quotation_sent` | `approved` | User | — |
| `quotation_sent` | `rejected` | User | — |
| `quotation_sent` | `cancelled` | User | Is this different from `rejected`? Proposed: `cancelled` = user walks away without formally declining the quote; `rejected` = user actively declines it. Distinction may be too subtle to be worth two paths — **flagged, not resolved**. |
| `approved` | `in_progress` | Admin | Is there a gap between "approved" and "work started," or do these collapse into one admin action? Not decided. |
| `approved` | `cancelled` | Either | Should approving, then cancelling before work starts, be allowed? Proposed: yes, but **not confirmed**. |
| `in_progress` | `completed` | Admin | — |
| `in_progress` | `cancelled` | Either | Cancelling mid-work — proposed as allowed, but has implications for the (not-yet-designed) Payments/billing side once Phase 2 Pi Payments exist. **Flagged as needing Section 19 input before finalizing.** |
| `rejected` | *(none)* | — | Proposed terminal — no path back to `under_review`. **Explicitly flagged as debatable**: a real business might want to let a rejected request be reopened rather than forcing a brand-new submission. Not decided. |
| `completed` | *(none)* | — | Terminal — no proposed reopening path |
| `cancelled` | *(none)* | — | Terminal — no proposed reopening path |

**Decided: at MVP, every status transition is admin-triggered.** No
row in the table above is user-self-service until Phase 2's User
Dashboard exists. Concretely: when a user "approves" or "rejects" a
quotation, that happens through some out-of-platform channel (the
Contact form, email, a phone call — whatever the admin actually uses
to hear the user's decision), and an admin then records the
corresponding transition. The `User`-facing MVP feature stays exactly
what Section 1, Item 6 already committed to: read-only "Request Status
tracking" — seeing the current status and its timeline
(`ServiceRequestStatusHistory`), never changing it directly.

**Reasoning:** This isn't a new restriction — it's what the existing
approved MVP scope already implies, made explicit instead of left
ambiguous. Building user-triggered transitions now would mean building
part of the Phase 2 User Dashboard early, which contradicts the
already-approved MVP/Phase 2 split (`hiweb-master-specification.md`
Section 1, Item 6). Every "Either" and "User" entry in the table above
should be read as **"Admin, acting on the user's behalf"** until Phase
2.

## 5. What this document does NOT decide

- Whether the proposed transition table is correct — it is a first
  draft, meant to be argued with, not implemented as-is
- Whether `rejected` should split into two statuses (admin-declined vs.
  user-declined) — flagged, not resolved
- Any notification side effects of a transition (Phase 2 feature)
- Audit logging of who changed a status and when — **now approved** as
  the `ServiceRequestStatusHistory` entity (`database-design.md`
  Section 1.6) and the broader `AuditLog` (Section 1.7), per
  `security-architecture.md` Section 6

## 6. Suggested next step
Resolve the MVP user-vs-admin-triggered question first (Section 4
above) — it changes which rows in the transition table are even
reachable before Phase 2. Then review the rest of the transition table
the same way every other draft has been reviewed here: line by line,
Decided / Needs Discussion / Deferred.
