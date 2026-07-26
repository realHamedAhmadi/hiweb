# packages/config

Shared configuration intended for lint/build/format consistency across
the monorepo.

## Status
- ✅ `tsconfig.base.json` — a shared set of strict TypeScript compiler
  options (target, strict mode, module interop, etc.)
- ❌ **Not yet adopted** — none of the existing per-package
  `tsconfig.json` files (`apps/web`, `apps/api`, `packages/ui`,
  `packages/i18n`, `packages/database`) currently `extend` this file.
  Each was written independently with broadly similar (but not
  identically) strict settings before this shared base existed.
  Migrating them to `"extends": "../../packages/config/tsconfig.base.json"`
  is a real, worthwhile follow-up — deliberately not done in the same
  pass that created this file, to avoid touching five already-working
  configs at once without individually verifying each still compiles
  the same way (which can't be confirmed here — no network access to
  actually run `tsc`).
- ❌ No shared ESLint or Prettier configuration yet — each package
  currently either has no lint config of its own (apps/api,
  packages/ui, packages/i18n, packages/database) or a Next.js-provided
  default (apps/web's `eslint-config-next`).
