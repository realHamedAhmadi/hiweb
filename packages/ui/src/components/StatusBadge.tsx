import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

/**
 * StatusBadge — status indicator for service requests AND quotations
 * (Section 1 architecture note: both share the same status lifecycle,
 * so one component serves both rather than duplicating per-entity
 * badges).
 *
 * Status → color mapping is semantic, grouped by meaning rather than
 * assigning a unique color per status:
 * - neutral/waiting  (slate)  → Submitted, Cancelled
 * - active           (navy)   → Under Review, In Progress
 * - needs attention  (gold)   → Quotation Sent (user action expected)
 * - positive outcome (emerald)→ Approved, Completed
 * - negative outcome (rust)   → Rejected
 *
 * Submitted and Cancelled are both "slate" deliberately: Submitted is
 * neutral-new, Cancelled is neutral-ended — visually de-emphasized
 * rather than alarmed, since a cancellation isn't necessarily a
 * negative outcome (a user may simply withdraw a request). Rejected
 * is the only status using the rust/negative color, since that's the
 * one outcome that signals something did not succeed.
 *
 * NOTE ON SCOPE: transition rules between these statuses are still
 * undefined (see Section 1 architecture note / Workflow Engine,
 * not yet designed) — this component only renders whatever status
 * value it's given; it does not enforce or validate transitions.
 *
 * NOTE ON TYPE LOCATION: `RequestStatus` is defined here for now since
 * only the UI needs it today. Once the backend/API and database schema
 * are designed (Sections 5/6), this type should move to `packages/types`
 * so frontend and backend share a single definition instead of two.
 */

export const REQUEST_STATUSES = [
  "submitted",
  "under_review",
  "quotation_sent",
  "approved",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

const statusLabels: Record<RequestStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  quotation_sent: "Quotation Sent",
  approved: "Approved",
  rejected: "Rejected",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusStyles: Record<RequestStatus, string> = {
  submitted: "bg-slate-200 text-ink-700",
  under_review: "bg-navy-500/10 text-navy-700",
  quotation_sent: "bg-gold-50 text-gold-700",
  approved: "bg-signal-emerald/10 text-signal-emerald",
  rejected: "bg-signal-rust/10 text-signal-rust",
  in_progress: "bg-navy-700/10 text-navy-800",
  completed: "bg-signal-emerald/10 text-signal-emerald",
  cancelled: "bg-slate-200 text-ink-500",
};

const dotStyles: Record<RequestStatus, string> = {
  submitted: "bg-ink-500",
  under_review: "bg-navy-500",
  quotation_sent: "bg-gold-500",
  approved: "bg-signal-emerald",
  rejected: "bg-signal-rust",
  in_progress: "bg-navy-700",
  completed: "bg-signal-emerald",
  cancelled: "bg-ink-500",
};

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: RequestStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md", className, ...props }: StatusBadgeProps) {
  const sizeStyles = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-sm px-2.5 py-1 gap-1.5";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeStyles,
        statusStyles[status],
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[status])} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
