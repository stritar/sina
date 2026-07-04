"use client";

import { PieChart } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

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
          className="h-[300px]"
        />
      </Demo>

      <Demo label="Formatted values · legend off">
        <PieChart
          data={SEGMENTS}
          showLegend={false}
          valueFormatter={(v) => `${v}%`}
          label="Five segments with percentage tooltips and no legend"
          className="h-[260px]"
        />
      </Demo>

      <Demo label="Dark · scoped wrapper re-themes tokens locally">
        <div className="dark w-full rounded-lg bg-bg p-4">
          <div className="rounded-lg bg-surface p-4">
            <PieChart
              data={SEGMENTS}
              label="Five segments, dark theme"
              className="h-[260px]"
            />
          </div>
        </div>
      </Demo>
    </StoryShell>
  );
}
