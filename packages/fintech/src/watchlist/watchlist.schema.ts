/**
 * The watchlist constitution — an UNGOVERNED display pattern.
 *
 * Tracked instruments with price + day change — a pure read. Shape-only; price
 * is integer minor units; `changePct` is a plain number. Bounded. Mounts the
 * presentational `Watchlist`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const watchItem = z
  .object({
    symbol: z.string().min(1).max(12),
    name: z.string().min(1).max(80),
    price: minorUnitAmount,
    currency: currencyCode,
    changePct: z.number(),
  })
  .strict();

export const watchlistPayload = z
  .object({
    items: z.array(watchItem).max(100, "too many items (max 100)"),
  })
  .strict();

export type WatchlistPayload = z.infer<typeof watchlistPayload>;

export const WATCHLIST_VERSION = "1.0.0";
