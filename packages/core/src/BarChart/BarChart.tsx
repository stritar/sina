/**
 * @sina-design-system/core — BarChart
 *
 * A themed Chart.js bar chart: vertical or horizontal, grouped (default for
 * multiple datasets) or stacked. Domain-agnostic; values are formatted only
 * through the `valueFormatter` hook. Themed entirely from SINA tokens read at
 * render time from the chart's own container, re-read on theme flip; series
 * wear the fixed `chart--1..8` palette with rounded data-ends and a saturate-on-
 * hover emphasis. Hover: the built-in Chart.js tooltip as an inverse token chip.
 * Reduced motion disables animation.
 *
 * A11y: wrapper `role="img"` + required `label`; canvas `aria-hidden`. The
 * canvas is mouse-only — `onElementClick` is an enhancement-only affordance.
 *
 * Sizing: `maintainAspectRatio` is off — give the wrapper an explicit height.
 */

"use client";

import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LogarithmicScale,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { cn } from "../utils/cn.js";
import styles from "./BarChart.module.css";
import { buildElementClickHandler } from "../charts/click.js";
import type { ChartElementClickDetail } from "../charts/click.js";
import { colorizeBarData } from "../charts/data.js";
import { deepMerge } from "../charts/merge.js";
import { getCartesianOptions } from "../charts/options.js";
import type { ChartValueFormatter } from "../charts/options.js";
import { useChartTheme } from "../charts/use-chart-theme.js";

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, Tooltip, Legend);

export interface BarChartProps {
  /** Chart.js bar data (labels + datasets). Series colors default to the SINA chart palette. */
  data: ChartData<"bar">;
  /** Accessible name for the figure (required — the canvas is opaque to AT). */
  label: string;
  /** Escape hatch, deep-merged over the token-derived defaults. Non-serializable — client callers only. */
  options?: ChartOptions<"bar">;
  /** Bars run left→right; the category axis becomes y. */
  horizontal?: boolean;
  /** Stack datasets instead of grouping them side by side. */
  stacked?: boolean;
  showLegend?: boolean;
  showTooltips?: boolean;
  /** Formats axis ticks and tooltip values (currency etc. is the caller's vocabulary). */
  valueFormatter?: ChartValueFormatter;
  xAxisLabel?: string;
  yAxisLabel?: string;
  /** Bounds of the VALUE axis (y, or x when `horizontal`). */
  yAxisRangeMin?: number;
  yAxisRangeMax?: number;
  /** Reverse the CATEGORY axis (x, or y when `horizontal`). */
  reverseXAxis?: boolean;
  showLogarithmicScale?: boolean;
  /** Mouse-only enhancement — never the sole path to the data. */
  onElementClick?: (detail: ChartElementClickDetail) => void;
  /** Size the wrapper via utilities or `style` — it needs an explicit height (aspect ratio is not maintained). */
  className?: string;
  style?: CSSProperties;
}

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {
    data,
    label,
    options,
    horizontal = false,
    stacked = false,
    showLegend = false,
    showTooltips = true,
    valueFormatter,
    xAxisLabel,
    yAxisLabel,
    yAxisRangeMin,
    yAxisRangeMax,
    reverseXAxis = false,
    showLogarithmicScale = false,
    onElementClick,
    className,
    style,
  },
  ref,
) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const themeVersion = useChartTheme();
  const chartRef = useRef<ChartJS | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setEl(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const themedData = useMemo(() => colorizeBarData(el, data), [el, themeVersion, data]);
  const themedOptions = useMemo(
    () =>
      deepMerge(
        getCartesianOptions(el, {
          showLegend,
          showTooltips,
          horizontal,
          stacked,
          xAxisLabel,
          yAxisLabel,
          valueRangeMin: yAxisRangeMin,
          valueRangeMax: yAxisRangeMax,
          reverseCategoryAxis: reverseXAxis,
          logarithmic: showLogarithmicScale,
          valueFormatter,
        }),
        options,
      ) as ChartOptions<"bar">,
    [
      el,
      themeVersion,
      showLegend,
      showTooltips,
      horizontal,
      stacked,
      xAxisLabel,
      yAxisLabel,
      yAxisRangeMin,
      yAxisRangeMax,
      reverseXAxis,
      showLogarithmicScale,
      valueFormatter,
      options,
    ],
  );

  return (
    <div
      ref={setRefs}
      role="img"
      aria-label={label}
      className={cn(styles.root, className)}
      style={style}
    >
      {el ? (
        <Bar
          ref={(instance) => {
            chartRef.current = (instance ?? null) as ChartJS | null;
          }}
          aria-hidden="true"
          data={themedData}
          options={themedOptions}
          onClick={buildElementClickHandler(() => chartRef.current, onElementClick)}
        />
      ) : null}
    </div>
  );
});

BarChart.displayName = "BarChart";
