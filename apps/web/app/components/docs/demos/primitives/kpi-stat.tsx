"use client";

import { KpiStat } from "@sina-design-system/core";
import { Example, Hero, Specimen, StorySource } from "../shell";

/**
 * Live KpiStat demos for /docs/primitives/kpi-stat. Ported from the playground
 * story (apps/playground/app/primitives/kpi-stat/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

const usd = (v: number) => `$${v.toLocaleString("en-US")}`;

export function KpiStatHero() {
  return (
    <Hero>
      <KpiStat
        value={1284500}
        comparisonValue={1190000}
        valueFormatter={usd}
        comparisonLabel="vs previous quarter"
        size="lg"
      />
    </Hero>
  );
}

export function KpiStatExamples() {
  return (
    <>
      <Example
        label="Trend directions"
        code={`<KpiStat value={12500} comparisonValue={11800} comparisonLabel="vs last month" />
<KpiStat value={9400} comparisonValue={11800} comparisonLabel="vs last month" />
<KpiStat value={11800} comparisonValue={11800} comparisonLabel="vs last month" />`}
      >
        <Specimen caption="rising · good">
          <KpiStat value={12500} comparisonValue={11800} comparisonLabel="vs last month" />
        </Specimen>
        <Specimen caption="falling · bad">
          <KpiStat value={9400} comparisonValue={11800} comparisonLabel="vs last month" />
        </Specimen>
        <Specimen caption="no change">
          <KpiStat value={11800} comparisonValue={11800} comparisonLabel="vs last month" />
        </Specimen>
      </Example>

      <Example
        label="Formatted value"
        code={`<KpiStat
  value={1284500}
  comparisonValue={1190000}
  valueFormatter={(v) => \`$\${v.toLocaleString("en-US")}\`}
  comparisonLabel="vs previous quarter"
/>`}
      >
        <KpiStat
          value={1284500}
          comparisonValue={1190000}
          valueFormatter={usd}
          comparisonLabel="vs previous quarter"
        />
      </Example>

      <Example
        label="Percentage delta · inverted colors"
        code={`<KpiStat
  value={12500}
  comparisonValue={11800}
  showChangeAsPercentage
  comparisonLabel="vs last month"
/>
<KpiStat
  value={340}
  comparisonValue={520}
  invertChangeColors
  comparisonLabel="incidents vs last month"
/>
<KpiStat value={140} comparisonValue={0} showChangeAsPercentage />`}
      >
        <Specimen caption="percentage">
          <KpiStat
            value={12500}
            comparisonValue={11800}
            showChangeAsPercentage
            comparisonLabel="vs last month"
          />
        </Specimen>
        <Specimen caption="inverted · falling reads good">
          <KpiStat
            value={340}
            comparisonValue={520}
            invertChangeColors
            comparisonLabel="incidents vs last month"
          />
        </Specimen>
        <Specimen caption="no baseline">
          <KpiStat value={140} comparisonValue={0} showChangeAsPercentage />
        </Specimen>
      </Example>

      <Example
        label="Sizes & null value"
        code={`<KpiStat value={42} comparisonValue={38} size="sm" />
<KpiStat value={42} comparisonValue={38} size="md" />
<KpiStat value={42} comparisonValue={38} size="lg" />
<KpiStat value={null} comparisonValue={38} comparisonLabel="vs last week" />`}
      >
        {(["sm", "md", "lg"] as const).map((size) => (
          <Specimen key={size} caption={size}>
            <KpiStat value={42} comparisonValue={38} size={size} />
          </Specimen>
        ))}
        <Specimen caption="null value">
          <KpiStat value={null} comparisonValue={38} comparisonLabel="vs last week" />
        </Specimen>
      </Example>

      <StorySource slug="kpi-stat" />
    </>
  );
}
