"use client";

import { Button, Icon, Stack, VisuallyHidden } from "@sina-design-system/core";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Example, Hero, Specimen, StorySource } from "../shell";

/**
 * Live VisuallyHidden demos for /docs/primitives/visually-hidden. Ported from
 * the playground story (apps/playground/app/primitives/visually-hidden/page.tsx)
 * — keep the two in step when the primitive's prop surface changes.
 */

export function VisuallyHiddenHero() {
  return (
    <Hero>
      <Stack direction="row" gap={3} align="center">
        <Button variant="secondary">
          <Icon icon={X} decorative size={16} weight="bold" />
          <VisuallyHidden>Close</VisuallyHidden>
        </Button>
        <span>← looks icon-only, announced as “Close”</span>
      </Stack>
    </Hero>
  );
}

export function VisuallyHiddenExamples() {
  return (
    <>
      <Example
        label="Icon-only button · name from hidden text"
        code={`<Button variant="secondary">
  <Icon icon={X} decorative />
  <VisuallyHidden>Close</VisuallyHidden>
</Button>`}
      >
        <Specimen caption="you see the glyph — a screen reader announces “Close, button”">
          <Button variant="secondary">
            <Icon icon={X} decorative size={16} weight="bold" />
            <VisuallyHidden>Close</VisuallyHidden>
          </Button>
        </Specimen>
      </Example>

      <Example
        label="Standalone screen-reader context"
        code={`<p>
  Step 2 of 4
  <VisuallyHidden> — Account details</VisuallyHidden>
</p>`}
      >
        <Specimen caption="sighted: “Step 2 of 4” · announced: “Step 2 of 4 — Account details”">
          <span>
            Step 2 of 4
            <VisuallyHidden> — Account details</VisuallyHidden>
          </span>
        </Specimen>
      </Example>

      <StorySource slug="visually-hidden" />
    </>
  );
}
