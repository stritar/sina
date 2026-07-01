/** Portfolio-holdings fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { PortfolioHoldingsPayload } from "./portfolio-holdings.schema.js";

export const validHoldings: PortfolioHoldingsPayload = {
  currency: "USD",
  totalValue: usd(48_200),
  holdings: [
    { symbol: "AAPL", name: "Apple Inc.", quantity: 40, value: usd(9_200), changePct: 1.8 },
    { symbol: "MSFT", name: "Microsoft", quantity: 25, value: usd(11_500), changePct: -0.6 },
    { symbol: "VOO", name: "Vanguard S&P 500", quantity: 30, value: usd(27_500), changePct: 0.4 },
  ],
};

export const validEmpty: PortfolioHoldingsPayload = {
  currency: "USD",
  totalValue: usd(0),
  holdings: [],
};

/** A non-integer value (minor units must be integer) → reject. */
export const nonIntegerValue: unknown = {
  currency: "USD",
  totalValue: usd(1_000),
  holdings: [{ symbol: "AAPL", name: "Apple", quantity: 1, value: 920.5, changePct: 1 }],
};
