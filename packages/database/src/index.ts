// Re-exports the generated Prisma Client and all its types (PrismaClient,
// User, UserRole, RequestStatus, PublishStatus, AccountStatus, etc.)
// so the rest of the monorepo imports from "@hiweb/database" instead of
// reaching into "@prisma/client" directly — keeps Prisma as an
// implementation detail of this package, not something every consumer
// needs to know about.
export * from "@prisma/client";
