"use client";

import { LineChart } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

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

export default function LineChartStory() {
  return (
    <StoryShell title="LineChart">
      <Demo label="Two series · hover a point for the tooltip">
        <LineChart
          data={TWO_SERIES}
          showLegend
          label="Inflow and outflow over six months, both trending up"
          className={styles.chart280}
        />
      </Demo>

      <Demo label="Area (fill) · axis labels · formatted values">
        <LineChart
          data={TWO_SERIES}
          fill
          showLegend
          xAxisLabel="Month"
          yAxisLabel="Amount"
          valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
          label="Inflow and outflow as filled areas with formatted dollar values"
          className={styles.chart280}
        />
      </Demo>

      <Demo label="Palette · 9 series wrap the fixed 8-slot order">
        <LineChart
          data={NINE_SERIES}
          showLegend
          label="Nine series demonstrating the categorical palette order"
          className={styles.chart320}
        />
      </Demo>

      <Demo label="Logarithmic scale">
        <LineChart
          data={WIDE_RANGE}
          showLogarithmicScale
          label="Volume spanning four orders of magnitude on a log scale"
          className={styles.chart240}
        />
      </Demo>

      <Demo label="Dark · scoped wrapper re-themes tokens locally">
        <div className={`dark ${styles.darkFrame}`}>
          <div className={styles.panel}>
            <LineChart
              data={TWO_SERIES}
              showLegend
              label="Inflow and outflow, dark theme"
              className={styles.chart240}
            />
          </div>
        </div>
      </Demo>

      <Demo label="Empty data → labelled blank plot">
        <LineChart
          data={{ labels: [], datasets: [] }}
          label="No data available"
          className={styles.chart160}
        />
      </Demo>
    </StoryShell>
  );
}
