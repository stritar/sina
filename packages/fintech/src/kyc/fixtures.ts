/** KYC fixtures. Valid typed; adversarial `unknown`. */

import type { KycPayload } from "./kyc.schema.js";

const terms = {
  fullName: "Jordan Rivera",
  country: "US",
  idType: "passport" as const,
  idLast4: "1234",
};

/** No step-up → escalate to the GovernedActionDialog. */
export const escalate: unknown = { ...terms };

/** The same terms with a valid second factor → passes. */
export const authorized: KycPayload = {
  ...terms,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...terms,
  confirmButton: { label: "Verify" },
};
