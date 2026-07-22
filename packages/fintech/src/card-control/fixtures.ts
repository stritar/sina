/** Card-control fixtures. Valid typed; adversarial `unknown`. */

import type { CardControlPayload } from "./card-control.schema.js";

const card = { label: "Personal Debit", maskedNumber: "****1234" };

/** A destructive `cancel` with NO step-up → escalate to the GovernedActionDialog. */
export const escalate: unknown = {
  action: "cancel",
  card,
};

/** The same destructive terms cleared by a valid second-factor re-authentication → passes. */
export const authorized: CardControlPayload = {
  action: "cancel",
  card,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  action: "cancel",
  card,
  confirmButton: { label: "Confirm" },
};
