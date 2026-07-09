"use client";

import { DonutChart } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live DonutChart demos for /docs/primitives/donut-chart. Ported from the
 * playground story (apps/playground/app/primitives/donut-chart/page.tsx) —
 * keep the two in step when the primitive's prop surface changes.
 */

const SEGMENTS = {
  labels: ["Equities", "Bonds", "Cash", "Real assets"],
  datasets: [{ data: [46, 28, 14, 12] }],
};

export function DonutChartHero() {
  return (
    <Hero>
      <DonutChart
        data={SEGMENTS}
        centerLabel="86"
        centerSubLabel="score"
        label="Four segments around a center score of 86"
        style={{ width: "100%", height: 300 }}
      />
    </Hero>
  );
}

export function DonutChartExamples() {
  return (
    <>
      <Example
        label="Center label"
        code={`<DonutChart
  data={SEGMENTS}
  centerLabel="86"
  centerSubLabel="score"
  label="Four segments around a center score of 86"
/>`}
      >
        <DonutChart
          data={SEGMENTS}
          centerLabel="86"
          centerSubLabel="score"
          label="Four segments around a center score of 86"
          style={{ width: "100%", height: 300 }}
        />
      </Example>

      <Example
        label="Thin ring (cutout 80%) · no center label"
        code={`<DonutChart
  data={SEGMENTS}
  cutout="80%"
  label="Four segments as a thin ring"
/>`}
      >
        <DonutChart
          data={SEGMENTS}
          cutout="80%"
          label="Four segments as a thin ring"
          style={{ width: "100%", height: 260 }}
        />
      </Example>

      <StorySource slug="donut-chart" />
    </>
  );
}
