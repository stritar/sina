/**
 * SpendingBreakdown — a SINA presentational fintech component (ungoverned).
 * Renders the validated `spending_breakdown` payload as per-category Progress
 * bars. Read-only; brand-open tokens; meaning carried by text + amount, not the
 * bar's color alone.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Progress, Stack } from "@sina-design-system/core";

import { formatAmount, readSpendingBreakdown } from "../format.js";
import styles from "./SpendingBreakdown.module.css";

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
      className={styles.card}
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className={styles.period}>{period}</span>
        <span className={styles.total}>{formatAmount(total, currency)}</span>
      </Stack>

      {categories.length === 0 ? (
        <p className={styles.empty}>No spending to show.</p>
      ) : (
        <Stack gap={2}>
          {categories.map((c, i) => {
            const pct = total > 0 ? Math.min((c.amount / total) * 100, 100) : 0;
            return (
              <Stack key={i} gap={1}>
                <Stack direction="row" justify="between" align="center" gap={2}>
                  <span className={styles.categoryLabel}>{c.label}</span>
                  <span className={styles.categoryAmount}>{formatAmount(c.amount, currency)}</span>
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
