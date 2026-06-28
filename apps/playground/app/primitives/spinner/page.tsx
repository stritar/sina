import { Spinner } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

const SIZES = ["sm", "md", "lg"] as const;

export default function SpinnerStory() {
  return (
    <StoryShell title="Spinner">
      <Demo label="Sizes · sm / md / lg">
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center gap-4">
            {SIZES.map((size) => (
              <Spinner key={size} size={size} label={`Loading (${size})`} />
            ))}
          </div>
          <p className="text-xs text-text-subtle">
            `label` is screen-reader-only — announced via role=&quot;status&quot;, never shown.
          </p>
        </div>
      </Demo>
    </StoryShell>
  );
}
