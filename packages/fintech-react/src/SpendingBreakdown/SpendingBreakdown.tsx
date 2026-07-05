/**
 * SpendingBreakdown — a SINA presentational fintech component (ungoverned).
 * Renders the validated `spending_breakdown` payload as a `PieChart` of category
 * shares, with the per-category label + amount listed as text beneath it (that
 * list is the legend and the accessible path to the data — the pie canvas is
 * `aria-hidden`, its tooltip mouse-only). Read-only; brand-open tokens; meaning
 * carried by text + amount, not slice color alone.
 *
 * Client component: the interactive chart needs the browser and the
 * `valueFormatter` function cannot cross the RSC boundary. The gate stays
 * server-side — this only renders the decision it already made.
 */

"use client";

import type { IntentEnvelope } from "@sina-design-system/governance";
import { PieChart, Stack } from "@sina-design-system/core";

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
        <Stack gap={3}>
          <div className={styles.chart}>
            <PieChart
              data={{
                labels: categories.map((c) => c.label),
                datasets: [{ data: categories.map((c) => c.amount) }],
              }}
              label={`Spending for ${period} by category`}
              valueFormatter={(v) => formatAmount(v, currency)}
              showLegend={false}
            />
          </div>
          <Stack gap={1}>
            {categories.map((c, i) => (
              <Stack key={i} direction="row" justify="between" align="center" gap={2}>
                <span className={styles.categoryLabel}>{c.label}</span>
                <span className={styles.categoryAmount}>{formatAmount(c.amount, currency)}</span>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
