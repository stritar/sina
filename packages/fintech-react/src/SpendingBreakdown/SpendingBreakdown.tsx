/**
 * SpendingBreakdown — a SINA presentational fintech component (ungoverned).
 * Renders the validated `spending_breakdown` payload as per-category Progress
 * bars. Read-only; brand-open tokens; meaning carried by text + amount, not the
 * bar's color alone.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Progress, Stack } from "@sina-design-system/core";

import { formatAmount, readSpendingBreakdown } from "../format.js";

export interface SpendingBreakdownProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function SpendingBreakdown({ payload }: SpendingBreakdownProps) {
  const { period, currency, total, categories } = readSpendingBreakdown(payload);

  return (
    <Stack
      gap={3}
      aria-label={`Spending for ${period}`}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className="text-ui font-medium text-text">{period}</span>
        <span className="text-ui font-semibold text-text">{formatAmount(total, currency)}</span>
      </Stack>

      {categories.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No spending to show.</p>
      ) : (
        <Stack gap={2}>
          {categories.map((c, i) => {
            const pct = total > 0 ? Math.min((c.amount / total) * 100, 100) : 0;
            return (
              <Stack key={i} gap={1}>
                <Stack direction="row" justify="between" align="center" gap={2}>
                  <span className="text-ui text-text">{c.label}</span>
                  <span className="text-ui font-medium text-text">{formatAmount(c.amount, currency)}</span>
                </Stack>
                <Progress value={pct} label={`${c.label}: ${Math.round(pct)}% of spending`} />
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
