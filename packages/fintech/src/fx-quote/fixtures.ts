/** FX quote fixtures. Valid typed; adversarial `unknown`. */

import type { FxQuotePayload } from "./fx-quote.schema.js";

export const valid: FxQuotePayload = {
  base: "EUR",
  quote: "USD",
  rate: 1.0847,
  asOf: "2026-07-03T14:30:00.000Z",
  spreadBps: 12,
};

/** A minimal valid quote: no dealer spread. */
export const validEmpty: FxQuotePayload = {
  base: "GBP",
  quote: "USD",
  rate: 1.2731,
  asOf: "2026-07-03T14:30:00.000Z",
};

/** A non-positive rate → `.positive()` reject (a hostile stream cannot post a zero/negative quote). */
export const adversarial: unknown = {
  base: "EUR",
  quote: "USD",
  rate: 0,
  asOf: "2026-07-03T14:30:00.000Z",
};
