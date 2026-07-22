/**
 * The spending-breakdown constitution — an UNGOVERNED display pattern.
 *
 * "Where did my money go this month?" — a pure read: category totals for a
 * period. Shape-only (no policy/escalation), integer minor units, bounded
 * category list. Mounts the presentational `SpendingBreakdown`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const category = z
  .object({
    label: z.string().min(1).max(80),
    amount: minorUnitAmount,
  })
  .strict();

export const spendingBreakdownPayload = z
  .object({
    period: z.string().min(1).max(40),
    currency: currencyCode,
    total: minorUnitAmount,
    categories: z.array(category).max(40, "too many categories (max 40)"),
  })
  .strict();

export type SpendingBreakdownPayload = z.infer<typeof spendingBreakdownPayload>;

export const SPENDING_BREAKDOWN_VERSION = "1.0.0";
