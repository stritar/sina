"use client";

import { TextField } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live TextField demos for /docs/primitives/text-field. Ported from the
 * playground story (apps/playground/app/primitives/text-field/page.tsx) — keep
 * the two in step when the primitive's prop surface changes.
 */

export function TextFieldHero() {
  return (
    <Hero>
      <TextField
        label="Recipient name"
        description="As it appears on the account."
        placeholder="Acme Payroll"
      />
    </Hero>
  );
}

export function TextFieldExamples() {
  return (
    <>
      <Example
        label="Label, description, error"
        code={`<TextField label="Recipient name" />
<TextField label="Recipient name" description="As it appears on the account." />
<TextField label="Recipient name" error="Recipient is required." />`}
      >
        <TextField label="Recipient name" />
        <TextField label="Recipient name" description="As it appears on the account." />
        <TextField label="Recipient name" error="Recipient is required." />
      </Example>

      <Example
        label="Required, disabled, value"
        code={`<TextField label="Recipient name" required />
<TextField label="Recipient name" disabled defaultValue="Acme Payroll" />
<TextField label="Recipient name" placeholder="Acme Payroll" />
<TextField label="Recipient name" defaultValue="Acme Payroll" />`}
      >
        <TextField label="Recipient name" required />
        <TextField label="Recipient name" disabled defaultValue="Acme Payroll" />
        <TextField label="Recipient name" placeholder="Acme Payroll" />
        <TextField label="Recipient name" defaultValue="Acme Payroll" />
      </Example>

      <Example
        label="Multiline"
        code={`<TextField label="Memo" multiline placeholder="Add a memo (optional)" />
<TextField label="Memo" multiline rows={6} placeholder="Add a longer memo" />`}
      >
        <TextField label="Memo" multiline placeholder="Add a memo (optional)" />
        <TextField label="Memo" multiline rows={6} placeholder="Add a longer memo" />
      </Example>

      <StorySource slug="text-field" />
    </>
  );
}
