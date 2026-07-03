/** FX-convert fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import { actionHash } from "../formats/step-up.js";
import type { FxConvertPayload } from "./fx-convert.schema.js";

/** The exact conversion terms an authorization binds to (payload minus its step-up). */
const TERMS: FxConvertPayload = {
  amount: usd(40_000),
  currency: "USD",
  toCurrency: "EUR",
  rate: 0.92,
  spreadBps: 25,
};

/** $40,000 — above the $10k FX authorization threshold, no step-up → escalate. */
export const escalate: unknown = { ...TERMS };

/** The same terms with a valid cross-party authorization bound to the exact terms → passes. */
export const authorized: FxConvertPayload = {
  ...TERMS,
  stepUp: {
    approverId: "mgr:dana",
    approverName: "Dana Approver",
    secondFactor: "246810",
    payloadHash: actionHash(TERMS),
  },
};

/** A smuggled `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...TERMS,
  confirmButton: { label: "Convert now" },
};
