"use client";

import { PieChart } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const SEGMENTS = {
  labels: ["Equities", "Bonds", "Cash", "Real assets", "Alternatives"],
  datasets: [{ data: [42, 26, 12, 11, 9] }],
};

export default function PieChartStory() {
  return (
    <StoryShell title="PieChart">
      <Demo label="Default · legend on · hover a slice for the tooltip">
        <PieChart
          data={SEGMENTS}
          label="Five segments as share of a whole"
          className={styles.chart300}
        />
      </Demo>

      <Demo label="Formatted values · legend off">
        <PieChart
          data={SEGMENTS}
          showLegend={false}
          valueFormatter={(v) => `${v}%`}
          label="Five segments with percentage tooltips and no legend"
          className={styles.chart260}
        />
      </Demo>

      <Demo label="Dark · scoped wrapper re-themes tokens locally">
        <div className={`dark ${styles.darkFrame}`}>
          <div className={styles.panel}>
            <PieChart
              data={SEGMENTS}
              label="Five segments, dark theme"
              className={styles.chart260}
            />
          </div>
        </div>
      </Demo>
    </StoryShell>
  );
}
