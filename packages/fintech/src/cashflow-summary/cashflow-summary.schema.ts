/**
 * The cashflow-summary constitution — an UNGOVERNED display pattern.
 *
 * A period's inflow / outflow / net — a pure read. Shape-only (no
 * policy/escalation): inflow and outflow are integer minor units, `net` is a
 * signed integer (a period can run negative). No arrays. Mounts the
 * presentational `CashflowSummary`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

export const cashflowSummaryPayload = z
  .object({
    period: z.string().min(1).max(40),
    currency: currencyCode,
    inflow: minorUnitAmount,
    outflow: minorUnitAmount,
    net: z.number().int(),
  })
  .strict();

export type CashflowSummaryPayload = z.infer<typeof cashflowSummaryPayload>;

export const CASHFLOW_SUMMARY_VERSION = "1.0.0";
