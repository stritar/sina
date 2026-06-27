import { Separator } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function SeparatorStory() {
  return (
    <StoryShell title="Separator">
      <Demo label="horizontal">
        <div className="w-72 rounded-lg border border-border bg-surface p-4">
          <p className="font-medium text-text">Account details</p>
          <Separator className="my-3" />
          <p className="font-medium text-text">Transfer limits</p>
        </div>
      </Demo>
      <Demo label="vertical">
        <div className="flex h-5 items-center gap-3 text-sm text-text">
          <span>Edit</span>
          <Separator orientation="vertical" />
          <span>Duplicate</span>
          <Separator orientation="vertical" />
          <span>Delete</span>
        </div>
      </Demo>
    </StoryShell>
  );
}
