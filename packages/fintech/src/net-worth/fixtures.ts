/** Net-worth fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { NetWorthPayload } from "./net-worth.schema.js";

export const valid: NetWorthPayload = {
  currency: "USD",
  assets: usd(482_000),
  liabilities: usd(213_500),
  net: usd(268_500),
  breakdown: [
    { label: "Checking & savings", amount: usd(42_000), kind: "asset" },
    { label: "Brokerage", amount: usd(156_000), kind: "asset" },
    { label: "Home equity", amount: usd(284_000), kind: "asset" },
    { label: "Mortgage", amount: usd(-198_500), kind: "liability" },
    { label: "Auto loan", amount: usd(-15_000), kind: "liability" },
  ],
};

/** Minimal but valid: only cash, no per-position breakdown. */
export const validEmpty: NetWorthPayload = {
  currency: "USD",
  assets: usd(12_500),
  liabilities: usd(0),
  net: usd(12_500),
};

/** Non-integer `assets` (fractional minor units) → `minorUnitAmount` rejects. */
export const adversarial: unknown = {
  currency: "USD",
  assets: 4820.55,
  liabilities: usd(0),
  net: 482_055,
};
