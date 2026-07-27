"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(path: string, accessToken: string, body: unknown) {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export function approvePayment(accessToken: string, paymentId: string) {
  return request("/payments/approve", accessToken, { paymentId });
}

export function completePayment(accessToken: string, paymentId: string, txid: string) {
  return request("/payments/complete", accessToken, { paymentId, txid });
}
