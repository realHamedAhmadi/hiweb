# infrastructure/ci

CI/CD pipeline configuration.

## Status
The actual pipeline lives at `/.github/workflows/ci.yml` (GitHub's own
required location for Actions workflows), not in this folder — this
folder remains a placeholder for any CI-adjacent scripts that aren't
GitHub-Actions-specific (e.g. a shared lint/test runner script usable
by multiple CI providers), none of which exist yet.

See `/.github/workflows/ci.yml` for what's actually implemented:
install → build packages/database → typecheck apps/web → typecheck
apps/api → run apps/api tests → dependency audit.

Never run — this environment has no network access to execute a real
CI job.
