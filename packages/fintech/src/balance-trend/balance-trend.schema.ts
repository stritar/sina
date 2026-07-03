/**
 * The balance-trend constitution — an UNGOVERNED display pattern.
 *
 * A masked account's balance over time — a pure read. Shape-only, `.strict()` per
 * point, bounded (≤366 daily points, a year). Each point's `balance` is a signed
 * integer in minor units (an account can go negative). Mounts the presentational
 * `BalanceTrend`. The masked account number is additionally `mask`-redacted.
 */

import { z } from "zod";
import type { RedactionConfig } from "@sina-design-system/governance";

import { currencyCode } from "../formats/currency.js";
import { maskedAccountRef } from "../formats/masked-account.js";

const trendPoint = z
  .object({
    date: z.string().datetime(),
    balance: z.number().int(),
  })
  .strict();

export const balanceTrendPayload = z
  .object({
    account: maskedAccountRef,
    currency: currencyCode,
    points: z.array(trendPoint).max(366, "too many points (max 366)"),
  })
  .strict();

export type BalanceTrendPayload = z.infer<typeof balanceTrendPayload>;

export const BALANCE_TREND_VERSION = "1.0.0";

export const BALANCE_TREND_REDACTION: RedactionConfig = { mask: ["maskedNumber"] };
