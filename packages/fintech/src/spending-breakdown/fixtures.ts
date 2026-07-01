/** Spending-breakdown fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { SpendingBreakdownPayload } from "./spending-breakdown.schema.js";

export const validBreakdown: SpendingBreakdownPayload = {
  period: "June 2026",
  currency: "USD",
  total: usd(3_200),
  categories: [
    { label: "Dining", amount: usd(820) },
    { label: "Groceries", amount: usd(640) },
    { label: "Transport", amount: usd(410) },
    { label: "Shopping", amount: usd(730) },
    { label: "Bills", amount: usd(600) },
  ],
};

export const validEmpty: SpendingBreakdownPayload = {
  period: "June 2026",
  currency: "USD",
  total: usd(0),
  categories: [],
};

/** A smuggled key inside a category row → nested `.strict()` reject. */
export const fabricatedCategoryKey: unknown = {
  period: "June 2026",
  currency: "USD",
  total: usd(3_200),
  categories: [{ label: "Dining", amount: usd(820), confirmButton: true }],
};
