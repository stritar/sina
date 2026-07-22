/**
 * The recurring-list constitution — an UNGOVERNED display pattern.
 *
 * Recurring subscriptions for display: merchant, amount, cadence, next charge,
 * and status — a pure read. Shape-only; `amount` is integer minor units; no
 * masked fields. `.strict()` per subscription, bounded. Mounts the presentational
 * `RecurringList`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const subscription = z
  .object({
    id: z.string().min(1).max(40),
    merchant: z.string().min(1).max(80),
    amount: minorUnitAmount,
    cadence: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
    nextChargeAt: z.string().datetime(),
    status: z.enum(["active", "paused", "canceled"]),
  })
  .strict();

export const recurringListPayload = z
  .object({
    currency: currencyCode,
    subscriptions: z.array(subscription).max(100, "too many subscriptions (max 100)"),
  })
  .strict();

export type RecurringListPayload = z.infer<typeof recurringListPayload>;

export const RECURRING_LIST_VERSION = "1.0.0";
