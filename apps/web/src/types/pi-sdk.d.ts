/**
 * Minimal ambient type for Pi Network's SDK, loaded via a <script>
 * tag (see layout.tsx) rather than an npm package — Pi Network
 * distributes the SDK this way, not as an installable module.
 *
 * This is a deliberately minimal shape covering only what
 * lib/piSdk.ts actually calls — not a full/official type definition
 * (Pi Network doesn't publish one), so treat this as best-effort,
 * not authoritative.
 */
interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

interface PiPaymentDTO {
  identifier: string;
  [key: string]: unknown;
}

interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

interface PiSDK {
  init(config: { version: string; sandbox?: boolean }): void;
  authenticate(
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPaymentDTO) => void
  ): Promise<PiAuthResult>;
  createPayment(data: PiPaymentData, callbacks: PiPaymentCallbacks): void;
}

interface Window {
  Pi?: PiSDK;
}
