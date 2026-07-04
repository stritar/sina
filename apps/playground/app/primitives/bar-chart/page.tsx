"use client";

import { BarChart } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

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

export default function BarChartStory() {
  return (
    <StoryShell title="BarChart">
      <Demo label="Grouped (default) · hover a bar for the tooltip">
        <BarChart
          data={TWO_SERIES}
          showLegend
          label="Two regions grouped by quarter"
          className="h-[280px]"
        />
      </Demo>

      <Demo label="Stacked">
        <BarChart
          data={TWO_SERIES}
          stacked
          showLegend
          label="Two regions stacked by quarter"
          className="h-[280px]"
        />
      </Demo>

      <Demo label="Horizontal">
        <BarChart
          data={TWO_SERIES}
          horizontal
          showLegend
          label="Two regions grouped, horizontal orientation"
          className="h-[280px]"
        />
      </Demo>

      <Demo label="Horizontal · stacked · formatted values">
        <BarChart
          data={TWO_SERIES}
          horizontal
          stacked
          showLegend
          valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
          label="Two regions stacked horizontally with formatted dollar values"
          className="h-[280px]"
        />
      </Demo>

      <Demo label="Negative values · zero line emphasized">
        <BarChart
          data={MIXED_SIGNS}
          label="Net result by quarter crossing zero"
          className="h-[240px]"
        />
      </Demo>

      <Demo label="Dark · scoped wrapper re-themes tokens locally">
        <div className="dark w-full rounded-lg bg-bg p-4">
          <div className="rounded-lg bg-surface p-4">
            <BarChart
              data={TWO_SERIES}
              showLegend
              label="Two regions grouped by quarter, dark theme"
              className="h-[240px]"
            />
          </div>
        </div>
      </Demo>
    </StoryShell>
  );
}
