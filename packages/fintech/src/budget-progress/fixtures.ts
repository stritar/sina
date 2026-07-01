/** Budget-progress fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { BudgetProgressPayload } from "./budget-progress.schema.js";

export const validBudgets: BudgetProgressPayload = {
  currency: "USD",
  budgets: [
    { label: "Dining", spent: usd(420), limit: usd(500) },
    { label: "Groceries", spent: usd(610), limit: usd(600) }, // over budget
    { label: "Entertainment", spent: usd(90), limit: usd(200) },
  ],
};

export const validEmpty: BudgetProgressPayload = { currency: "USD", budgets: [] };

/** A zero limit → `.min(1)` reject (would divide by zero in the bar). */
export const zeroLimit: unknown = {
  currency: "USD",
  budgets: [{ label: "Dining", spent: usd(100), limit: 0 }],
};
