/**
 * @sina-design-system/core — LineChart
 *
 * A themed Chart.js line/area chart. Domain-agnostic: it plots whatever series
 * it is given and formats values only through the `valueFormatter` hook. Themed
 * entirely from SINA tokens, read at render time from the chart's own container
 * (so a scoped `.dark` or `themeVars()` wrapper re-themes just this chart) and
 * re-read when the document theme flips. Series colors follow the fixed
 * `chart--1..8` palette. Hover: the built-in Chart.js tooltip styled as an
 * inverse token chip; points grow on hover. Reduced motion disables animation.
 *
 * A11y: the wrapper carries `role="img"` + a required `label`; the canvas is
 * `aria-hidden`. The canvas is mouse-only — `onElementClick` is an
 * enhancement-only affordance, never the sole path to information.
 *
 * Sizing: `maintainAspectRatio` is off — give the wrapper an explicit height
 * (a `h-*` utility or `style={{ height }}`), or it collapses to zero.
 */

"use client";

import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { cn } from "../utils/cn.js";
import styles from "./LineChart.module.css";
import { buildElementClickHandler } from "../charts/click.js";
import type { ChartElementClickDetail } from "../charts/click.js";
import { colorizeLineData } from "../charts/data.js";
import { deepMerge } from "../charts/merge.js";
import { getCartesianOptions } from "../charts/options.js";
import type { ChartValueFormatter } from "../charts/options.js";
import { useChartTheme } from "../charts/use-chart-theme.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export interface LineChartProps {
  /** Chart.js line data (labels + datasets). Series colors default to the SINA chart palette. */
  data: ChartData<"line">;
  /** Accessible name for the figure (required — the canvas is opaque to AT). */
  label: string;
  /** Escape hatch, deep-merged over the token-derived defaults. Non-serializable — client callers only. */
  options?: ChartOptions<"line">;
  showLegend?: boolean;
  showTooltips?: boolean;
  /** Area mode: fill under each line with a translucent series color. */
  fill?: boolean;
  /** Formats axis ticks and tooltip values (currency etc. is the caller's vocabulary). */
  valueFormatter?: ChartValueFormatter;
  xAxisLabel?: string;
  yAxisLabel?: string;
  yAxisRangeMin?: number;
  yAxisRangeMax?: number;
  reverseXAxis?: boolean;
  showLogarithmicScale?: boolean;
  /** Mouse-only enhancement — never the sole path to the data. */
  onElementClick?: (detail: ChartElementClickDetail) => void;
  /** Size the wrapper via utilities or `style` — it needs an explicit height (aspect ratio is not maintained). */
  className?: string;
  style?: CSSProperties;
}

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(function LineChart(
  {
    data,
    label,
    options,
    showLegend = false,
    showTooltips = true,
    fill = false,
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
  // Token reads need a mounted container: options build only after this ref
  // lands (and never during SSR — the canvas renders client-side only).
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

  const themedData = useMemo(
    () => colorizeLineData(el, data, fill),
    [el, themeVersion, data, fill],
  );
  const themedOptions = useMemo(
    () =>
      deepMerge(
        getCartesianOptions(el, {
          showLegend,
          showTooltips,
          xAxisLabel,
          yAxisLabel,
          valueRangeMin: yAxisRangeMin,
          valueRangeMax: yAxisRangeMax,
          reverseCategoryAxis: reverseXAxis,
          logarithmic: showLogarithmicScale,
          valueFormatter,
        }),
        options,
      ) as ChartOptions<"line">,
    [
      el,
      themeVersion,
      showLegend,
      showTooltips,
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
        <Line
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

LineChart.displayName = "LineChart";
