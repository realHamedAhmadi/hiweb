"use client";

/**
 * Client-side call to create a ServiceRequest — used by the Contact
 * page. Requires a valid access token (the endpoint is authenticated,
 * per backend-architecture.md's permissions table: submitting a
 * request requires being logged in).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateServiceRequestInput {
  serviceCategoryId?: string;
  projectDetails: string;
}

export async function createServiceRequest(
  accessToken: string,
  input: CreateServiceRequestInput
) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const res = await fetch(`${API_URL}/service-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? "Failed to submit request");
  }
  return res.json();
}
