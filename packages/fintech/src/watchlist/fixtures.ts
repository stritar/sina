/** Watchlist fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { WatchlistPayload } from "./watchlist.schema.js";

export const validWatchlist: WatchlistPayload = {
  items: [
    { symbol: "TSLA", name: "Tesla", price: usd(240), currency: "USD", changePct: 2.3 },
    { symbol: "NVDA", name: "NVIDIA", price: usd(128), currency: "USD", changePct: -1.1 },
    { symbol: "BTC", name: "Bitcoin", price: usd(61_000), currency: "USD", changePct: 0.9 },
  ],
};

export const validEmpty: WatchlistPayload = { items: [] };

/** 101 items → `.max(100)` reject (a hostile stream cannot flood the client). */
export const floodItems: unknown = {
  items: Array.from({ length: 101 }, (_value, index) => ({
    symbol: `S${index}`,
    name: "x",
    price: usd(1),
    currency: "USD",
    changePct: 0,
  })),
};
