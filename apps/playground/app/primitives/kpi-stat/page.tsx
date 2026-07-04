import { KpiStat } from "@sina-design-system/core";
import { Demo, Specimen, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

export default function KpiStatStory() {
  return (
    <StoryShell title="KpiStat">
      <Demo label="Trend directions">
        <Specimen caption="rising · good">
          <KpiStat value={12500} comparisonValue={11800} comparisonLabel="vs last month" />
        </Specimen>
        <Specimen caption="falling · bad">
          <KpiStat value={9400} comparisonValue={11800} comparisonLabel="vs last month" />
        </Specimen>
        <Specimen caption="no change">
          <KpiStat value={11800} comparisonValue={11800} comparisonLabel="vs last month" />
        </Specimen>
      </Demo>

      <Demo label="Percentage delta · inverted colors (down is good)">
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
      </Demo>

      <Demo label="Formatted value">
        <KpiStat
          value={1284500}
          comparisonValue={1190000}
          valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
          comparisonLabel="vs previous quarter"
        />
      </Demo>

      <Demo label="Sizes">
        <Specimen caption="sm">
          <KpiStat value={42} comparisonValue={38} size="sm" />
        </Specimen>
        <Specimen caption="md (default)">
          <KpiStat value={42} comparisonValue={38} size="md" />
        </Specimen>
        <Specimen caption="lg">
          <KpiStat value={42} comparisonValue={38} size="lg" />
        </Specimen>
      </Demo>

      <Demo label="Null value">
        <KpiStat value={null} comparisonValue={38} comparisonLabel="vs last week" />
      </Demo>

      <Demo label="Dark · scoped wrapper re-themes tokens locally">
        <div className={`dark ${styles.darkFrame}`}>
          <div className={styles.panel}>
            <KpiStat value={12500} comparisonValue={11800} comparisonLabel="vs last month" />
            <KpiStat value={9400} comparisonValue={11800} comparisonLabel="vs last month" />
          </div>
        </div>
      </Demo>
    </StoryShell>
  );
}
