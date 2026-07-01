/**
 * The rewards-summary constitution — an UNGOVERNED display pattern.
 *
 * Points balance, tier, and optional progress toward the next tier / cashback —
 * a pure read. Shape-only; points are a non-negative integer; cashback is integer
 * minor units. Mounts the presentational `RewardsSummary`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

export const rewardsSummaryPayload = z
  .object({
    program: z.string().min(1).max(80),
    currency: currencyCode,
    points: z.number().int().nonnegative(),
    tier: z.string().min(1).max(40),
    nextTier: z.string().min(1).max(40).optional(),
    pointsToNextTier: z.number().int().nonnegative().optional(),
    cashback: minorUnitAmount.optional(),
  })
  .strict();

export type RewardsSummaryPayload = z.infer<typeof rewardsSummaryPayload>;

export const REWARDS_SUMMARY_VERSION = "1.0.0";
