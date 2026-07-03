/** Credit-request fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { CreditRequestPayload } from "./credit-request.schema.js";

const loanTerms = {
  amount: usd(20_000),
  currency: "USD" as const,
  productType: "personal_loan" as const,
  termMonths: 36,
  title: "Personal Loan — Truth in Lending Disclosure",
  version: "2026.1",
  body: [
    "Annual Percentage Rate (APR): the cost of your credit as a yearly rate is 14.99%.",
    "Finance Charge: the dollar amount the credit will cost you is $4,512.20.",
    "You have the right to receive these disclosures before you become obligated on the loan.",
  ],
};

/** No step-up → escalate to MandatoryDisclosure until the disclosures are acknowledged. */
export const escalate: unknown = { ...loanTerms };

/** The same terms with the disclosures acknowledged → passes. */
export const authorized: CreditRequestPayload = {
  ...loanTerms,
  stepUp: { acknowledged: true },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...loanTerms,
  confirmButton: { label: "Accept loan" },
};
