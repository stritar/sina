import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function SelectStory() {
  return (
    <StoryShell title="Select">
      <Demo label="Single-select listbox (typeahead + arrow keys)">
        <div className="w-full max-w-xs">
          <Select>
            <SelectTrigger aria-label="Source account">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Personal</SelectLabel>
                <SelectItem value="checking">Checking ••1234</SelectItem>
                <SelectItem value="savings">Savings ••5678</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Business</SelectLabel>
                <SelectItem value="operating">Operating ••9012</SelectItem>
                <SelectItem value="reserve" disabled>
                  Reserve ••3456 (locked)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </Demo>
    </StoryShell>
  );
}
