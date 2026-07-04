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
import { cva, type VariantProps } from "class-variance-authority";
import { TrendDown, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils/cn.js";

const kpiValueVariants = cva("font-medium leading-tight tracking-tight text-text", {
  variants: {
    size: {
      sm: "text-2xl",
      md: "text-3xl",
      lg: "text-5xl",
    },
  },
  defaultVariants: { size: "md" },
});

export interface KpiStatProps extends VariantProps<typeof kpiValueVariants> {
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
  size,
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
    <div className={cn("flex flex-col gap-1", className)} style={style}>
      <span className={kpiValueVariants({ size })}>
        {value === null ? displayNullAs : format(value)}
      </span>
      {pill !== null ? (
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-ui font-medium",
              pill.tone === "good" && "bg-success-bg text-success",
              pill.tone === "bad" && "bg-danger-bg text-danger",
              pill.tone === "neutral" && "bg-secondary text-text-muted",
            )}
          >
            {pill.rising !== undefined &&
              (pill.rising ? (
                <TrendUp aria-hidden className="size-3 shrink-0" />
              ) : (
                <TrendDown aria-hidden className="size-3 shrink-0" />
              ))}
            {pill.text}
          </span>
          {comparisonLabel !== undefined ? (
            <span className="text-ui text-text-muted">{comparisonLabel}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

KpiStat.displayName = "KpiStat";
