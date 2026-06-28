import { Separator } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function SeparatorStory() {
  return (
    <StoryShell title="Separator">
      <Demo label="Horizontal · between two blocks">
        <div className="w-72 rounded-lg border border-border bg-surface p-4">
          <p className="font-medium text-text">First section</p>
          <Separator className="my-3" />
          <p className="font-medium text-text">Second section</p>
        </div>
      </Demo>

      <Demo label="Vertical · between inline items (flex-row, h-6)">
        <div className="flex h-6 items-center gap-3 text-sm text-text">
          <span>Edit</span>
          <Separator orientation="vertical" />
          <span>Duplicate</span>
          <Separator orientation="vertical" />
          <span>Delete</span>
        </div>
      </Demo>

      <Demo label="Semantic · decorative={false} exposes role=&quot;separator&quot;">
        <div className="flex w-full flex-col gap-2">
          <p className="text-text">Above the boundary</p>
          <Separator decorative={false} />
          <p className="text-text">Below the boundary</p>
          <p className="text-xs text-text-subtle">
            With decorative=false the divider is a real section boundary for assistive tech.
          </p>
        </div>
      </Demo>
    </StoryShell>
  );
}
