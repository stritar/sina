import { Chart } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

const UP = [10, 12, 9, 15, 14, 18, 22, 21, 26];
const DOWN = [26, 24, 25, 20, 18, 19, 14, 12, 9];
const FLAT = [15, 15, 15, 15, 15];

export default function ChartStory() {
  return (
    <StoryShell title="Chart">
      <Demo label="Line · signed by color token">
        <div className="flex items-center gap-6">
          <div className="h-10 w-32 text-success">
            <Chart data={UP} label="Up 160% over 9 points" />
          </div>
          <div className="h-10 w-32 text-danger">
            <Chart data={DOWN} label="Down 65% over 9 points" />
          </div>
          <div className="h-10 w-32 text-text-subtle">
            <Chart data={FLAT} label="Flat" />
          </div>
        </div>
      </Demo>
      <Demo label="Area">
        <div className="h-12 w-48 text-primary">
          <Chart data={UP} variant="area" label="Balance trend, up" />
        </div>
      </Demo>
      <Demo label="Bar">
        <div className="h-12 w-48 text-info">
          <Chart data={UP} variant="bar" label="Weekly volume" />
        </div>
      </Demo>
      <Demo label="Empty series → flat baseline">
        <div className="h-10 w-32 text-text-subtle">
          <Chart data={[]} label="No data available" />
        </div>
      </Demo>
    </StoryShell>
  );
}
