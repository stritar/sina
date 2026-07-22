/** Enable-margin fixtures. Valid typed; adversarial `unknown`. */

import type { EnableMarginPayload } from "./enable-margin.schema.js";

const marginTerms = {
  accountId: "acct-000123",
  marginTier: "reg_t" as const,
  title: "Margin Account Disclosure Statement",
  version: "2024.1",
  body: [
    "Margin trading involves the risk of loss and is not suitable for all investors.",
    "You can lose more funds than you deposit in the margin account.",
    "The firm can force the sale of securities or other assets in your account.",
  ],
};

/** No step-up → escalate to MandatoryDisclosure until acknowledged. */
export const escalate: unknown = { ...marginTerms };

/** Acknowledged → passes. */
export const authorized: EnableMarginPayload = {
  ...marginTerms,
  stepUp: { acknowledged: true },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = { ...marginTerms, confirmButton: { label: "Enable margin" } };
