import { Progress } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

const VALUES = [0, 25, 50, 75, 100] as const;

export default function ProgressStory() {
  return (
    <StoryShell title="Progress">
      <Demo label="Determinate · 0 → 100">
        <div className="flex w-full flex-col gap-4">
          {VALUES.map((value) => (
            <div key={value} className="flex items-center gap-3">
              <span className="w-10 font-mono text-xs text-text-subtle">{value}</span>
              <div className="w-64">
                <Progress value={value} label={`Progress ${value} percent`} />
              </div>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Indeterminate · no value">
        <div className="w-64">
          <Progress label="Loading" />
        </div>
      </Demo>
    </StoryShell>
  );
}
