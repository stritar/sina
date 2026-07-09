"use client";

import { PieChart } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live PieChart demos for /docs/primitives/pie-chart. Ported from the
 * playground story (apps/playground/app/primitives/pie-chart/page.tsx) — keep
 * the two in step when the primitive's prop surface changes.
 */

const SEGMENTS = {
  labels: ["Equities", "Bonds", "Cash", "Real assets", "Alternatives"],
  datasets: [{ data: [42, 26, 12, 11, 9] }],
};

export function PieChartHero() {
  return (
    <Hero>
      <PieChart
        data={SEGMENTS}
        label="Five segments as share of a whole"
        style={{ width: "100%", height: 300 }}
      />
    </Hero>
  );
}

export function PieChartExamples() {
  return (
    <>
      <Example
        label="Default · legend on"
        code={`<PieChart
  data={SEGMENTS}
  label="Five segments as share of a whole"
/>`}
      >
        <PieChart
          data={SEGMENTS}
          label="Five segments as share of a whole"
          style={{ width: "100%", height: 300 }}
        />
      </Example>

      <Example
        label="Formatted values · legend off"
        code={`<PieChart
  data={SEGMENTS}
  showLegend={false}
  valueFormatter={(v) => \`\${v}%\`}
  label="Five segments with percentage tooltips and no legend"
/>`}
      >
        <PieChart
          data={SEGMENTS}
          showLegend={false}
          valueFormatter={(v) => `${v}%`}
          label="Five segments with percentage tooltips and no legend"
          style={{ width: "100%", height: 260 }}
        />
      </Example>

      <StorySource slug="pie-chart" />
    </>
  );
}
