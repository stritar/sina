/** Issue-card fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { IssueCardPayload } from "./issue-card.schema.js";

const terms = {
  cardType: "virtual" as const,
  holder: "Ada Lovelace",
  spendLimit: usd(5_000),
  currency: "USD" as const,
};

/** No step-up → escalate to the GovernedActionDialog (second-factor). */
export const escalate: unknown = { ...terms };

/** The same terms with a valid second factor → passes. */
export const authorized: IssueCardPayload = {
  ...terms,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...terms,
  confirmButton: { label: "Issue now" },
};
