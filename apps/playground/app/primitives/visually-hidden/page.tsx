import { VisuallyHidden } from "@sina-design-system/core";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function VisuallyHiddenStory() {
  return (
    <StoryShell title="VisuallyHidden">
      <Demo label="Icon-only button (name from hidden text)">
        <button
          type="button"
          className="inline-flex size-control-lg items-center justify-center rounded-lg border border-border bg-surface text-text"
        >
          <X aria-hidden className="size-control-2xs" />
          <VisuallyHidden>Close</VisuallyHidden>
        </button>
        <p className="text-sm text-text-muted">
          The glyph is the only visible content; the accessible name comes from the
          hidden “Close” text, so screen readers announce a labeled button.
        </p>
      </Demo>

      <Demo label="Standalone SR text (announced, not shown)">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-text">
            Step 2 of 4
            <VisuallyHidden> — Account details</VisuallyHidden>
          </p>
          <p className="text-xs text-text-subtle">
            Sighted users see only “Step 2 of 4”. Screen readers also announce the
            hidden “Account details” context, giving extra clarity without changing
            the visual layout.
          </p>
        </div>
      </Demo>
    </StoryShell>
  );
}
