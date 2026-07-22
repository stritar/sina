/**
 * The upcoming-payments constitution — an UNGOVERNED display pattern.
 *
 * Scheduled / pending / overdue payments for display. Shape-only, integer minor
 * units, ISO due dates, `.strict()` per payment, bounded. Mounts the
 * presentational `UpcomingPayments`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const payment = z
  .object({
    id: z.string().min(1).max(64),
    payee: z.string().min(1).max(140),
    amount: minorUnitAmount,
    dueAt: z.string().datetime({ message: "dueAt must be an ISO-8601 timestamp" }),
    status: z.enum(["scheduled", "pending", "overdue"]),
  })
  .strict();

export const upcomingPaymentsPayload = z
  .object({
    currency: currencyCode,
    payments: z.array(payment).max(100, "too many payments (max 100)"),
  })
  .strict();

export type UpcomingPaymentsPayload = z.infer<typeof upcomingPaymentsPayload>;

export const UPCOMING_PAYMENTS_VERSION = "1.0.0";
