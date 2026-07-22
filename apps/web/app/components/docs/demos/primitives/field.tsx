"use client";

import { Field } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Field demos for /docs/primitives/field. Ported from the playground
 * story (apps/playground/app/primitives/field/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

export function FieldHero() {
  return (
    <Hero>
      <Field label="Recipient" description="Full legal name on the account">
        <input placeholder="Jane Doe" />
      </Field>
      <Field label="Reference" error="This field is required">
        <input />
      </Field>
    </Hero>
  );
}

export function FieldExamples() {
  return (
    <>
      <Example
        label="Label & description"
        code={`<Field label="Recipient">
  <input placeholder="Jane Doe" />
</Field>
<Field label="Recipient" description="Full legal name on the account">
  <input placeholder="Jane Doe" />
</Field>`}
      >
        <Field label="Recipient">
          <input placeholder="Jane Doe" />
        </Field>
        <Field label="Recipient" description="Full legal name on the account">
          <input placeholder="Jane Doe" />
        </Field>
      </Example>

      <Example
        label="Error & required"
        code={`<Field label="Reference" error="This field is required">
  <input />
</Field>
<Field label="Reference" required>
  <input />
</Field>`}
      >
        <Field label="Reference" error="This field is required">
          <input />
        </Field>
        <Field label="Reference" required>
          <input />
        </Field>
      </Example>

      <Example
        label="Any control · the a11y wiring clones onto the child"
        code={`<Field label="Region" description="Pick one">
  <select>
    <option>North</option>
    <option>South</option>
  </select>
</Field>
<Field label="Notes" description="Free-form text">
  <textarea rows={3} placeholder="Add a note" />
</Field>
<Field label="Quantity" description="Whole units" required>
  <input type="number" placeholder="0" />
</Field>`}
      >
        <Field label="Region" description="Pick one">
          <select>
            <option>North</option>
            <option>South</option>
            <option>East</option>
            <option>West</option>
          </select>
        </Field>
        <Field label="Notes" description="Free-form text">
          <textarea rows={3} placeholder="Add a note" />
        </Field>
        <Field label="Quantity" description="Whole units" required>
          <input type="number" placeholder="0" />
        </Field>
      </Example>

      <StorySource slug="field" />
    </>
  );
}
