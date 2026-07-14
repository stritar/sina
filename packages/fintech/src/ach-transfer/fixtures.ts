/** ACH-transfer fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import { actionHash } from "../formats/step-up.js";
import type { AchTransferPayload } from "./ach-transfer.schema.js";

const counterparty = {
  name: "Beta LLC",
  routingNumber: "021000021", // valid ABA (JPMorgan Chase)
  accountNumber: "1234567890",
};

/** $500 — below every band → clean pass. */
export const validSmall: AchTransferPayload = {
  amount: usd(500),
  currency: "USD",
  counterparty,
};

/** $60,000 — above the $25k authorization threshold, no step-up → escalate. */
export const overLimit: unknown = {
  amount: usd(60_000),
  currency: "USD",
  counterparty,
};

/** $60,000 with a valid cross-party authorization bound to the exact terms → passes. */
const approvedTerms: AchTransferPayload = { amount: usd(60_000), currency: "USD", counterparty };
export const validAuthorized: AchTransferPayload = {
  ...approvedTerms,
  stepUp: {
    approverId: "mgr:dana",
    approverName: "Dana Approver",
    secondFactor: "246810",
    payloadHash: actionHash(approvedTerms),
  },
};

/** $1.5M same-day entry — above the Nacha per-payment ceiling → hard reject. */
export const sameDayOverNachaLimit: unknown = {
  amount: usd(1_500_000),
  currency: "USD",
  counterparty,
  sameDay: true,
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const fabricatedConfirm: unknown = {
  amount: usd(500),
  currency: "USD",
  counterparty,
  confirmButton: { label: "Send now" },
};
