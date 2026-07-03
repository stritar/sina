/** Link-account fixtures. Valid typed; adversarial `unknown`. */

import type { LinkAccountPayload } from "./link-account.schema.js";

const account = { label: "External Checking", maskedNumber: "****4321" };

/** A bare account-link intent with NO step-up → escalate to the GovernedActionDialog. */
export const escalate: unknown = {
  institution: "First National Bank",
  account,
  consent: true,
};

/** The same terms cleared by a valid second-factor re-authentication → passes. */
export const authorized: LinkAccountPayload = {
  institution: "First National Bank",
  account,
  consent: true,
  stepUp: { secondFactor: "246810" },
};

/** A smuggled raw `password` (credentials never belong on the intent) → `.strict()` reject. */
export const reject: unknown = {
  institution: "First National Bank",
  account,
  consent: true,
  password: "hunter2",
};
