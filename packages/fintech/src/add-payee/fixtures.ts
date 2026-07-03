/** Add-payee fixtures. Valid typed; adversarial `unknown`. */

import type { AddPayeePayload } from "./add-payee.schema.js";

const payee = { name: "Acme Vendor LLC", maskedNumber: "****4321", routingHint: "Chase ACH" };

/** A new payee with NO step-up → escalate to the GovernedActionDialog. */
export const escalate: unknown = { ...payee };

/** The same terms cleared by a valid second-factor re-authentication → passes. */
export const authorized: AddPayeePayload = {
  ...payee,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...payee,
  confirmButton: { label: "Confirm" },
};
