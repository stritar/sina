import { Checkbox } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function CheckboxStory() {
  return (
    <StoryShell title="Checkbox">
      <Demo label="states">
        <Checkbox aria-label="unchecked" />
        <Checkbox aria-label="checked" defaultChecked />
        <Checkbox aria-label="indeterminate" checked="indeterminate" />
        <Checkbox aria-label="disabled" disabled />
        <Checkbox aria-label="disabled checked" disabled defaultChecked />
      </Demo>
      <Demo label="with label">
        <Checkbox label="I authorize this transfer" />
      </Demo>
    </StoryShell>
  );
}
