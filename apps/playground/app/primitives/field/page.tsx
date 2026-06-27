import { Field } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

const inputClassName =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg aria-[invalid=true]:border-danger";

export default function FieldStory() {
  return (
    <StoryShell title="Field">
      <Demo label="Label + description">
        <div className="w-full max-w-xs">
          <Field label="Recipient" description="Full legal name on the account">
            <input className={inputClassName} placeholder="Jane Doe" />
          </Field>
        </div>
      </Demo>
      <Demo label="Required + error (announced, aria-invalid wired)">
        <div className="w-full max-w-xs">
          <Field label="Reference" required error="This field is required">
            <input className={inputClassName} />
          </Field>
        </div>
      </Demo>
    </StoryShell>
  );
}
