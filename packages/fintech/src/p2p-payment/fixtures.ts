/** P2P-payment fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { P2pPaymentPayload } from "./p2p-payment.schema.js";

const recipient = { handle: "@jordan", name: "Jordan Rivera" };

/** $10,000 — above the $2,500 P2P threshold, no step-up → escalate. */
export const escalate: unknown = {
  amount: usd(10_000),
  currency: "USD",
  recipient,
};

/** The same terms with a valid second factor → passes. */
export const authorized: P2pPaymentPayload = {
  amount: usd(10_000),
  currency: "USD",
  recipient,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  amount: usd(10_000),
  currency: "USD",
  recipient,
  confirmButton: { label: "Send now" },
};
