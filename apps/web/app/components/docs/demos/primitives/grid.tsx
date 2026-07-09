"use client";

import { Badge, Grid, Stack } from "@sina-design-system/core";
import { Example, Hero, Specimen, StorySource } from "../shell";

/**
 * Live Grid demos for /docs/primitives/grid. Ported from the playground story
 * (apps/playground/app/primitives/grid/page.tsx) and the old docs GridDemo —
 * keep them in step when the primitive's prop surface changes.
 */

const HERO_CELLS = ["Dialog", "Field", "Alert", "Badge", "Stack", "Grid"] as const;

function Cell({ children }: { children: string }) {
  return (
    <Stack align="center">
      <Badge>{children}</Badge>
    </Stack>
  );
}

export function GridHero() {
  return (
    <Hero>
      <Grid cols={3} gap={3}>
        {HERO_CELLS.map((name) => (
          <Cell key={name}>{name}</Cell>
        ))}
      </Grid>
    </Hero>
  );
}

export function GridExamples() {
  return (
    <>
      <Example
        label="Columns"
        code={`<Grid cols={2} gap={3}>…</Grid>
<Grid cols={3} gap={3}>…</Grid>
<Grid cols={4} gap={3}>…</Grid>`}
      >
        {([2, 3, 4] as const).map((cols) => (
          <Specimen key={cols} caption={`cols ${cols}`}>
            <Grid cols={cols} gap={3}>
              {Array.from({ length: cols * 2 }, (_, i) => (
                <Cell key={i}>{`Cell ${i + 1}`}</Cell>
              ))}
            </Grid>
          </Specimen>
        ))}
      </Example>

      <Example
        label="Gap · on-system steps"
        code={`<Grid cols={3} gap={2}>…</Grid>
<Grid cols={3} gap={8}>…</Grid>`}
      >
        {([2, 8] as const).map((gap) => (
          <Specimen key={gap} caption={`gap ${gap}`}>
            <Grid cols={3} gap={gap}>
              {Array.from({ length: 6 }, (_, i) => (
                <Cell key={i}>{`Cell ${i + 1}`}</Cell>
              ))}
            </Grid>
          </Specimen>
        ))}
      </Example>

      <StorySource slug="grid" />
    </>
  );
}
