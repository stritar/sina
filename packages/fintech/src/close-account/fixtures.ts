/** Close-account fixtures. Valid typed; adversarial `unknown`. */

import { actionHash } from "../formats/step-up.js";
import type { CloseAccountPayload } from "./close-account.schema.js";

const account = { label: "Everyday Checking", maskedNumber: "****4321" };

/** The exact closure terms an authorization binds to (WITHOUT stepUp). */
const TERMS: CloseAccountPayload = {
  accountId: "acct_7f3a91",
  account,
  reason: "Consolidating to a single checking account.",
};

/** The bare closure with NO step-up → escalate to the GovernedActionDialog. */
export const escalate: unknown = { ...TERMS };

/** The same terms cleared by a valid cross-party authorization bound to them → passes. */
export const authorized: CloseAccountPayload = {
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
  confirmButton: { label: "Confirm" },
};
