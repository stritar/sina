import { RadioGroup, RadioGroupItem } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function RadioGroupStory() {
  return (
    <StoryShell title="RadioGroup">
      <Demo label="Vertical (default, with defaultValue)">
        <RadioGroup defaultValue="bravo" aria-label="Vertical choice" className="w-80">
          <RadioGroupItem value="alpha" label="Alpha" />
          <RadioGroupItem value="bravo" label="Bravo" />
          <RadioGroupItem value="charlie" label="Charlie" />
        </RadioGroup>
      </Demo>

      <Demo label="Horizontal (className flex-row gap-6)">
        <RadioGroup
          defaultValue="alpha"
          aria-label="Horizontal choice"
          className="flex-row gap-6"
        >
          <RadioGroupItem value="alpha" label="Alpha" />
          <RadioGroupItem value="bravo" label="Bravo" />
          <RadioGroupItem value="charlie" label="Charlie" />
        </RadioGroup>
      </Demo>

      <Demo label="Disabled item (one item disabled)">
        <RadioGroup defaultValue="alpha" aria-label="Choice with a disabled item" className="w-80">
          <RadioGroupItem value="alpha" label="Alpha" />
          <RadioGroupItem value="bravo" label="Bravo" />
          <RadioGroupItem value="charlie" label="Charlie (unavailable)" disabled />
        </RadioGroup>
      </Demo>

      <Demo label="Disabled group (RadioGroup disabled)">
        <RadioGroup defaultValue="bravo" disabled aria-label="Disabled choice" className="w-80">
          <RadioGroupItem value="alpha" label="Alpha" />
          <RadioGroupItem value="bravo" label="Bravo" />
          <RadioGroupItem value="charlie" label="Charlie" />
        </RadioGroup>
      </Demo>
    </StoryShell>
  );
}
