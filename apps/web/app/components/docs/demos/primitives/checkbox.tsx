"use client";

import { useState } from "react";
import { Checkbox } from "@sina-design-system/core";
import { Example, Hero, Specimen, StorySource } from "../shell";

/**
 * Live Checkbox demos for /docs/primitives/checkbox. Ported from the
 * playground story (apps/playground/app/primitives/checkbox/page.tsx) — keep
 * the two in step when the primitive's prop surface changes.
 */

export function CheckboxHero() {
  const [wire, setWire] = useState(true);
  const [ach, setAch] = useState(false);
  const all = wire && ach ? true : !wire && !ach ? false : ("indeterminate" as const);

  return (
    <Hero>
      <Checkbox
        label="All rails"
        checked={all}
        onCheckedChange={(next) => {
          setWire(next === true);
          setAch(next === true);
        }}
      />
      <Checkbox label="Wire" checked={wire} onCheckedChange={(next) => setWire(next === true)} />
      <Checkbox label="ACH" checked={ach} onCheckedChange={(next) => setAch(next === true)} />
    </Hero>
  );
}

export function CheckboxExamples() {
  return (
    <>
      <Example
        label="States"
        code={`<Checkbox aria-label="unchecked" />
<Checkbox aria-label="checked" defaultChecked />
<Checkbox aria-label="indeterminate" checked="indeterminate" />
<Checkbox aria-label="disabled" defaultChecked disabled />`}
      >
        <Specimen caption="unchecked">
          <Checkbox aria-label="unchecked" />
        </Specimen>
        <Specimen caption="checked">
          <Checkbox aria-label="checked" defaultChecked />
        </Specimen>
        <Specimen caption="indeterminate">
          <Checkbox aria-label="indeterminate" checked="indeterminate" />
        </Specimen>
        <Specimen caption="disabled">
          <Checkbox aria-label="disabled" defaultChecked disabled />
        </Specimen>
      </Example>

      <Example
        label="With label"
        code={`<Checkbox label="Accept terms" defaultChecked />
<Checkbox label="Subscribe" />`}
      >
        <Checkbox label="Accept terms" defaultChecked />
        <Checkbox label="Subscribe" />
      </Example>

      <Example
        label="Controlled"
        code={`const [agreed, setAgreed] = useState(false);

<Checkbox
  label="I agree"
  checked={agreed}
  onCheckedChange={(next) => setAgreed(next === true)}
/>`}
      >
        <ControlledCheckbox />
      </Example>

      <StorySource slug="checkbox" />
    </>
  );
}

function ControlledCheckbox() {
  const [agreed, setAgreed] = useState(false);
  return (
    <Checkbox label="I agree" checked={agreed} onCheckedChange={(next) => setAgreed(next === true)} />
  );
}
