/** Recurring-setup fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import { actionHash } from "../formats/step-up.js";
import type { RecurringSetupPayload } from "./recurring-setup.schema.js";

const payee = { name: "Landlord Holdings LLC" };
const startAt = "2026-08-01T00:00:00.000Z";

/** $20,000 per cycle — above the standing-order cap, no step-up → escalate. */
export const escalate: unknown = {
  amount: usd(20_000),
  currency: "USD",
  cadence: "monthly",
  payee,
  startAt,
};

/** The exact standing-order terms the authorization binds to (no step-up). */
const terms: RecurringSetupPayload = {
  amount: usd(20_000),
  currency: "USD",
  cadence: "monthly",
  payee,
  startAt,
};

/** The same terms with a valid cross-party authorization bound to them → passes. */
export const authorized: RecurringSetupPayload = {
  ...terms,
  stepUp: {
    approverId: "mgr:dana",
    approverName: "Dana Approver",
    secondFactor: "246810",
    payloadHash: actionHash(terms),
  },
};

/** A smuggled `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...terms,
  confirmButton: { label: "Set up now" },
};
