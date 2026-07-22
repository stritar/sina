/**
 * Pure-unit tests for the chart infrastructure — no canvas needed. In jsdom the
 * `--sina-*` variables resolve empty, so these also prove the fallback plumbing
 * every reader depends on.
 */

import { describe, expect, it, vi, afterEach } from "vitest";
import { deepMerge } from "./merge.js";
import { getStyle, getStyleNumber, toPx } from "./style.js";
import { CHART_COLOR_VARS, getChartColors, seriesColor, withAlpha } from "./palette.js";
import { getBaseOptions, getCartesianOptions, integerTicksOnly } from "./options.js";
import type { Scale } from "chart.js";

describe("toPx", () => {
  it("converts px, rem, and unitless; rejects garbage", () => {
    expect(toPx("13px", 16)).toBe(13);
    expect(toPx("0.75rem", 16)).toBe(12);
    expect(toPx("500", 16)).toBe(500);
    expect(toPx("-0.5rem", 16)).toBe(-8);
    expect(toPx("", 16)).toBeUndefined();
    expect(toPx("60%", 16)).toBeUndefined();
    expect(toPx("auto", 16)).toBeUndefined();
  });
});

describe("token readers (jsdom: vars empty → fallbacks)", () => {
  it("getStyle returns the fallback when the var is unset", () => {
    expect(getStyle(null, "--sina-color-text", "#353b31")).toBe("#353b31");
  });
  it("getStyleNumber resolves the fallback through rem→px", () => {
    expect(getStyleNumber(null, "--sina-text--xs", "0.75rem")).toBe(12);
    expect(getStyleNumber(null, "--sina-radius--lg", "8px")).toBe(8);
  });
  it("reads a set custom property from the scoped element", () => {
    const el = document.createElement("div");
    el.style.setProperty("--sina-color-chart--1", "#123456");
    document.body.appendChild(el);
    expect(getStyle(el, "--sina-color-chart--1", "#000000")).toBe("#123456");
    el.remove();
  });
});

describe("deepMerge", () => {
  it("recurses plain objects; replaces arrays, functions, scalars", () => {
    const fn = () => "override";
    const merged = deepMerge(
      { a: { b: 1, c: 2 }, list: [1, 2], keep: "yes" },
      { a: { c: 3 }, list: [9], fn },
    ) as Record<string, unknown>;
    expect(merged["a"]).toEqual({ b: 1, c: 3 });
    expect(merged["list"]).toEqual([9]);
    expect(merged["fn"]).toBe(fn);
    expect(merged["keep"]).toBe("yes");
  });
  it("skips undefined overrides and never mutates inputs", () => {
    const base = { a: { b: 1 } };
    const merged = deepMerge(base, undefined, { a: { c: 2 } }) as { a: Record<string, number> };
    expect(merged.a).toEqual({ b: 1, c: 2 });
    expect(base.a).toEqual({ b: 1 });
  });
});

describe("palette", () => {
  it("exposes 8 fixed slots and wraps deterministically", () => {
    expect(CHART_COLOR_VARS).toHaveLength(8);
    const colors = getChartColors(null);
    expect(colors).toHaveLength(8);
    expect(seriesColor(colors, 0)).toBe(colors[0]);
    expect(seriesColor(colors, 8)).toBe(colors[0]);
    expect(seriesColor(colors, 9)).toBe(colors[1]);
  });
  it("withAlpha appends a channel to #rrggbb only", () => {
    expect(withAlpha("#6b8a3d", 0.15)).toBe("#6b8a3d26");
    expect(withAlpha("rgb(1, 2, 3)", 0.5)).toBe("rgb(1, 2, 3)");
  });
});

describe("option builders", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("feeds token fallbacks into the tooltip chip and legend", () => {
    const options = getBaseOptions(null, { showLegend: true, showTooltips: true });
    const tooltip = options.plugins?.tooltip as Record<string, unknown>;
    expect(tooltip["backgroundColor"]).toBe("#353b31");
    expect(tooltip["titleColor"]).toBe("#ffffff");
    expect(tooltip["cornerRadius"]).toBe(8);
    expect(tooltip["caretSize"]).toBe(0);
    const legend = options.plugins?.legend as { display: boolean };
    expect(legend.display).toBe(true);
  });

  it("disables Chart.js animation under prefers-reduced-motion", () => {
    const animated = getBaseOptions(null, { showLegend: false, showTooltips: true });
    expect(animated.animation).toBeUndefined();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true }),
    );
    const reduced = getBaseOptions(null, { showLegend: false, showTooltips: true });
    expect(reduced.animation).toBe(false);
  });

  it("emphasizes the zero line and keeps the rest of the grid subtle", () => {
    const options = getCartesianOptions(null, { showLegend: false, showTooltips: true });
    const grid = (options.scales?.["y"] as { grid: { color: (ctx: unknown) => string } }).grid;
    expect(grid.color({ tick: { value: 0 } })).toBe("#dde0d9");
    expect(grid.color({ tick: { value: 5 } })).toBe("#edefeb");
  });

  it("transposes scales and index axis when horizontal", () => {
    const options = getCartesianOptions(null, {
      showLegend: false,
      showTooltips: true,
      horizontal: true,
      valueRangeMax: 100,
    });
    expect(options.indexAxis).toBe("y");
    expect((options.scales?.["x"] as { max?: number }).max).toBe(100);
    expect((options.scales?.["y"] as { max?: number }).max).toBeUndefined();
  });

  it("routes valueFormatter into value-axis ticks and tooltip labels", () => {
    const fmt = (v: number) => `$${v}`;
    const options = getCartesianOptions(null, {
      showLegend: false,
      showTooltips: true,
      valueFormatter: fmt,
    });
    const ticks = (options.scales?.["y"] as {
      ticks: { callback: (v: number) => string };
    }).ticks;
    expect(ticks.callback(5)).toBe("$5");
    const label = (
      options.plugins?.tooltip as {
        callbacks: { label: (item: unknown) => string };
      }
    ).callbacks.label;
    expect(label({ parsed: { x: 0, y: 12 }, dataset: { label: "Series A" } })).toBe(
      "Series A: $12",
    );
  });

  it("drops fractional ticks when every plotted value is an integer", () => {
    const axis = {
      chart: { data: { datasets: [{ data: [1, 2, 3] }] } },
      ticks: [{ value: 0 }, { value: 0.5 }, { value: 1 }],
    } as unknown as Scale;
    integerTicksOnly(axis);
    expect(axis.ticks.map((t) => t.value)).toEqual([0, 1]);

    const decimalAxis = {
      chart: { data: { datasets: [{ data: [1.5, 2] }] } },
      ticks: [{ value: 0 }, { value: 0.5 }],
    } as unknown as Scale;
    integerTicksOnly(decimalAxis);
    expect(decimalAxis.ticks).toHaveLength(2);
  });
});
