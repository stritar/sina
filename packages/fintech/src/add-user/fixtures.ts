/** Add-user fixtures. Valid typed; adversarial `unknown`. */

import type { AddUserPayload } from "./add-user.schema.js";

const newUser = {
  name: "Jordan Rivera",
  email: "jordan.rivera@example.com",
  role: "member" as const,
};

/** A bare add-user with NO step-up → escalate to the GovernedActionDialog. */
export const escalate: unknown = {
  ...newUser,
};

/** The same terms cleared by a valid second-factor re-authentication → passes. */
export const authorized: AddUserPayload = {
  ...newUser,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...newUser,
  confirmButton: { label: "Confirm" },
};
