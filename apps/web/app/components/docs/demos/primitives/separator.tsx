"use client";

import { Separator, Stack } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Separator demos for /docs/primitives/separator. Ported from the
 * playground story (apps/playground/app/primitives/separator/page.tsx) —
 * keep the two in step when the primitive's prop surface changes.
 */

export function SeparatorHero() {
  return (
    <Hero>
      <Stack direction="row" gap={3} align="center">
        <span>Edit</span>
        <Separator orientation="vertical" />
        <span>Duplicate</span>
        <Separator orientation="vertical" />
        <span>Delete</span>
      </Stack>
    </Hero>
  );
}

export function SeparatorExamples() {
  return (
    <>
      <Example
        label="Horizontal · between two blocks"
        code={`<p>First section</p>
<Separator />
<p>Second section</p>`}
      >
        <Stack gap={2}>
          <p>First section</p>
          <Separator />
          <p>Second section</p>
        </Stack>
      </Example>

      <Example
        label="Vertical · between inline items"
        code={`<span>Edit</span>
<Separator orientation="vertical" />
<span>Duplicate</span>
<Separator orientation="vertical" />
<span>Delete</span>`}
      >
        <Stack direction="row" gap={3} align="center">
          <span>Edit</span>
          <Separator orientation="vertical" />
          <span>Duplicate</span>
          <Separator orientation="vertical" />
          <span>Delete</span>
        </Stack>
      </Example>

      <Example
        label="Semantic · decorative={false} exposes role=&quot;separator&quot;"
        code={`<p>Above the boundary</p>
<Separator decorative={false} />
<p>Below the boundary</p>`}
      >
        <Stack gap={2}>
          <p>Above the boundary</p>
          <Separator decorative={false} />
          <p>Below the boundary</p>
        </Stack>
      </Example>

      <StorySource slug="separator" />
    </>
  );
}
