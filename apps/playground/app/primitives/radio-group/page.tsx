import { RadioGroup, RadioGroupItem } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function RadioGroupStory() {
  return (
    <StoryShell title="RadioGroup">
      <Demo label="states">
        <RadioGroup aria-label="states" className="flex-row gap-6">
          <RadioGroupItem value="a" aria-label="unselected" />
          <RadioGroupItem value="b" aria-label="selected" defaultChecked />
          <RadioGroupItem value="c" aria-label="disabled" disabled />
        </RadioGroup>
      </Demo>
      <Demo label="transfer speed">
        <RadioGroup defaultValue="standard" aria-label="Transfer speed" className="w-80">
          <RadioGroupItem value="standard" label="Standard · 1–3 business days" />
          <RadioGroupItem value="same-day" label="Same-day · $15 fee" />
          <RadioGroupItem value="wire" label="Wire · instant, $30 fee" />
          <RadioGroupItem value="intl" label="International · unavailable" disabled />
        </RadioGroup>
      </Demo>
    </StoryShell>
  );
}
