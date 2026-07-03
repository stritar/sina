/** Place-trade fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { PlaceTradePayload } from "./place-trade.schema.js";

const terms = {
  symbol: "AAPL",
  side: "buy" as const,
  quantity: 100,
  orderType: "limit" as const,
  limitPrice: usd(220),
  currency: "USD" as const,
};

/** No step-up → escalate to the GovernedActionDialog (second-factor). */
export const escalate: unknown = { ...terms };

/** The same terms with a valid second factor → passes. */
export const authorized: PlaceTradePayload = {
  ...terms,
  stepUp: { secondFactor: "246810" },
};

/** A fabricated `confirmButton` key → `.strict()` reject. */
export const reject: unknown = {
  ...terms,
  confirmButton: { label: "Place order" },
};
