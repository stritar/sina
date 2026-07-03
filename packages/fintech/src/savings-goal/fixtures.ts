/** SavingsGoal fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { SavingsGoalPayload } from "./savings-goal.schema.js";

export const valid: SavingsGoalPayload = {
  currency: "USD",
  goals: [
    { id: "goal_emergency", name: "Emergency Fund", saved: usd(6_500), target: usd(10_000) },
    {
      id: "goal_vacation",
      name: "Summer Vacation",
      saved: usd(1_200),
      target: usd(3_000),
      dueAt: "2026-06-01T00:00:00.000Z",
    },
    { id: "goal_laptop", name: "New Laptop", saved: usd(2_400), target: usd(2_400) },
  ],
};

export const validEmpty: SavingsGoalPayload = {
  currency: "USD",
  goals: [],
};

/** A non-integer `saved` amount → `minorUnitAmount.int()` reject (money is never a float). */
export const adversarial: unknown = {
  currency: "USD",
  goals: [{ id: "goal_bad", name: "Fractional cents", saved: 1_234.56, target: usd(5_000) }],
};
