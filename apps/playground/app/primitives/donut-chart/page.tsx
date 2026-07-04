"use client";

import { DonutChart } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

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
          className="h-[300px]"
        />
      </Demo>

      <Demo label="Thin ring (cutout 80%) · no center label">
        <DonutChart
          data={SEGMENTS}
          cutout="80%"
          label="Four segments as a thin ring"
          className="h-[260px]"
        />
      </Demo>

      <Demo label="Dark · scoped wrapper re-themes tokens locally">
        <div className="dark w-full rounded-lg bg-bg p-4">
          <div className="rounded-lg bg-surface p-4">
            <DonutChart
              data={SEGMENTS}
              centerLabel="86"
              centerSubLabel="score"
              label="Four segments around a center score, dark theme"
              className="h-[260px]"
            />
          </div>
        </div>
      </Demo>
    </StoryShell>
  );
}
