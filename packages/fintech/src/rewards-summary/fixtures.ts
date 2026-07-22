/** Rewards-summary fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { RewardsSummaryPayload } from "./rewards-summary.schema.js";

export const validRewards: RewardsSummaryPayload = {
  program: "SINA Rewards",
  currency: "USD",
  points: 12_450,
  tier: "Gold",
  nextTier: "Platinum",
  pointsToNextTier: 2_550,
  cashback: usd(42),
};

/** A minimal valid summary (no next-tier / cashback). */
export const validMinimal: RewardsSummaryPayload = {
  program: "SINA Rewards",
  currency: "USD",
  points: 300,
  tier: "Silver",
};

/** Non-integer points → `.int()` reject. */
export const fractionalPoints: unknown = {
  program: "SINA Rewards",
  currency: "USD",
  points: 12_450.5,
  tier: "Gold",
};
