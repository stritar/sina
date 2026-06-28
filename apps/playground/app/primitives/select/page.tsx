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
      <Demo label="Simple list (placeholder via SelectValue)">
        <div className="w-full max-w-xs">
          <Select>
            <SelectTrigger aria-label="Pick an option">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem value="bravo">Bravo</SelectItem>
              <SelectItem value="charlie">Charlie</SelectItem>
              <SelectItem value="delta">Delta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Demo>

      <Demo label="Grouped (SelectGroup + SelectLabel + SelectSeparator)">
        <div className="w-full max-w-xs">
          <Select>
            <SelectTrigger aria-label="Grouped option">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Group one</SelectLabel>
                <SelectItem value="alpha">Alpha</SelectItem>
                <SelectItem value="bravo">Bravo</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Group two</SelectLabel>
                <SelectItem value="charlie">Charlie</SelectItem>
                <SelectItem value="delta">Delta</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </Demo>

      <Demo label="Disabled item (one SelectItem disabled)">
        <div className="w-full max-w-xs">
          <Select>
            <SelectTrigger aria-label="Option with a disabled item">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem value="bravo" disabled>
                Bravo (unavailable)
              </SelectItem>
              <SelectItem value="charlie">Charlie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Demo>

      <Demo label="Disabled trigger (Select disabled)">
        <div className="w-full max-w-xs">
          <Select disabled>
            <SelectTrigger aria-label="Disabled select">
              <SelectValue placeholder="Unavailable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem value="bravo">Bravo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Demo>

      <Demo label="Pre-selected (defaultValue)">
        <div className="w-full max-w-xs">
          <Select defaultValue="charlie">
            <SelectTrigger aria-label="Pre-selected option">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem value="bravo">Bravo</SelectItem>
              <SelectItem value="charlie">Charlie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Demo>
    </StoryShell>
  );
}
