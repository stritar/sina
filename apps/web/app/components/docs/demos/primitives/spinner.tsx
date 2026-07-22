"use client";

import { Spinner } from "@sina-design-system/core";
import { Example, Hero, Specimen, StorySource } from "../shell";

/**
 * Live Spinner demos for /docs/primitives/spinner. Ported from the playground
 * story (apps/playground/app/primitives/spinner/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

const SIZES = ["sm", "md", "lg"] as const;

export function SpinnerHero() {
  return (
    <Hero>
      <Spinner size="lg" label="Loading" />
    </Hero>
  );
}

export function SpinnerExamples() {
  return (
    <>
      <Example
        label="Sizes · sm / md / lg"
        code={`<Spinner size="sm" label="Loading (sm)" />
<Spinner size="md" label="Loading (md)" />
<Spinner size="lg" label="Loading (lg)" />`}
      >
        {SIZES.map((size) => (
          <Specimen key={size} caption={size}>
            <Spinner size={size} label={`Loading (${size})`} />
          </Specimen>
        ))}
      </Example>

      <Example
        label="Accessible label · announced via role=&quot;status&quot;, never shown"
        code={`<Spinner label="Loading transactions" />`}
      >
        <Specimen caption="label is screen-reader-only">
          <Spinner label="Loading transactions" />
        </Specimen>
      </Example>

      <StorySource slug="spinner" />
    </>
  );
}
