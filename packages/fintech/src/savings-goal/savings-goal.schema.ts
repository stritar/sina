/**
 * The savings-goal constitution — an UNGOVERNED display pattern.
 *
 * A set of savings goals with progress toward a target — a pure read. Shape-only;
 * `saved`/`target` are integer minor units; the optional `dueAt` is an ISO
 * timestamp. Bounded. No policy, no escalation. Mounts the presentational
 * `SavingsGoal`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const savingsGoal = z
  .object({
    id: z.string().min(1).max(40),
    name: z.string().min(1).max(80),
    saved: minorUnitAmount,
    target: minorUnitAmount,
    dueAt: z.string().datetime().optional(),
  })
  .strict();

export const savingsGoalPayload = z
  .object({
    currency: currencyCode,
    goals: z.array(savingsGoal).max(50, "too many goals (max 50)"),
  })
  .strict();

export type SavingsGoalPayload = z.infer<typeof savingsGoalPayload>;

export const SAVINGS_GOAL_VERSION = "1.0.0";
