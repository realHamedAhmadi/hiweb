/**
 * Shared TypeScript types for entities exposed by apps/api, meant to
 * be consumed by both apps/web and apps/api eventually — matching
 * database-design.md's entity list.
 *
 * NOTE ON ADOPTION: these did not exist when apps/web's adminApi.ts
 * and several page components were first written — those currently
 * use loose `any` types instead (flagged explicitly in adminApi.ts's
 * own comments). Migrating those call sites to import from here is a
 * follow-up, not done as part of adding this file, to limit the blast
 * radius of this change.
 *
 * NOTE ON STATUS CASING: `RequestStatus` here uses the same lowercase
 * snake_case values as packages/ui's StatusBadge component — NOT the
 * UPPER_CASE values Prisma/apps/api actually return over the wire
 * (see packages/database's README for that gap). Anything consuming
 * a raw API response needs to lowercase the value before treating it
 * as this type — this file describes the FRONTEND-facing shape, not
 * the wire format.
 */

export type UserRole = "USER" | "ADMIN";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "PENDING" | "DELETED";
export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type RequestStatus =
  | "submitted"
  | "under_review"
  | "quotation_sent"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface UserDTO {
  id: string;
  displayName: string;
  email?: string;
  role: UserRole;
  accountStatus?: AccountStatus;
}

export interface ServiceCategoryDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  publishStatus: PublishStatus;
  sortOrder: number;
}

export interface ServiceRequestDTO {
  id: string;
  userId: string;
  serviceCategoryId?: string;
  projectDetails: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationDTO {
  id: string;
  serviceRequestId: string;
  preparedByUserId: string;
  amount: number;
  currency: string;
  scopeDescription: string;
  validUntil?: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface PortfolioProjectDTO {
  id: string;
  title: string;
  slug: string;
  summary: string;
  categoryTag: string;
  imageUrl?: string;
  publishStatus: PublishStatus;
  sortOrder: number;
}

export interface ServiceRequestStatusHistoryDTO {
  id: string;
  serviceRequestId: string;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  changedByUserId?: string;
  changedAt: string;
}

export interface AuditLogDTO {
  id: string;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: unknown;
  createdAt: string;
}

export interface SettingEntryDTO {
  id: string;
  key: string;
  value: unknown;
  updatedByUserId: string;
  updatedAt: string;
}
