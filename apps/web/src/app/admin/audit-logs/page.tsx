"use client";

import { useEffect, useState } from "react";
import { Card } from "@hiweb/ui";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/adminApi";

interface AuditLogRow {
  id: string;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata: unknown;
  createdAt: string;
}

/**
 * Read-only, per security-architecture.md Section 6 ("should even an
 * admin be able to delete audit entries? Proposed: no") — no
 * write/delete action exists on this page, matching apps/api having
 * no write/delete route for this resource either.
 */
export default function AdminAuditLogsPage() {
  const { accessToken } = useAuth();
  const [logs, setLogs] = useState<AuditLogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    adminApi
      .listAuditLogs(accessToken)
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [accessToken]);

  if (error) return <p className="text-sm text-signal-rust">{error}</p>;
  if (!logs) return <p className="text-sm text-ink-700">Loading…</p>;
  if (logs.length === 0) return <p className="text-sm text-ink-700">No audit log entries yet.</p>;

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log) => (
        <Card key={log.id} className="text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-ink-900">{log.action}</span>
            <span className="text-xs text-slate-400">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-700">
            {log.targetType} · {log.targetId} · actor: {log.actorUserId ?? "system"}
          </p>
          {log.metadata ? (
            <pre className="mt-2 overflow-x-auto rounded-md bg-paper-100 p-2 text-xs text-ink-700">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
