/**
 * The budget-progress constitution — an UNGOVERNED display pattern.
 *
 * Spent-vs-limit per budget category — a pure read. Shape-only, integer minor
 * units, positive limits, bounded list. Mounts the presentational `BudgetProgress`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const budget = z
  .object({
    label: z.string().min(1).max(80),
    spent: minorUnitAmount,
    limit: minorUnitAmount.min(1, "budget limit must be positive"),
  })
  .strict();

export const budgetProgressPayload = z
  .object({
    currency: currencyCode,
    budgets: z.array(budget).max(40, "too many budgets (max 40)"),
  })
  .strict();

export type BudgetProgressPayload = z.infer<typeof budgetProgressPayload>;

export const BUDGET_PROGRESS_VERSION = "1.0.0";
