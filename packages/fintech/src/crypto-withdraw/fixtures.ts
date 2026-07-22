/** Crypto-withdraw fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import { actionHash } from "../formats/step-up.js";
import type { CryptoWithdrawPayload } from "./crypto-withdraw.schema.js";

/** The action terms shared across fixtures (the payload minus its step-up envelope). */
const terms: CryptoWithdrawPayload = {
  amount: usd(4_000),
  currency: "USD",
  asset: "BTC",
  quantity: 0.0625,
  destination: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  network: "bitcoin",
};

/** $4,000 — above the FATF Travel Rule threshold, no step-up → escalate. */
export const escalate: unknown = { ...terms };

/** The same terms with a valid cross-party authorization bound to the exact terms → passes. */
export const authorized: CryptoWithdrawPayload = {
  ...terms,
  stepUp: {
    approverId: "mgr:dana",
    approverName: "Dana Approver",
    secondFactor: "246810",
    payloadHash: actionHash(terms),
  },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...terms,
  confirmButton: { label: "Withdraw now" },
};
