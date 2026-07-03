/** Withdraw fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import { actionHash } from "../formats/step-up.js";
import type { WithdrawPayload } from "./withdraw.schema.js";

const account = { label: "Checking", maskedNumber: "****4321" };

/** The exact withdrawal terms the authorization binds to (no step-up). */
const TERMS: WithdrawPayload = {
  amount: usd(40_000),
  currency: "USD",
  method: "branch",
  account,
};

/** $40,000 — above the $10k authorization threshold, no step-up → escalate. */
export const escalate: unknown = { ...TERMS };

/** $40,000 with a valid cross-party authorization bound to the exact terms → passes. */
export const authorized: WithdrawPayload = {
  ...TERMS,
  stepUp: {
    approverId: "mgr:dana",
    approverName: "Dana Approver",
    secondFactor: "246810",
    payloadHash: actionHash(TERMS),
  },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...TERMS,
  confirmButton: { label: "Withdraw now" },
};
