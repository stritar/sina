"use client";

import { LineChart } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live LineChart demos for /docs/primitives/line-chart. Ported from the
 * playground story (apps/playground/app/primitives/line-chart/page.tsx) — keep
 * the two in step when the primitive's prop surface changes.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const TWO_SERIES = {
  labels: MONTHS,
  datasets: [
    { label: "Inflow", data: [420, 480, 460, 540, 580, 640] },
    { label: "Outflow", data: [380, 350, 410, 390, 460, 430] },
  ],
};

/** 9 series exercise the fixed 8-slot palette (series 9 wraps to slot 1). */
const NINE_SERIES = {
  labels: MONTHS,
  datasets: Array.from({ length: 9 }, (_, i) => ({
    label: `Series ${i + 1}`,
    data: MONTHS.map((_, m) => 20 + i * 14 + Math.abs(((m * 7 + i * 3) % 11) - 5) * 6),
  })),
};

const WIDE_RANGE = {
  labels: MONTHS,
  datasets: [{ label: "Volume", data: [12, 140, 900, 4200, 18000, 96000] }],
};

const CHART_SIZE = { width: "100%", height: 280 } as const;

export function LineChartHero() {
  return (
    <Hero>
      <LineChart
        data={TWO_SERIES}
        showLegend
        label="Inflow and outflow over six months, both trending up"
        style={CHART_SIZE}
      />
    </Hero>
  );
}

export function LineChartExamples() {
  return (
    <>
      <Example
        label="Area (fill) · axis labels · formatted values"
        code={`<LineChart
  data={TWO_SERIES}
  fill
  showLegend
  xAxisLabel="Month"
  yAxisLabel="Amount"
  valueFormatter={(v) => \`$\${v.toLocaleString("en-US")}\`}
  label="Inflow and outflow as filled areas with formatted dollar values"
/>`}
      >
        <LineChart
          data={TWO_SERIES}
          fill
          showLegend
          xAxisLabel="Month"
          yAxisLabel="Amount"
          valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
          label="Inflow and outflow as filled areas with formatted dollar values"
          style={CHART_SIZE}
        />
      </Example>

      <Example
        label="Palette · 9 series wrap the fixed 8-slot order"
        code={`<LineChart
  data={NINE_SERIES}
  showLegend
  label="Nine series demonstrating the categorical palette order"
/>`}
      >
        <LineChart
          data={NINE_SERIES}
          showLegend
          label="Nine series demonstrating the categorical palette order"
          style={{ width: "100%", height: 320 }}
        />
      </Example>

      <Example
        label="Logarithmic scale"
        code={`<LineChart
  data={WIDE_RANGE}
  showLogarithmicScale
  label="Volume spanning four orders of magnitude on a log scale"
/>`}
      >
        <LineChart
          data={WIDE_RANGE}
          showLogarithmicScale
          label="Volume spanning four orders of magnitude on a log scale"
          style={{ width: "100%", height: 240 }}
        />
      </Example>

      <StorySource slug="line-chart" />
    </>
  );
}
