"use client";

import { RadioGroup, RadioGroupItem } from "@sina-design-system/core";
import { Example, Hero, Specimen, StorySource } from "../shell";

/**
 * Live RadioGroup demos for /docs/primitives/radio-group. Ported from the
 * playground story (apps/playground/app/primitives/radio-group/page.tsx) —
 * keep the two in step when the primitive's prop surface changes.
 */

export function RadioGroupHero() {
  return (
    <Hero>
      <RadioGroup defaultValue="standard" aria-label="Priority level">
        <RadioGroupItem value="standard" label="Standard" />
        <RadioGroupItem value="priority" label="Priority" />
        <RadioGroupItem value="urgent" label="Urgent" />
      </RadioGroup>
    </Hero>
  );
}

export function RadioGroupExamples() {
  return (
    <>
      <Example
        label="Group + labels"
        code={`<RadioGroup defaultValue="standard" aria-label="Priority level">
  <RadioGroupItem value="standard" label="Standard" />
  <RadioGroupItem value="priority" label="Priority" />
</RadioGroup>`}
      >
        <RadioGroup defaultValue="standard" aria-label="Priority level">
          <RadioGroupItem value="standard" label="Standard" />
          <RadioGroupItem value="priority" label="Priority" />
        </RadioGroup>
      </Example>

      <Example
        label="States"
        code={`<RadioGroup aria-label="unchecked">
  <RadioGroupItem value="off" aria-label="unchecked" />
</RadioGroup>
<RadioGroup defaultValue="on" aria-label="checked">
  <RadioGroupItem value="on" aria-label="checked" />
</RadioGroup>
<RadioGroup defaultValue="on" aria-label="disabled">
  <RadioGroupItem value="on" aria-label="disabled" disabled />
</RadioGroup>`}
      >
        <Specimen caption="unchecked">
          <RadioGroup aria-label="unchecked">
            <RadioGroupItem value="off" aria-label="unchecked" />
          </RadioGroup>
        </Specimen>
        <Specimen caption="checked">
          <RadioGroup defaultValue="on" aria-label="checked">
            <RadioGroupItem value="on" aria-label="checked" />
          </RadioGroup>
        </Specimen>
        <Specimen caption="disabled">
          <RadioGroup defaultValue="on" aria-label="disabled">
            <RadioGroupItem value="on" aria-label="disabled" disabled />
          </RadioGroup>
        </Specimen>
      </Example>

      <StorySource slug="radio-group" />
    </>
  );
}
