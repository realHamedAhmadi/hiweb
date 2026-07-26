# Hiweb — Infrastructure Architecture (Draft)

Status: **Draft proposal for Section 17 (Deployment & DevOps)** — a
starting point for review, not a final decision. Section 17 remains
🟡 Needs Discussion in the Master Specification.

Builds on `repo-structure.md` (the `apps/web` / `apps/api` split,
already-scaffolded but empty `infrastructure/docker`,
`infrastructure/ci`, and `.github/workflows` folders), and
`security-architecture.md` (Section 2's secrets-management dependency
on this document, Section 5's encryption/backup dependencies). No
code, no implementation — this document only describes environments,
deployment approach, CI/CD concept, and configuration handling.

---

## 1. Environments

Three-tier proposal — **development, staging, production** — matching
the original requirements checklist's Section 17 item:

| Environment | Purpose | Database | Pi Network API |
|---|---|---|---|
| **Development** | Local machine, individual engineer work | Local or shared dev database instance — not decided which | Pi sandbox (per Section 18, not yet designed in detail, but sandbox-vs-mainnet is exactly the kind of thing that should differ by environment) |
| **Staging** | Pre-production verification — the last check before real users see something | A staging database, separate from production, ideally seeded with realistic-but-fake data | Pi sandbox |
| **Production** | Live platform | Production database | Pi mainnet |

**Why sandbox/mainnet is treated as an environment-level concern:** it
directly answers part of the Section 18 open question
(`authentication-architecture.md` and `backend-architecture.md` both
flag sandbox vs. mainnet as undecided) — this document doesn't decide
*how* Pi integration works, only proposes *that* which Pi environment
is used should be a property of which Hiweb environment is running,
not something hardcoded once.

**Promotion flow (proposed):** code moves Development → Staging →
Production via the CI/CD pipeline (Section 3 below), never by manually
editing a live environment.

**Not decided:** exact hosting location(s) for each environment,
whether staging is a permanently-running environment or spun up
on-demand, and how staging's database is seeded/refreshed.

## 2. Deployment approach

The `apps/web` / `apps/api` split (established in `repo-structure.md`
specifically so the backend "can be scaled independently... without a
frontend rewrite") has a direct deployment consequence: **the two apps
deploy differently, not identically.**

**Decided:**

| App | Deployment shape | Reasoning |
|---|---|---|
| `apps/web` (Next.js) | **Managed platform** (Vercel-style) | Next.js gets first-class, low-effort handling of SSR/build output on managed platforms — for a team of this size (currently one person, per `hiweb-master-specification.md` Section 1, Item 8), minimizing ops overhead matters more than the marginal portability a container would add. Simpler now beats more portable later, given the actual team size. |
| `apps/api` (Node.js) | **Containerized (Docker)**, via the already-scaffolded `infrastructure/docker` | Keeps the independent-scaling promise `repo-structure.md` already made concrete and vendor-agnostic — a container runs on effectively any host, so the specific provider can still be chosen later (or changed) without rework. The backend is also where Pi Platform API calls and the database connection live — worth the extra setup cost of containerizing to keep it portable. |

**Still not decided (genuinely needs real usage/cost data, not just
architecture judgment):** the specific hosting *vendor* for either app
— e.g. which managed platform, which container host. That's a
practical choice best made when actually setting up deployment,
weighing real pricing and Pi Network's own infrastructure
requirements (Section 18) at that time, not from an architecture
document written before either app has a line of implementation code.

**Other Section 17 checklist items, named but not resolved:**
- **Rollback strategy** — proposed principle: a failed deploy should
  be revertible to the last known-good version without manual
  intervention; specific mechanism (platform-native rollback vs.
  redeploying a previous container image) not decided.
- **Blue-green / canary deployment** — worth considering once there's
  real traffic to protect; not needed to decide before MVP launch, and
  not designed here.
- **Auto-scaling policy** — depends on the hosting choice above; not
  decided.
- **Domain / DNS / SSL** — not decided; whatever hosting choice is made
  typically provides SSL automatically, but the domain itself and DNS
  provider are business/ops decisions outside this document's scope.

## 3. CI/CD concept

`infrastructure/ci/` and `.github/workflows/` already exist as empty
scaffolding (per `repo-structure.md`) — this section proposes what
goes in them, still without writing the actual pipeline files.

**Proposed pipeline stages:**

1. **On every pull request:**
   - Lint (`packages/config`'s shared rules, once populated)
   - Type-check (`tsc --noEmit` across `apps/web`, `apps/api`, and
     shared `packages/*`)
   - Automated tests (none exist yet — Section 16, Testing & QA, is
     its own undesigned area)
   - Dependency vulnerability scan — closes the loop on the CI-
     integrated scanning need flagged in `security-architecture.md`
     Section 2
2. **On merge to the main branch:**
   - Build both `apps/web` and `apps/api`
   - Deploy automatically to **Staging**
3. **Production release:**
   - Proposed as a deliberate, separate trigger (e.g. a tagged release
     or manual approval step) rather than automatic-on-merge — so a
     merge to main doesn't immediately go live to real users
   - Exact mechanism (git tag, manual approval gate in the CI tool,
     etc.) not decided

**Runner/tool:** GitHub Actions is the implicit assumption, since
`.github/workflows/` was already scaffolded early in this project as
part of the initial repo structure (`repo-structure.md`) — but that
was a placeholder folder, not a considered decision, and this document
does not elevate it to one. Any CI provider could fill that folder.

## 4. Secrets and configuration management

Extends the principle already stated in `security-architecture.md`
Section 5 ("secrets should never live in source code") into concrete
handling:

- **`.env.example`** (already in the repo root) documents *which*
  environment variables exist and are expected — it is never a place
  real secrets are stored, only a template.
- **Per-environment secret values** live in whatever the eventual
  hosting platform's own secret/environment-variable management
  provides (or a dedicated secrets manager/vault, if the hosting
  choice doesn't include one) — **not decided which**, since it
  depends on the hosting decision in Section 2 above.
- **`packages/config`** (shared lint/build/format configuration, per
  `repo-structure.md`) is explicitly **not** where secrets or
  per-environment values go — it holds shared *development tooling*
  configuration (ESLint rules, TypeScript base config), which is
  fundamentally different from runtime secrets and shouldn't be
  conflated with them.
- **Configuration layering (proposed):** a shared base configuration
  (non-secret defaults, same across environments) plus per-environment
  overrides (database URL, Pi sandbox-vs-mainnet endpoint, session
  expiry if that ends up configurable) — exact implementation
  mechanism not decided.
- **What counts as a secret here, concretely** (per current
  `.env.example` and the architecture docs so far): database
  credentials, Pi Network API keys/app ID, and whatever signing
  secret the eventual session mechanism needs (JWT secret, if that's
  the path chosen per `authentication-architecture.md` Section 2) —
  all must go through whatever mechanism is chosen above, never
  committed.

## 5. What this document does NOT decide

- Specific hosting provider(s) for `apps/web` and `apps/api`
- CI/CD tool (GitHub Actions is an inherited assumption from earlier
  scaffolding, not a confirmed decision)
- Rollback mechanism, auto-scaling policy, blue-green/canary approach
- Domain, DNS provider, SSL specifics
- Secrets manager/vault choice
- Staging database seeding/refresh strategy
- Backup schedule and disaster recovery (Section 15 — separate,
  undesigned area; encryption-at-rest also still open per
  `security-architecture.md` Section 5)

## 6. Suggested next step
Confirm the database technology (Section 5, still a proposal per
`database-design.md`) and hosting shape (Section 2 above) together,
since they're linked — then fill in `infrastructure/ci/` and
`.github/workflows/` with an actual pipeline definition once a CI tool
is confirmed rather than assumed.
