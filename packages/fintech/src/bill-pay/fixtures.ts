/** Bill-pay fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import { actionHash } from "../formats/step-up.js";
import type { BillPayPayload } from "./bill-pay.schema.js";

const payee = {
  id: "payee:acme-utilities",
  name: "Acme Utilities",
  maskedNumber: "****4321",
};

/** $40,000 — above the $10k authorization threshold, no step-up → escalate. */
export const escalate: unknown = {
  amount: usd(40_000),
  currency: "USD",
  payee,
};

/** $40,000 with a valid cross-party authorization bound to the exact terms → passes. */
const authorizedTerms: BillPayPayload = { amount: usd(40_000), currency: "USD", payee };
export const authorized: BillPayPayload = {
  ...authorizedTerms,
  stepUp: {
    approverId: "mgr:dana",
    approverName: "Dana Approver",
    secondFactor: "246810",
    payloadHash: actionHash(authorizedTerms),
  },
};

/** The terms plus a fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  amount: usd(40_000),
  currency: "USD",
  payee,
  confirmButton: { label: "Pay now" },
};
