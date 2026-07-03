/** change-limit fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import { actionHash } from "../formats/step-up.js";
import type { ChangeLimitPayload } from "./change-limit.schema.js";

/** $40,000 new daily-card limit — above the $10k authorization threshold, no step-up → escalate. */
export const escalate: unknown = {
  amount: usd(40_000),
  currency: "USD",
  limitType: "daily_card",
};

/** The same terms with a valid cross-party authorization bound to them → passes. */
const terms: ChangeLimitPayload = {
  amount: usd(40_000),
  currency: "USD",
  limitType: "daily_card",
};
export const authorized: ChangeLimitPayload = {
  ...terms,
  stepUp: {
    approverId: "mgr:dana",
    approverName: "Dana Approver",
    secondFactor: "246810",
    payloadHash: actionHash(terms),
  },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  amount: usd(40_000),
  currency: "USD",
  limitType: "daily_card",
  confirmButton: { label: "Raise limit" },
};
