/**
 * @sina-design-system/core — PieChart / DonutChart
 *
 * Themed Chart.js part-to-whole charts. Slices wear the fixed `chart--1..8`
 * palette (one slot per slice) separated by a 2px surface-colored gap, and
 * offset outward on hover. Themed entirely from SINA tokens read at render
 * time from the chart's own container, re-read on theme flip. Hover: the
 * built-in Chart.js tooltip as an inverse token chip. Reduced motion disables
 * animation. DonutChart composes PieChart with a `cutout` ring and an optional
 * center label rendered as a real DOM overlay (token-styled text, no plugin).
 *
 * A11y: wrapper `role="img"` + required `label`; canvas `aria-hidden`. The
 * canvas is mouse-only — `onElementClick` is an enhancement-only affordance.
 *
 * Sizing: `maintainAspectRatio` is off — give the wrapper an explicit height.
 */

"use client";

import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Pie } from "react-chartjs-2";
import { cn } from "../utils/cn.js";
import { buildElementClickHandler } from "../charts/click.js";
import type { ChartElementClickDetail } from "../charts/click.js";
import { colorizePieData } from "../charts/data.js";
import { deepMerge } from "../charts/merge.js";
import { getBaseOptions, pieTooltipLabel } from "../charts/options.js";
import type { ChartValueFormatter } from "../charts/options.js";
import { useChartTheme } from "../charts/use-chart-theme.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface PieChartProps {
  /** Chart.js pie data (labels + one dataset). Slices default to the SINA chart palette. */
  data: ChartData<"pie">;
  /** Accessible name for the figure (required — the canvas is opaque to AT). */
  label: string;
  /** Escape hatch, deep-merged over the token-derived defaults. Non-serializable — client callers only. */
  options?: ChartOptions<"pie">;
  /** Pies default the legend ON — it is the slice key. */
  showLegend?: boolean;
  showTooltips?: boolean;
  /** Formats tooltip values (currency etc. is the caller's vocabulary). */
  valueFormatter?: ChartValueFormatter;
  /** Mouse-only enhancement — never the sole path to the data. */
  onElementClick?: (detail: ChartElementClickDetail) => void;
  /** Size the wrapper via utilities or `style` — it needs an explicit height (aspect ratio is not maintained). */
  className?: string;
  style?: CSSProperties;
}

export interface DonutChartProps extends PieChartProps {
  /** Ring thickness — the carved-out center, e.g. `"60%"` (default). */
  cutout?: string | number;
  /** Center label, rendered as real token-styled text (not canvas paint). */
  centerLabel?: string;
  centerSubLabel?: string;
}

interface InternalPieProps extends DonutChartProps {
  innerRef: React.ForwardedRef<HTMLDivElement>;
}

function BasePieChart({
  data,
  label,
  options,
  showLegend = true,
  showTooltips = true,
  valueFormatter,
  onElementClick,
  cutout,
  centerLabel,
  centerSubLabel,
  className,
  style,
  innerRef,
}: InternalPieProps) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const themeVersion = useChartTheme();
  const chartRef = useRef<ChartJS | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setEl(node);
      if (typeof innerRef === "function") innerRef(node);
      else if (innerRef) innerRef.current = node;
    },
    [innerRef],
  );

  const themedData = useMemo(() => colorizePieData(el, data), [el, themeVersion, data]);
  const themedOptions = useMemo(
    () =>
      deepMerge(
        getBaseOptions(el, { showLegend, showTooltips }),
        cutout !== undefined ? { cutout } : {},
        valueFormatter
          ? { plugins: { tooltip: { callbacks: { label: pieTooltipLabel(valueFormatter) } } } }
          : {},
        options,
      ) as ChartOptions<"pie">,
    [el, themeVersion, showLegend, showTooltips, cutout, valueFormatter, options],
  );

  return (
    <div
      ref={setRefs}
      role="img"
      aria-label={label}
      className={cn("relative h-full w-full", className)}
      style={style}
    >
      {el ? (
        <Pie
          ref={(instance) => {
            chartRef.current = (instance ?? null) as ChartJS | null;
          }}
          aria-hidden="true"
          data={themedData}
          options={themedOptions}
          onClick={buildElementClickHandler(() => chartRef.current, onElementClick)}
        />
      ) : null}
      {centerLabel !== undefined || centerSubLabel !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          {centerLabel !== undefined ? (
            <span className="text-2xl font-medium leading-tight text-text">{centerLabel}</span>
          ) : null}
          {centerSubLabel !== undefined ? (
            <span className="text-ui text-text-muted">{centerSubLabel}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(function PieChart(props, ref) {
  return <BasePieChart {...props} innerRef={ref} />;
});

PieChart.displayName = "PieChart";

export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(function DonutChart(
  { cutout = "60%", ...props },
  ref,
) {
  return <BasePieChart {...props} cutout={cutout} innerRef={ref} />;
});

DonutChart.displayName = "DonutChart";
