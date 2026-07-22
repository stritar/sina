/**
 * @sina-design-system/core — charts/palette (internal)
 *
 * The categorical series palette. Series i wears slot ((i-1 mod 8)+1) — fixed
 * order, never cycled or re-ranked (the order is the CVD-safety mechanism,
 * validated in the theme). The hex fallbacks mirror theme.css's LIGHT values so
 * a chart still renders sensibly where tokens are unavailable (jsdom); at
 * runtime the CSS variables always win, dark mode included.
 */

import { getStyle } from "./style.js";
import type { SinaVar } from "./style.js";

export const CHART_COLOR_VARS = [
  "--sina-color-chart--1",
  "--sina-color-chart--2",
  "--sina-color-chart--3",
  "--sina-color-chart--4",
  "--sina-color-chart--5",
  "--sina-color-chart--6",
  "--sina-color-chart--7",
  "--sina-color-chart--8",
] as const satisfies readonly SinaVar[];

/* Mirrors theme.css light values — fallbacks only, never authored here. */
const FALLBACKS = [
  "#6b8a3d",
  "#3a7fbd",
  "#3f8a52",
  "#7a6ec2",
  "#d26a53",
  "#9a5fa3",
  "#c1821d",
  "#00949e",
] as const;

/** Resolve the 8 palette slots against the chart's container element. */
export function getChartColors(el: Element | null): string[] {
  return CHART_COLOR_VARS.map((name, i) => getStyle(el, name, FALLBACKS[i]!));
}

/** Slot for series `index` — modulo wrap keeps >8 series deterministic. */
export function seriesColor(colors: string[], index: number): string {
  return colors[index % colors.length]!;
}

/** Append an alpha channel to a `#rrggbb` color; pass anything else through. */
export function withAlpha(color: string, alpha: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${channel}`;
}
