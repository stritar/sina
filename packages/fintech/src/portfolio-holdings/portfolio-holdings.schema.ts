/**
 * The portfolio-holdings constitution — an UNGOVERNED display pattern.
 *
 * Investment positions for display: symbol, quantity, value, day change. Shape-
 * only; value/total are integer minor units; `quantity`/`changePct` are plain
 * numbers (fractional shares, +/- percent). Bounded. Mounts `PortfolioHoldings`.
 * Placing a trade is a *governed* flow (out of scope here).
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const holding = z
  .object({
    symbol: z.string().min(1).max(12),
    name: z.string().min(1).max(80),
    quantity: z.number().nonnegative(),
    value: minorUnitAmount,
    changePct: z.number(),
  })
  .strict();

export const portfolioHoldingsPayload = z
  .object({
    currency: currencyCode,
    totalValue: minorUnitAmount,
    holdings: z.array(holding).max(100, "too many holdings (max 100)"),
  })
  .strict();

export type PortfolioHoldingsPayload = z.infer<typeof portfolioHoldingsPayload>;

export const PORTFOLIO_HOLDINGS_VERSION = "1.0.0";
