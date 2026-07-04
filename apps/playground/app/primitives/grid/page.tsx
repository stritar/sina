import { Grid } from "@sina-design-system/core";
import type { ComponentProps } from "react";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

type GridCols = NonNullable<ComponentProps<typeof Grid>["cols"]>;
type GapStep = NonNullable<ComponentProps<typeof Grid>["gap"]>;

const COLS = [1, 2, 3, 4, 5, 6, 12] as const;
const GAPS = [0, 2, 4, 6, 8, 12] as const;

function Cell() {
  return <div className={styles.cell} />;
}

export default function GridStory() {
  return (
    <StoryShell title="Grid">
      <Demo label="Columns">
        <div className={styles.stack}>
          {COLS.map((c) => (
            <div key={c} className={styles.group}>
              <span className={styles.caption}>
                cols {c}
              </span>
              <Grid cols={c as GridCols} gap={4} className={styles.gridFull}>
                {Array.from({ length: c }, (_, i) => (
                  <Cell key={i} />
                ))}
              </Grid>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Gap">
        <div className={styles.stack}>
          {GAPS.map((g) => (
            <div key={g} className={styles.group}>
              <span className={styles.caption}>
                gap {g}
              </span>
              <Grid cols={3} gap={g as GapStep} className={styles.gridFull}>
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
