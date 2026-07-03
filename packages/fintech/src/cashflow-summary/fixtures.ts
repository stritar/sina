/** Cashflow summary fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { CashflowSummaryPayload } from "./cashflow-summary.schema.js";

export const valid: CashflowSummaryPayload = {
  period: "June 2026",
  currency: "USD",
  inflow: usd(12_500),
  outflow: usd(8_200),
  net: usd(4_300),
};

/** A zero-cashflow period — valid, renders the empty state. */
export const validEmpty: CashflowSummaryPayload = {
  period: "July 2026",
  currency: "USD",
  inflow: usd(0),
  outflow: usd(0),
  net: usd(0),
};

/** Non-integer `inflow` (fractional cents) → `minorUnitAmount.int()` reject. */
export const adversarial: unknown = {
  period: "June 2026",
  currency: "USD",
  inflow: 12_500.5,
  outflow: usd(8_200),
  net: usd(4_300),
};
