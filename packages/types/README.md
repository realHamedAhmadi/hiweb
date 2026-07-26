# packages/types

Shared TypeScript types for entities exposed by `apps/api`, matching
`database-design.md`'s entity list.

## Status
- ✅ `src/index.ts` — `UserDTO`, `ServiceCategoryDTO`, `ServiceRequestDTO`,
  `QuotationDTO`, `PortfolioProjectDTO`, `ServiceRequestStatusHistoryDTO`,
  `AuditLogDTO`, `SettingEntryDTO`
- ❌ **Not yet adopted anywhere** — `apps/web`'s `adminApi.ts` and
  several admin page components currently use loose `any` types
  (written before this package existed). Migrating those to import
  from here is a real, worthwhile follow-up, not done yet so as not to
  touch a large number of already-working files in the same pass that
  created this package.
- ⚠️ **Casing note**: `RequestStatus` here matches `packages/ui`'s
  `StatusBadge` (lowercase snake_case) — NOT what Prisma/apps/api
  actually return over the wire (UPPER_CASE). Anything consuming a raw
  API response must lowercase the status value first.
