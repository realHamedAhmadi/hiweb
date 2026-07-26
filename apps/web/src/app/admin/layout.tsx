"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Admin section layout — gates every /admin/* page behind
 * status === "authenticated" && role === "ADMIN".
 *
 * IMPORTANT SECURITY NOTE: this guard is client-side UI only. It hides
 * the admin UI from the wrong audience and gives a clear message, but
 * it is NOT the security boundary — a non-admin (or anyone with dev
 * tools) bypassing this check client-side would still hit apps/api's
 * requireRole("ADMIN") middleware and get a real 403. Never treat a
 * frontend route guard as sufficient authorization by itself
 * (security-architecture.md Section 3 — enforcement happens
 * server-side).
 *
 * Given the login flow's backend verification is still a documented
 * stub (apps/api/src/lib/piNetwork.ts), nobody can actually reach
 * "authenticated" status yet in a real deployment — this entire
 * section is unreachable in practice until that's implemented. It's
 * still worth building now so the moment login works, the admin UI is
 * ready.
 */

const adminNavLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/service-requests", label: "Service Requests" },
  { href: "/admin/service-categories", label: "Service Categories" },
  { href: "/admin/portfolio-projects", label: "Portfolio Projects" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit-logs", label: "Audit Log" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-ink-700">Checking session…</p>
      </div>
    );
  }

  if (status !== "authenticated" || user?.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="font-display text-xl font-semibold text-ink-900">
          Admin access required
        </p>
        <p className="mt-2 text-sm text-ink-700">
          {status === "authenticated"
            ? "Your account doesn't have admin access."
            : "Please log in with an admin account from the header above."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-start">
      <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
      <nav
        className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-slate-200 pb-4"
        aria-label="Admin"
      >
        {adminNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={
              pathname === link.href
                ? "text-sm font-semibold text-navy-700"
                : "text-sm font-medium text-ink-700 hover:text-ink-900"
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
