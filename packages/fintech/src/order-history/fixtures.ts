/** Order-history fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { OrderHistoryPayload } from "./order-history.schema.js";

export const valid: OrderHistoryPayload = {
  orders: [
    {
      id: "ord_1001",
      symbol: "AAPL",
      side: "buy",
      quantity: 25,
      price: usd(189),
      currency: "USD",
      filledAt: "2026-06-28T14:32:00.000Z",
      status: "filled",
    },
    {
      id: "ord_1002",
      symbol: "TSLA",
      side: "sell",
      quantity: 10,
      price: usd(242),
      currency: "USD",
      filledAt: "2026-06-29T09:15:00.000Z",
      status: "partial",
    },
    {
      id: "ord_1003",
      symbol: "NVDA",
      side: "buy",
      quantity: 5,
      price: usd(128),
      currency: "USD",
      filledAt: "2026-06-30T16:00:00.000Z",
      status: "open",
    },
  ],
};

export const validEmpty: OrderHistoryPayload = { orders: [] };

/** `side` outside the enum → schema reject (a hostile stream cannot inject a rogue action). */
export const adversarial: unknown = {
  orders: [
    {
      id: "ord_x",
      symbol: "AAPL",
      side: "short",
      quantity: 1,
      price: usd(100),
      currency: "USD",
      filledAt: "2026-06-28T14:32:00.000Z",
      status: "filled",
    },
  ],
};
