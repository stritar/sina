"use client";

import { DonutChart } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const SEGMENTS = {
  labels: ["Equities", "Bonds", "Cash", "Real assets"],
  datasets: [{ data: [46, 28, 14, 12] }],
};

export default function DonutChartStory() {
  return (
    <StoryShell title="DonutChart">
      <Demo label="Center label · hover a slice for the tooltip">
        <DonutChart
          data={SEGMENTS}
          centerLabel="86"
          centerSubLabel="score"
          label="Four segments around a center score of 86"
          className={styles.chart300}
        />
      </Demo>

      <Demo label="Thin ring (cutout 80%) · no center label">
        <DonutChart
          data={SEGMENTS}
          cutout="80%"
          label="Four segments as a thin ring"
          className={styles.chart260}
        />
      </Demo>

      <Demo label="Dark · scoped wrapper re-themes tokens locally">
        <div className={`dark ${styles.darkFrame}`}>
          <div className={styles.panel}>
            <DonutChart
              data={SEGMENTS}
              centerLabel="86"
              centerSubLabel="score"
              label="Four segments around a center score, dark theme"
              className={styles.chart260}
            />
          </div>
        </div>
      </Demo>
    </StoryShell>
  );
}
