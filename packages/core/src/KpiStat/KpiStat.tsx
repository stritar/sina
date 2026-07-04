/**
 * @sina-design-system/core — KpiStat
 *
 * A headline statistic: a large value with an optional trend pill and
 * comparison label. Domain-agnostic — it knows nothing about currencies or
 * balances; the caller formats values through `valueFormatter`. Styled only
 * via theme tokens: the pill wears `success`/`danger` status colors (direction
 * of "good" flips with `invertChangeColors`), the value wears `text`. Purely
 * presentational (no hooks) → server-mountable, no `"use client"`.
 *
 * A11y: everything is real text — no image, no canvas. The trend icon is
 * decorative (`aria-hidden`); the signed delta text carries the meaning.
 */

import type { CSSProperties } from "react";
import { TrendDown, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils/cn.js";
import styles from "./KpiStat.module.css";

type KpiStatSize = "sm" | "md" | "lg";

// Value type scales with `size`. (CSS Module class access is `string | undefined`
// under noUncheckedIndexedAccess.)
const valueSize: Record<KpiStatSize, string | undefined> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export interface KpiStatProps {
  /** Type scale of the headline value. */
  size?: KpiStatSize;
  /** The headline number. `null` renders `displayNullAs`. */
  value: number | null;
  /** Formats the value and the absolute delta (currency etc. is the caller's vocabulary). */
  valueFormatter?: (value: number) => string;
  /** Previous-period value; enables the trend pill. */
  comparisonValue?: number;
  /** Context under the pill, e.g. "vs previous period". */
  comparisonLabel?: string;
  /** Show the delta as a percentage of the comparison value. */
  showChangeAsPercentage?: boolean;
  percentageDecimalPlaces?: number;
  /** Flip which direction is "good" (e.g. costs: down is good). */
  invertChangeColors?: boolean;
  /** Pill text when the value hasn't moved. */
  equalComparisonLabel?: string;
  /** Pill text when a percentage delta has no baseline (comparison is 0). */
  noPreviousDataLabel?: string;
  /** Rendered when `value` is null. */
  displayNullAs?: string;
  className?: string;
  style?: CSSProperties;
}

export function KpiStat({
  value,
  valueFormatter,
  comparisonValue,
  comparisonLabel,
  showChangeAsPercentage = false,
  percentageDecimalPlaces = 1,
  invertChangeColors = false,
  equalComparisonLabel = "No change",
  noPreviousDataLabel = "No prior data",
  displayNullAs = "—",
  size = "md",
  className,
  style,
}: KpiStatProps) {
  const format = valueFormatter ?? ((v: number) => String(v));
  const hasComparison = value !== null && comparisonValue !== undefined;
  const difference = hasComparison ? value - comparisonValue : 0;

  let pill: { text: string; tone: "good" | "bad" | "neutral"; rising?: boolean } | null = null;
  if (hasComparison) {
    if (difference === 0) {
      pill = { text: equalComparisonLabel, tone: "neutral" };
    } else if (showChangeAsPercentage && comparisonValue === 0) {
      pill = { text: noPreviousDataLabel, tone: "neutral" };
    } else {
      const rising = difference > 0;
      const good = rising !== invertChangeColors;
      const text = showChangeAsPercentage
        ? `${rising ? "+" : "−"}${Math.abs((difference / comparisonValue) * 100).toFixed(percentageDecimalPlaces)}%`
        : `${rising ? "+" : ""}${format(difference)}`;
      pill = { text, tone: good ? "good" : "bad", rising };
    }
  }

  return (
    <div className={cn(styles.root, className)} style={style}>
      <span className={cn(styles.value, valueSize[size])}>
        {value === null ? displayNullAs : format(value)}
      </span>
      {pill !== null ? (
        <span className={styles.pillRow}>
          <span
            className={cn(
              styles.pill,
              pill.tone === "good" && styles.pillGood,
              pill.tone === "bad" && styles.pillBad,
              pill.tone === "neutral" && styles.pillNeutral,
            )}
          >
            {pill.rising !== undefined &&
              (pill.rising ? (
                <TrendUp aria-hidden className={styles.trendIcon} />
              ) : (
                <TrendDown aria-hidden className={styles.trendIcon} />
              ))}
            {pill.text}
          </span>
          {comparisonLabel !== undefined ? (
            <span className={styles.comparisonLabel}>{comparisonLabel}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

KpiStat.displayName = "KpiStat";
