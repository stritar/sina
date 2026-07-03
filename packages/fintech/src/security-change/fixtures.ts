/** Security-change fixtures. Valid typed; adversarial `unknown`. */

import type { SecurityChangePayload } from "./security-change.schema.js";

const terms = {
  change: "password" as const,
};

/** No step-up → escalate to the GovernedActionDialog (second-factor). */
export const escalate: unknown = { ...terms };

/** The same terms with a valid second factor → passes. */
export const authorized: SecurityChangePayload = {
  ...terms,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...terms,
  confirmButton: { label: "Change now" },
};
