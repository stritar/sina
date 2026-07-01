/**
 * RewardsSummary — a SINA presentational fintech component (ungoverned).
 * Renders the validated `rewards_summary` payload: points, tier, optional
 * cashback + progress toward the next tier. Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Progress, Stack, SummaryList } from "@sina-design-system/core";
import type { SummaryItem } from "@sina-design-system/core";

import { formatAmount, readRewards } from "../format.js";

export interface RewardsSummaryProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function RewardsSummary({ payload }: RewardsSummaryProps) {
  const r = readRewards(payload);

  const items: SummaryItem[] = [
    { label: "Points", value: r.points.toLocaleString("en-US"), emphasis: true },
    {
      label: "Tier",
      value: (
        <Badge intent="info" size="sm">
          {r.tier}
        </Badge>
      ),
    },
    ...(r.cashback !== undefined
      ? [{ label: "Cashback", value: formatAmount(r.cashback, r.currency) }]
      : []),
  ];

  const pct =
    r.pointsToNextTier && r.pointsToNextTier > 0
      ? Math.min((r.points / (r.points + r.pointsToNextTier)) * 100, 100)
      : null;

  return (
    <Stack
      gap={3}
      aria-label={`${r.program} rewards`}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <span className="text-ui font-medium text-text">{r.program}</span>
      <SummaryList items={items} />
      {pct !== null && r.nextTier ? (
        <Stack gap={1}>
          <span className="text-xs text-text-subtle">
            {r.pointsToNextTier?.toLocaleString("en-US")} points to {r.nextTier}
          </span>
          <Progress value={pct} label={`Progress to ${r.nextTier}`} />
        </Stack>
      ) : null}
    </Stack>
  );
}
