/**
 * Server-authenticated calls to Pi's Platform API — used for payment
 * approve/complete, per Pi's official docs (pi-sdk-integration-guide,
 * platform_API.md). Uses the app's Server API Key
 * (`Authorization: Key <PI_API_KEY>`), NOT a user's access token —
 * this proves the request comes from Hiweb's own backend, not a
 * client.
 *
 * The API key is read from process.env.PI_API_KEY only — never
 * hardcoded, never logged, never sent to the frontend. See
 * .env.example for where it's configured.
 *
 * ⚠️ Same casing caveat as piNetwork.ts: uses `Key` (capitalized);
 * if this ever 401s unexpectedly, try lowercase `key` per the
 * conflicting official examples found.
 */

const PI_PLATFORM_API_URL =
  process.env.PI_PLATFORM_API_URL || "https://api.minepi.com";

function getApiKey(): string {
  const key = process.env.PI_API_KEY;
  if (!key) {
    // Fail closed — never attempt a server-authenticated Pi API call
    // without a real key configured.
    throw new Error("PI_API_KEY is not configured");
  }
  return key;
}

async function piServerRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${PI_PLATFORM_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Key ${getApiKey()}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Pi Platform API request failed (${response.status}): ${body || path}`
    );
  }

  // Some Pi endpoints (e.g. approve/complete) return an empty or
  // minimal body — guard against JSON parse errors on empty responses.
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Server-Side Approval — tells Pi's servers the app is ready for the
 * user to submit the transaction to the blockchain. Called after the
 * frontend's Pi.createPayment() triggers onReadyForServerApproval.
 */
export async function approvePiPayment(paymentId: string) {
  return piServerRequest(`/v2/payments/${paymentId}/approve`, {
    method: "POST",
  });
}

/**
 * Server-Side Completion — proves to Pi's servers that the app has
 * recorded the payment's blockchain transaction id (txid), finalizing
 * the payment. Called after the frontend's onReadyForServerCompletion
 * fires with (paymentId, txid).
 */
export async function completePiPayment(paymentId: string, txid: string) {
  return piServerRequest(`/v2/payments/${paymentId}/complete`, {
    method: "POST",
    body: JSON.stringify({ txid }),
  });
}
