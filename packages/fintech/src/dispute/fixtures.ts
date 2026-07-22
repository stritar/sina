/** Dispute fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { DisputePayload } from "./dispute.schema.js";

const disputedTransaction = {
  transactionId: "txn_9f2c1a",
  amount: usd(420),
  currency: "USD" as const,
  reason: "unauthorized" as const,
};

/** A bare dispute with NO step-up → escalate to the GovernedActionDialog. */
export const escalate: unknown = {
  ...disputedTransaction,
};

/** The same terms cleared by a valid second-factor re-authentication → passes. */
export const authorized: DisputePayload = {
  ...disputedTransaction,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...disputedTransaction,
  confirmButton: { label: "Confirm" },
};
