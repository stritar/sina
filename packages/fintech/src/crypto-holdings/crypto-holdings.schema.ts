/**
 * The crypto-holdings constitution — an UNGOVERNED display pattern.
 *
 * Cryptocurrency positions for display: asset, name, quantity, value, day change.
 * Shape-only; value/total are integer minor units; `quantity`/`changePct` are
 * plain numbers (fractional coins, +/- percent). Bounded. Mounts `CryptoHoldings`.
 * Trading a coin is a *governed* flow (out of scope here).
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const cryptoHolding = z
  .object({
    asset: z.string().min(1).max(12),
    name: z.string().min(1).max(40),
    quantity: z.number().nonnegative(),
    value: minorUnitAmount,
    changePct: z.number(),
  })
  .strict();

export const cryptoHoldingsPayload = z
  .object({
    currency: currencyCode,
    totalValue: minorUnitAmount,
    holdings: z.array(cryptoHolding).max(100, "too many holdings (max 100)"),
  })
  .strict();

export type CryptoHoldingsPayload = z.infer<typeof cryptoHoldingsPayload>;

export const CRYPTO_HOLDINGS_VERSION = "1.0.0";
