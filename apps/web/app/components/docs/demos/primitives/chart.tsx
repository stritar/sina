"use client";

import { Chart } from "@sina-design-system/core";
import { Example, Hero, Specimen, StorySource } from "../shell";

/**
 * Live Chart (sparkline) demos for /docs/primitives/chart. Ported from the
 * playground story (apps/playground/app/primitives/chart/page.tsx) — keep the
 * two in step when the primitive's prop surface changes.
 */

const UP = [10, 12, 9, 15, 14, 18, 22, 21, 26];
const DOWN = [26, 24, 25, 20, 18, 19, 14, 12, 9];
const FLAT = [15, 15, 15, 15, 15];

const SPARK = { width: "8rem", height: "2.5rem" } as const;
const WIDE = { width: "12rem", height: "3rem" } as const;

export function ChartHero() {
  return (
    <Hero>
      <Chart
        data={UP}
        label="Up 160% over 9 points"
        style={{ ...SPARK, color: "var(--sina-color-success)" }}
      />
      <Chart
        data={DOWN}
        label="Down 65% over 9 points"
        style={{ ...SPARK, color: "var(--sina-color-danger)" }}
      />
      <Chart
        data={UP}
        variant="area"
        label="Balance trend, up"
        style={{ ...WIDE, color: "var(--sina-color-primary)" }}
      />
    </Hero>
  );
}

export function ChartExamples() {
  return (
    <>
      <Example
        label="Variants · line, area, bar"
        code={`<Chart data={UP} label="Trend, up" />
<Chart data={UP} variant="area" label="Balance trend, up" />
<Chart data={UP} variant="bar" label="Weekly volume" />`}
      >
        <Specimen caption="line">
          <Chart data={UP} label="Trend, up" style={SPARK} />
        </Specimen>
        <Specimen caption="area">
          <Chart data={UP} variant="area" label="Balance trend, up" style={SPARK} />
        </Specimen>
        <Specimen caption="bar">
          <Chart data={UP} variant="bar" label="Weekly volume" style={SPARK} />
        </Specimen>
      </Example>

      <Example
        label="Signed by color token — currentColor drives the stroke"
        code={`<div style={{ color: "var(--sina-color-success)" }}>
  <Chart data={UP} label="Up 160% over 9 points" />
</div>
<div style={{ color: "var(--sina-color-danger)" }}>
  <Chart data={DOWN} label="Down 65% over 9 points" />
</div>`}
      >
        <Specimen caption="success">
          <Chart
            data={UP}
            label="Up 160% over 9 points"
            style={{ ...SPARK, color: "var(--sina-color-success)" }}
          />
        </Specimen>
        <Specimen caption="danger">
          <Chart
            data={DOWN}
            label="Down 65% over 9 points"
            style={{ ...SPARK, color: "var(--sina-color-danger)" }}
          />
        </Specimen>
        <Specimen caption="subtle">
          <Chart
            data={FLAT}
            label="Flat"
            style={{ ...SPARK, color: "var(--sina-color-text-subtle)" }}
          />
        </Specimen>
      </Example>

      <Example
        label="Empty series → flat baseline"
        code={`<Chart data={[]} label="No data available" />`}
      >
        <Chart
          data={[]}
          label="No data available"
          style={{ ...SPARK, color: "var(--sina-color-text-subtle)" }}
        />
      </Example>

      <StorySource slug="chart" />
    </>
  );
}
