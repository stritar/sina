/**
 * @sina-design-system/core — charts/options (internal)
 *
 * Token-fed Chart.js option builders — everything themable flows through here.
 * Values are read from the SINA theme at render time (see charts/style.ts):
 * gridlines wear `border-subtle` (zero-line emphasis wears `border`), tick and
 * legend labels wear `text-muted`, axis titles wear `text`, and the tooltip is
 * an inverse chip (`text` background / `text-inverse` ink) so it auto-inverts
 * with the mode. Reduced motion is honored by disabling Chart.js's JS-driven
 * animation (the CSS motion tokens can't reach the canvas).
 */

import type { ChartOptions, Scale, TooltipItem } from "chart.js";
import { deepMerge } from "./merge.js";
import { getStyle, getStyleNumber } from "./style.js";

/** Format a raw value for ticks and tooltips — the domain hook (currency etc.). */
export type ChartValueFormatter = (value: number) => string;

export interface BaseChartConfig {
  showLegend: boolean;
  showTooltips: boolean;
}

export interface CartesianChartConfig extends BaseChartConfig {
  horizontal?: boolean;
  stacked?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  /** Bounds/behavior of the VALUE axis (y, or x when `horizontal`). */
  valueRangeMin?: number;
  valueRangeMax?: number;
  logarithmic?: boolean;
  /** Reverse the CATEGORY axis (x, or y when `horizontal`). */
  reverseCategoryAxis?: boolean;
  valueFormatter?: ChartValueFormatter;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/** Base options every SINA chart shares: responsive canvas + token-fed legend/tooltip. */
export function getBaseOptions(el: Element | null, cfg: BaseChartConfig): ChartOptions {
  const family = getStyle(el, "--sina-font--sans", "ui-sans-serif, system-ui, sans-serif");
  const xs = getStyleNumber(el, "--sina-text--xs", "0.75rem");
  const ui = getStyleNumber(el, "--sina-text--ui", "0.8125rem");
  const medium = getStyleNumber(el, "--sina-font-weight--medium", "500");
  const semibold = getStyleNumber(el, "--sina-font-weight--semibold", "600");
  const textMuted = getStyle(el, "--sina-color-text-muted", "#52564e");

  return {
    responsive: true,
    maintainAspectRatio: false,
    ...(prefersReducedMotion() ? { animation: false as const } : {}),
    plugins: {
      legend: {
        display: cfg.showLegend,
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: xs / 2,
          boxHeight: xs / 2,
          color: textMuted,
          padding: getStyleNumber(el, "--sina-space--4", "1rem"),
          font: { family, size: xs, weight: medium },
        },
      },
      tooltip: {
        enabled: cfg.showTooltips,
        usePointStyle: true,
        caretSize: 0,
        backgroundColor: getStyle(el, "--sina-color-text", "#353b31"),
        titleColor: getStyle(el, "--sina-color-text-inverse", "#ffffff"),
        bodyColor: getStyle(el, "--sina-color-text-inverse", "#ffffff"),
        cornerRadius: getStyleNumber(el, "--sina-radius--lg", "8px"),
        padding: getStyleNumber(el, "--sina-space--3", "0.75rem"),
        boxPadding: getStyleNumber(el, "--sina-space--1", "0.25rem"),
        titleFont: { family, size: ui, weight: semibold },
        bodyFont: { family, size: ui, weight: 400 },
      },
    },
  };
}

/**
 * When every plotted value is an integer, drop fractional ticks — a count axis
 * must never read "2.5".
 */
export function integerTicksOnly(axis: Scale): void {
  const values = axis.chart.data.datasets
    .flatMap((dataset) => dataset.data as unknown[])
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (values.length > 0 && values.every((v) => Number.isInteger(v))) {
    axis.ticks = axis.ticks.filter((tick) => Number.isInteger(tick.value));
  }
}

/** Tooltip label for cartesian charts: "Series: <formatted value>". */
export function cartesianTooltipLabel(
  horizontal: boolean,
  format: ChartValueFormatter,
): (item: TooltipItem<"line" | "bar">) => string {
  return (item) => {
    const parsed = item.parsed as { x: number | null; y: number | null };
    const value = horizontal ? parsed.x : parsed.y;
    const name = item.dataset.label;
    const text = typeof value === "number" ? format(value) : String(value);
    return name ? `${name}: ${text}` : text;
  };
}

/** Tooltip label for pie/donut: "Slice: <formatted value>". */
export function pieTooltipLabel(
  format: ChartValueFormatter,
): (item: TooltipItem<"pie">) => string {
  return (item) => {
    const value = item.parsed;
    const text = typeof value === "number" ? format(value) : String(value);
    return item.label ? `${item.label}: ${text}` : text;
  };
}

/** Cartesian options: base + token-fed scales (recessive grid, zero-line emphasis). */
export function getCartesianOptions(el: Element | null, cfg: CartesianChartConfig): ChartOptions {
  const family = getStyle(el, "--sina-font--sans", "ui-sans-serif, system-ui, sans-serif");
  const xs = getStyleNumber(el, "--sina-text--xs", "0.75rem");
  const medium = getStyleNumber(el, "--sina-font-weight--medium", "500");
  const tickColor = getStyle(el, "--sina-color-text-muted", "#52564e");
  const titleColor = getStyle(el, "--sina-color-text", "#353b31");
  const gridColor = getStyle(el, "--sina-color-border-subtle", "#edefeb");
  const zeroLineColor = getStyle(el, "--sina-color-border", "#dde0d9");

  const axisTitle = (text: string | undefined) => ({
    display: Boolean(text),
    text: text ?? "",
    color: titleColor,
    font: { family, size: xs, weight: medium },
  });
  const ticks = { color: tickColor, font: { family, size: xs } };

  const categoryAxis = {
    stacked: cfg.stacked ?? false,
    reverse: cfg.reverseCategoryAxis ?? false,
    title: axisTitle(cfg.horizontal ? cfg.yAxisLabel : cfg.xAxisLabel),
    ticks,
    grid: { display: false },
    border: { color: zeroLineColor },
  };
  const valueAxis = {
    stacked: cfg.stacked ?? false,
    beginAtZero: true,
    ...(cfg.logarithmic ? { type: "logarithmic" as const } : {}),
    ...(cfg.valueRangeMin !== undefined ? { min: cfg.valueRangeMin } : {}),
    ...(cfg.valueRangeMax !== undefined ? { max: cfg.valueRangeMax } : {}),
    title: axisTitle(cfg.horizontal ? cfg.xAxisLabel : cfg.yAxisLabel),
    ticks: {
      ...ticks,
      ...(cfg.valueFormatter
        ? { callback: (value: string | number) => cfg.valueFormatter!(Number(value)) }
        : {}),
    },
    // Recessive hairline grid; the zero line is emphasized so mixed +/- data
    // keeps a readable baseline.
    grid: {
      color: (ctx: { tick?: { value?: number } }) =>
        ctx.tick?.value === 0 ? zeroLineColor : gridColor,
    },
    border: { display: false },
    afterBuildTicks: integerTicksOnly,
  };

  return deepMerge(getBaseOptions(el, cfg), {
    ...(cfg.horizontal ? { indexAxis: "y" as const } : {}),
    scales: cfg.horizontal
      ? { x: valueAxis, y: categoryAxis }
      : { x: categoryAxis, y: valueAxis },
    ...(cfg.valueFormatter
      ? {
          plugins: {
            tooltip: {
              callbacks: {
                label: cartesianTooltipLabel(cfg.horizontal ?? false, cfg.valueFormatter),
              },
            },
          },
        }
      : {}),
  });
}
