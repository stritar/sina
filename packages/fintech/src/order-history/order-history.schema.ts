/**
 * The order-history constitution — an UNGOVERNED display pattern.
 *
 * A trade-order ledger with side, quantity, fill price and status — a pure read.
 * Shape-only; `price` is integer minor units; `quantity` is a plain number
 * (fractional shares allowed). Bounded. Mounts the presentational `OrderHistory`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const order = z
  .object({
    id: z.string().min(1).max(40),
    symbol: z.string().min(1).max(12),
    side: z.enum(["buy", "sell"]),
    quantity: z.number().nonnegative(),
    price: minorUnitAmount,
    currency: currencyCode,
    filledAt: z.string().datetime(),
    status: z.enum(["filled", "partial", "canceled", "open"]),
  })
  .strict();

export const orderHistoryPayload = z
  .object({
    orders: z.array(order).max(100, "too many orders (max 100)"),
  })
  .strict();

export type OrderHistoryPayload = z.infer<typeof orderHistoryPayload>;

export const ORDER_HISTORY_VERSION = "1.0.0";
