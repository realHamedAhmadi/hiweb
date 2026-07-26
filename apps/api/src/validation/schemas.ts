import { z } from "zod";

/**
 * Input validation at the API boundary (security-architecture.md
 * Section 2). Every request body used by a controller is parsed
 * through one of these before touching business logic — untrusted
 * input is never passed straight to Prisma.
 */

export const piLoginSchema = z.object({
  piAccessToken: z.string().min(1),
});

export const updateOwnUserSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
});

export const createServiceRequestSchema = z.object({
  serviceCategoryId: z.string().cuid().optional(),
  projectDetails: z.string().min(1).max(5000),
});

const requestStatusEnum = z.enum([
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTATION_SENT",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const updateServiceRequestStatusSchema = z.object({
  toStatus: requestStatusEnum,
});

export const createQuotationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3), // e.g. "USD" — ISO 4217-shaped, not validated against a real currency list
  scopeDescription: z.string().min(1).max(5000),
  validUntil: z.string().datetime().optional(),
});

const publishStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createServiceCategorySchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "slug must be lowercase, numbers, and hyphens only"),
  description: z.string().min(1),
  publishStatus: publishStatusEnum.optional(),
  sortOrder: z.number().int().optional(),
});

export const updateServiceCategorySchema = createServiceCategorySchema.partial();

export const createPortfolioProjectSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "slug must be lowercase, numbers, and hyphens only"),
  summary: z.string().min(1),
  categoryTag: z.string().min(1).max(100),
  imageUrl: z.string().url().optional(),
  publishStatus: publishStatusEnum.optional(),
  sortOrder: z.number().int().optional(),
});

export const updatePortfolioProjectSchema = createPortfolioProjectSchema.partial();

export const updateSettingSchema = z.object({
  value: z.unknown(), // deliberately generic — SettingEntry.value has no fixed shape per key (database-design.md 1.8's own "not decided" note)
});
