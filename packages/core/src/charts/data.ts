/**
 * @sina-design-system/core — charts/data (internal)
 *
 * Series/slice colorizers: assign palette slots in fixed order and bake in the
 * hover-emphasis defaults (line points grow on hover; bars saturate; slices
 * offset). Dataset-provided colors always win — these only fill gaps.
 */

import type { ChartData } from "chart.js";
import { getChartColors, seriesColor, withAlpha } from "./palette.js";
import { getStyle, getStyleNumber } from "./style.js";

/** Lines: series i wears slot i; points enlarge on hover; optional area fill. */
export function colorizeLineData(
  el: Element | null,
  data: ChartData<"line">,
  fill: boolean,
): ChartData<"line"> {
  const colors = getChartColors(el);
  return {
    ...data,
    datasets: data.datasets.map((dataset, i) => {
      const color = seriesColor(colors, i);
      return {
        tension: 0.3,
        borderWidth: getStyleNumber(el, "--sina-border-width--2", "2px"),
        pointRadius: 3,
        pointHoverRadius: 5,
        fill,
        ...dataset,
        borderColor: dataset.borderColor ?? color,
        backgroundColor: dataset.backgroundColor ?? (fill ? withAlpha(color, 0.15) : color),
        pointBackgroundColor: dataset.pointBackgroundColor ?? color,
      };
    }),
  };
}

/** Bars: rounded data-ends; hover saturates from 88% to full. */
export function colorizeBarData(el: Element | null, data: ChartData<"bar">): ChartData<"bar"> {
  const colors = getChartColors(el);
  const radius = getStyleNumber(el, "--sina-radius--sm", "4px");
  return {
    ...data,
    datasets: data.datasets.map((dataset, i) => {
      const color = seriesColor(colors, i);
      return {
        borderRadius: radius,
        maxBarThickness: 48,
        ...dataset,
        backgroundColor: dataset.backgroundColor ?? withAlpha(color, 0.88),
        hoverBackgroundColor: dataset.hoverBackgroundColor ?? color,
      };
    }),
  };
}

/** Pie/donut: one palette slot per slice, surface-colored gaps, hover offset. */
export function colorizePieData(el: Element | null, data: ChartData<"pie">): ChartData<"pie"> {
  const colors = getChartColors(el);
  const surface = getStyle(el, "--sina-color-surface", "#ffffff");
  return {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      borderColor: surface,
      borderWidth: 2,
      hoverOffset: 6,
      ...dataset,
      backgroundColor:
        dataset.backgroundColor ??
        (dataset.data as unknown[]).map((_, i) => seriesColor(colors, i)),
    })),
  };
}
