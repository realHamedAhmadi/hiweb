"use client";

import { useState } from "react";
import { Button, Card, NodeMark } from "@hiweb/ui";
import { useAuth } from "@/context/AuthContext";
import { createPiPayment } from "@/lib/piSdk";
import { approvePayment, completePayment } from "@/lib/paymentApi";

/**
 * Pi Payment test page — exists SPECIFICALLY to satisfy the Pi
 * Developer Portal's onboarding checklist step "Process a Transaction
 * on the App" (requires one real User-to-App test payment). This is
 * not a real product feature — no ServiceRequest/Quotation linkage,
 * a fixed tiny test amount. Real Pi Payments (tied to quotations,
 * Phase 2 per the approved MVP scope) are separate, future work.
 *
 * Must be opened via Pi Browser at the app's confirmed Development or
 * Production URL — the Pi SDK payment popup only works inside Pi
 * Browser, same limitation already true for Pi Login.
 */
export default function PiPaymentTestPage() {
  const { status, accessToken, login } = useAuth();
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function addLog(line: string) {
    setLog((prev) => [...prev, line]);
  }

  function handleTestPayment() {
    if (!accessToken) return;
    setBusy(true);
    setLog([]);

    createPiPayment(
      {
        amount: 0.01,
        memo: "Hiweb test payment",
        metadata: { purpose: "developer-checklist-test" },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          addLog(`Ready for approval: ${paymentId}`);
          try {
            await approvePayment(accessToken, paymentId);
            addLog("Approved by server ✅");
          } catch (err) {
            addLog(`Approval failed: ${err instanceof Error ? err.message : "unknown error"}`);
            setBusy(false);
          }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          addLog(`Ready for completion: ${paymentId} / txid ${txid}`);
          try {
            await completePayment(accessToken, paymentId, txid);
            addLog("Completed by server ✅ — payment done!");
          } catch (err) {
            addLog(`Completion failed: ${err instanceof Error ? err.message : "unknown error"}`);
          } finally {
            setBusy(false);
          }
        },
        onCancel: (paymentId) => {
          addLog(`Cancelled: ${paymentId}`);
          setBusy(false);
        },
        onError: (error) => {
          addLog(`Error: ${error.message}`);
          setBusy(false);
        },
      }
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-start">
      <NodeMark className="mb-6 h-8 w-8 text-gold-500" />
      <h1 className="font-display text-2xl font-bold text-ink-900">Pi Payment Test</h1>
      <p className="mt-3 text-ink-700">
        A minimal test payment (0.01 Pi) — used only to confirm the Pi
        Payments integration works, per the Pi Developer Portal
        checklist. Must be opened in Pi Browser.
      </p>

      <Card className="mt-6">
        {status !== "authenticated" ? (
          <>
            <p className="mb-3 text-sm text-ink-700">Log in with Pi first.</p>
            <Button variant="accent" size="sm" onClick={login}>
              Login with Pi
            </Button>
          </>
        ) : (
          <Button variant="accent" size="sm" disabled={busy} onClick={handleTestPayment}>
            {busy ? "Processing…" : "Send Test Payment (0.01 Pi)"}
          </Button>
        )}

        {log.length > 0 && (
          <pre className="mt-4 overflow-x-auto rounded-md bg-paper-100 p-3 text-xs text-ink-700">
            {log.join("\n")}
          </pre>
        )}
      </Card>
    </section>
  );
}
