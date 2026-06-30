import { Checkbox } from "@sina-design-system/core";
import { Demo, Specimen, StoryShell } from "../_components/StoryShell";

// Static focus ring, mirroring the house focus style (`:focus-visible` only) so
// the "focus" specimen reads as focused without keyboard interaction.
const focusRing = "ring-2 ring-focus-ring ring-offset-1 ring-offset-bg";

export default function CheckboxStory() {
  return (
    <StoryShell title="Checkbox">
      <Demo label="States">
        <Checkbox aria-label="unchecked" />
        <Checkbox aria-label="checked" defaultChecked />
        <Checkbox aria-label="indeterminate" checked="indeterminate" />
      </Demo>

      <Demo label="Focus / disabled">
        <div className="flex items-start gap-6">
          <Specimen caption="focus">
            <Checkbox aria-label="focus" defaultChecked className={focusRing} />
          </Specimen>
          <Specimen caption="disabled">
            <Checkbox aria-label="disabled" defaultChecked disabled />
          </Specimen>
        </div>
      </Demo>

      <Demo label="With label">
        <div className="flex items-start gap-8">
          <Specimen caption="checked + label">
            <Checkbox label="Accept terms" defaultChecked />
          </Specimen>
          <Specimen caption="unchecked + label">
            <Checkbox label="Subscribe" />
          </Specimen>
        </div>
      </Demo>
    </StoryShell>
  );
}
