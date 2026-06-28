import { Grid } from "@sina-design-system/core";
import type { ComponentProps } from "react";
import { Demo, StoryShell } from "../_components/StoryShell";

type GridCols = NonNullable<ComponentProps<typeof Grid>["cols"]>;
type GapStep = NonNullable<ComponentProps<typeof Grid>["gap"]>;

const COLS = [1, 2, 3, 4, 5, 6, 12] as const;
const GAPS = [0, 2, 4, 6, 8, 12] as const;

function Cell() {
  return <div className="h-12 rounded-md bg-surface-raised" />;
}

export default function GridStory() {
  return (
    <StoryShell title="Grid">
      <Demo label="Columns">
        <div className="flex w-full flex-col gap-4">
          {COLS.map((c) => (
            <div key={c} className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
                cols {c}
              </span>
              <Grid cols={c as GridCols} gap={4} className="w-full">
                {Array.from({ length: c }, (_, i) => (
                  <Cell key={i} />
                ))}
              </Grid>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Gap">
        <div className="flex w-full flex-col gap-4">
          {GAPS.map((g) => (
            <div key={g} className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
                gap {g}
              </span>
              <Grid cols={3} gap={g as GapStep} className="w-full">
                {Array.from({ length: 6 }, (_, i) => (
                  <Cell key={i} />
                ))}
              </Grid>
            </div>
          ))}
        </div>
      </Demo>
    </StoryShell>
  );
}
