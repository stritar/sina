"use client";

import { ScrollArea, Stack } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live ScrollArea demos for /docs/primitives/scroll-area. Ported from the
 * playground story (apps/playground/app/primitives/scroll-area/page.tsx) —
 * keep the two in step when the primitive's prop surface changes.
 *
 * The inline `style={{ height }}` on ScrollArea is the one sanctioned
 * exception: a scroll region only scrolls inside a fixed height.
 */

export function ScrollAreaHero() {
  return (
    <Hero>
      <ScrollArea style={{ height: 160 }}>
        <Stack gap={2}>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i}>Row {i + 1}</div>
          ))}
        </Stack>
      </ScrollArea>
    </Hero>
  );
}

export function ScrollAreaExamples() {
  return (
    <>
      <Example
        label="Vertical · a bounded list"
        code={`<ScrollArea style={{ height: 220 }}>
  <Stack gap={2}>
    {rows.map((row) => (
      <div key={row}>Row {row}</div>
    ))}
  </Stack>
</ScrollArea>`}
      >
        <ScrollArea style={{ height: 220 }}>
          <Stack gap={2}>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i}>Row {i + 1}</div>
            ))}
          </Stack>
        </ScrollArea>
      </Example>

      <Example
        label="Horizontal · content wider than the viewport"
        code={`<ScrollArea>
  <pre>{oneVeryLongUnbrokenLine}</pre>
</ScrollArea>`}
      >
        <ScrollArea>
          <pre>
            {Array.from({ length: 16 }, (_, i) => `Chip ${i + 1}`).join("   ·   ")}
          </pre>
        </ScrollArea>
      </Example>

      <StorySource slug="scroll-area" />
    </>
  );
}
