import { VisuallyHidden } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function VisuallyHiddenStory() {
  return (
    <StoryShell title="VisuallyHidden">
      <Demo label="Icon-only button (name from hidden text)">
        <button
          type="button"
          className="inline-flex size-control-lg items-center justify-center rounded-lg border border-border bg-surface text-text"
        >
          <span aria-hidden>×</span>
          <VisuallyHidden>Close</VisuallyHidden>
        </button>
        <p className="text-sm text-text-muted">
          The button is labeled “Close” for screen readers while only the × is visible.
        </p>
      </Demo>
    </StoryShell>
  );
}
