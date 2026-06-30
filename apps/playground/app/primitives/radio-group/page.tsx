import { RadioGroup, RadioGroupItem } from "@sina-design-system/core";
import { Demo, Specimen, StoryShell } from "../_components/StoryShell";

// Static focus ring, mirroring the house focus style (`:focus-visible` only) so
// the "focus" specimen reads as focused without keyboard interaction.
const focusRing = "ring-2 ring-focus-ring ring-offset-1 ring-offset-bg";

export default function RadioGroupStory() {
  return (
    <StoryShell title="RadioGroup">
      <Demo label="States">
        <div className="flex items-center gap-6">
          <RadioGroup aria-label="unchecked">
            <RadioGroupItem value="off" aria-label="unchecked" />
          </RadioGroup>
          <RadioGroup defaultValue="on" aria-label="checked">
            <RadioGroupItem value="on" aria-label="checked" />
          </RadioGroup>
        </div>
      </Demo>

      <Demo label="Focus / disabled">
        <div className="flex items-start gap-6">
          <Specimen caption="focus">
            <RadioGroup defaultValue="on" aria-label="focus">
              <RadioGroupItem value="on" aria-label="focus" className={focusRing} />
            </RadioGroup>
          </Specimen>
          <Specimen caption="disabled">
            <RadioGroup defaultValue="on" aria-label="disabled">
              <RadioGroupItem value="on" aria-label="disabled" disabled />
            </RadioGroup>
          </Specimen>
        </div>
      </Demo>

      <Demo label="Group + labels">
        <Specimen caption="group + labels">
          <RadioGroup defaultValue="standard" aria-label="Priority level">
            <RadioGroupItem value="standard" label="Standard" />
            <RadioGroupItem value="priority" label="Priority" />
          </RadioGroup>
        </Specimen>
      </Demo>
    </StoryShell>
  );
}
