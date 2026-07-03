/** CryptoHoldings fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { CryptoHoldingsPayload } from "./crypto-holdings.schema.js";

export const valid: CryptoHoldingsPayload = {
  currency: "USD",
  totalValue: usd(84_250),
  holdings: [
    { asset: "BTC", name: "Bitcoin", quantity: 1.25, value: usd(76_250), changePct: 2.4 },
    { asset: "ETH", name: "Ethereum", quantity: 2.5, value: usd(6_500), changePct: -1.2 },
    { asset: "SOL", name: "Solana", quantity: 30, value: usd(1_500), changePct: 5.1 },
  ],
};

export const validEmpty: CryptoHoldingsPayload = {
  currency: "USD",
  totalValue: usd(0),
  holdings: [],
};

/** 101 holdings → `.max(100)` reject (a hostile stream cannot flood the client). */
export const adversarial: unknown = {
  currency: "USD",
  totalValue: usd(1),
  holdings: Array.from({ length: 101 }, (_value, index) => ({
    asset: `A${index}`,
    name: "x",
    quantity: 1,
    value: usd(1),
    changePct: 0,
  })),
};
