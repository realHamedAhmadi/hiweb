"use client";

/**
 * Client-side calls to apps/api's admin-only endpoints. Every call
 * requires a valid access token (passed explicitly by the caller, not
 * read from context here, so this module stays independent of
 * AuthContext) sent as `Authorization: Bearer <token>`.
 *
 * NOTE: this is a UI convenience layer only. The actual admin-only
 * enforcement happens server-side (apps/api's requireRole("ADMIN")
 * middleware) — hiding these pages from non-admins client-side
 * (see app/admin/layout.tsx) is a UX nicety, not the security
 * boundary. A non-admin calling these functions directly would still
 * be rejected by the backend with a 403.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const adminApi = {
  // NOTE: return/param types below are loosely `any` rather than
  // precise interfaces — a deliberate shortcut for this pass, not a
  // claim that it's fully typed. Tightening these against real shared
  // types belongs in packages/types (currently an empty placeholder
  // package) once the API's response shapes are considered stable.
  listServiceCategories: (token: string) => request<any[]>("/service-categories", token),
  createServiceCategory: (token: string, data: unknown) =>
    request<any>("/service-categories", token, { method: "POST", body: JSON.stringify(data) }),
  updateServiceCategory: (token: string, id: string, data: unknown) =>
    request<any>(`/service-categories/${id}`, token, { method: "PATCH", body: JSON.stringify(data) }),

  listPortfolioProjects: (token: string) => request<any[]>("/portfolio-projects", token),
  createPortfolioProject: (token: string, data: unknown) =>
    request<any>("/portfolio-projects", token, { method: "POST", body: JSON.stringify(data) }),
  updatePortfolioProject: (token: string, id: string, data: unknown) =>
    request<any>(`/portfolio-projects/${id}`, token, { method: "PATCH", body: JSON.stringify(data) }),

  listServiceRequests: (token: string) => request<any[]>("/service-requests", token),
  updateServiceRequestStatus: (token: string, id: string, toStatus: string) =>
    request<any>(`/service-requests/${id}/status`, token, {
      method: "PATCH",
      body: JSON.stringify({ toStatus }),
    }),

  listSettings: (token: string) => request<any[]>("/settings", token),
  updateSetting: (token: string, key: string, value: unknown) =>
    request<any>(`/settings/${key}`, token, { method: "PATCH", body: JSON.stringify({ value }) }),

  listAuditLogs: (token: string) => request<any[]>("/audit-logs", token),
};
