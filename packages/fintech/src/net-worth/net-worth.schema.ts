/**
 * The net-worth constitution — an UNGOVERNED display pattern.
 *
 * Assets, liabilities, and a derived net across a set of positions — a pure
 * read. Shape-only; `assets`/`liabilities` are non-negative integer minor units,
 * `net` is a signed integer (a debt-heavy sheet reads negative), and each
 * breakdown `amount` is signed (a liability line reads negative). Bounded.
 * Mounts the presentational `NetWorth`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const netWorthLine = z
  .object({
    label: z.string().min(1).max(60),
    amount: z.number().int(),
    kind: z.enum(["asset", "liability"]),
  })
  .strict();

export const netWorthPayload = z
  .object({
    currency: currencyCode,
    assets: minorUnitAmount,
    liabilities: minorUnitAmount,
    net: z.number().int(),
    breakdown: z.array(netWorthLine).max(40, "too many breakdown rows (max 40)").optional(),
  })
  .strict();

export type NetWorthPayload = z.infer<typeof netWorthPayload>;

export const NET_WORTH_VERSION = "1.0.0";
