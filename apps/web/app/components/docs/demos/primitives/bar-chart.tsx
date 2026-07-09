"use client";

import { BarChart } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live BarChart demos for /docs/primitives/bar-chart. Ported from the
 * playground story (apps/playground/app/primitives/bar-chart/page.tsx) — keep
 * the two in step when the primitive's prop surface changes.
 */

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

const TWO_SERIES = {
  labels: QUARTERS,
  datasets: [
    { label: "North", data: [420, 510, 470, 620] },
    { label: "South", data: [380, 440, 520, 460] },
  ],
};

const MIXED_SIGNS = {
  labels: QUARTERS,
  datasets: [{ label: "Net", data: [180, -90, 240, -40] }],
};

const CHART_SIZE = { width: "100%", height: 280 } as const;

export function BarChartHero() {
  return (
    <Hero>
      <BarChart
        data={TWO_SERIES}
        showLegend
        label="Two regions grouped by quarter"
        style={CHART_SIZE}
      />
    </Hero>
  );
}

export function BarChartExamples() {
  return (
    <>
      <Example
        label="Stacked"
        code={`<BarChart
  data={TWO_SERIES}
  stacked
  showLegend
  label="Two regions stacked by quarter"
/>`}
      >
        <BarChart
          data={TWO_SERIES}
          stacked
          showLegend
          label="Two regions stacked by quarter"
          style={CHART_SIZE}
        />
      </Example>

      <Example
        label="Horizontal · formatted values"
        code={`<BarChart
  data={TWO_SERIES}
  horizontal
  showLegend
  valueFormatter={(v) => \`$\${v.toLocaleString("en-US")}\`}
  label="Two regions grouped, horizontal orientation"
/>`}
      >
        <BarChart
          data={TWO_SERIES}
          horizontal
          showLegend
          valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
          label="Two regions grouped, horizontal orientation"
          style={CHART_SIZE}
        />
      </Example>

      <Example
        label="Negative values · zero line emphasized"
        code={`<BarChart
  data={MIXED_SIGNS}
  label="Net result by quarter crossing zero"
/>`}
      >
        <BarChart
          data={MIXED_SIGNS}
          label="Net result by quarter crossing zero"
          style={{ width: "100%", height: 240 }}
        />
      </Example>

      <StorySource slug="bar-chart" />
    </>
  );
}
