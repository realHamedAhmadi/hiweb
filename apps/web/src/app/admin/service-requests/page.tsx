"use client";

import { useEffect, useState } from "react";
import { StatusBadge, Button, Card, type RequestStatus } from "@hiweb/ui";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/adminApi";

/**
 * Admin Service Requests — list every request, view its current
 * status, and change it (the Decided MVP rule from
 * request-workflow.md Section 4: every transition is admin-triggered,
 * no user self-service yet).
 *
 * `RequestStatus` casing note: apps/api returns Prisma's UPPER_CASE
 * enum values (e.g. "QUOTATION_SENT"), but `StatusBadge` expects
 * lowercase snake_case (e.g. "quotation_sent"). `.toLowerCase()`
 * happens to convert correctly here since Prisma enum values already
 * use underscores in the same positions — a coincidence of naming,
 * not a designed mapping layer. Flagged in packages/database's README
 * as a gap; this is a working inline fix, not the eventual real
 * solution if the naming ever diverges.
 */

const ALL_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTATION_SENT",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

interface ServiceRequestRow {
  id: string;
  projectDetails: string;
  status: string;
  createdAt: string;
}

export default function AdminServiceRequestsPage() {
  const { accessToken } = useAuth();
  const [requests, setRequests] = useState<ServiceRequestRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    adminApi
      .listServiceRequests(accessToken)
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [accessToken]);

  async function handleUpdateStatus(id: string) {
    if (!accessToken) return;
    const toStatus = pendingStatus[id];
    if (!toStatus) return;
    setSavingId(id);
    setError(null);
    try {
      const updated = await adminApi.updateServiceRequestStatus(accessToken, id, toStatus);
      setRequests((prev) => prev?.map((r) => (r.id === id ? updated : r)) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSavingId(null);
    }
  }

  if (error && !requests) {
    return <p className="text-sm text-signal-rust">{error}</p>;
  }
  if (!requests) {
    return <p className="text-sm text-ink-700">Loading…</p>;
  }
  if (requests.length === 0) {
    return <p className="text-sm text-ink-700">No service requests yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-signal-rust">{error}</p>}
      {requests.map((request) => (
        <Card key={request.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">{request.id}</p>
              <p className="mt-1 max-w-xl text-sm text-ink-900">{request.projectDetails}</p>
              <p className="mt-2 text-xs text-slate-400">
                Submitted {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <StatusBadge status={request.status.toLowerCase() as RequestStatus} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
            <select
              defaultValue=""
              onChange={(e) =>
                setPendingStatus((prev) => ({ ...prev, [request.id]: e.target.value }))
              }
              className="rounded-md border border-slate-200 bg-paper-50 px-2 py-1.5 text-sm text-ink-900"
            >
              <option value="" disabled>
                Change status to…
              </option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={savingId === request.id || !pendingStatus[request.id]}
              onClick={() => handleUpdateStatus(request.id)}
            >
              {savingId === request.id ? "Saving…" : "Update"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
