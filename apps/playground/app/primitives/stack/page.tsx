import { Stack } from "@sina-design-system/core";
import type { ComponentProps } from "react";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

type GapStep = NonNullable<ComponentProps<typeof Stack>["gap"]>;
type Align = NonNullable<ComponentProps<typeof Stack>["align"]>;
type Justify = NonNullable<ComponentProps<typeof Stack>["justify"]>;

const GAPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] as const;
const ALIGNS = ["start", "center", "end", "stretch", "baseline"] as const;
const JUSTIFIES = ["start", "center", "end", "between", "around"] as const;

function Box({ className }: { className?: string }) {
  return <div className={[styles.box, className].filter(Boolean).join(" ")} />;
}

export default function StackStory() {
  return (
    <StoryShell title="Stack">
      <Demo label="Gap steps">
        <div className={styles.column}>
          {GAPS.map((g) => (
            <div key={g} className={styles.group}>
              <span className={styles.label}>
                gap {g}
              </span>
              <Stack direction="row" gap={g as GapStep}>
                <Box className={styles.boxNarrow} />
                <Box className={styles.boxNarrow} />
                <Box className={styles.boxNarrow} />
              </Stack>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Direction">
        <div className={styles.column}>
          <div className={styles.group}>
            <span className={styles.label}>
              row
            </span>
            <Stack direction="row" gap={3}>
              <Box className={styles.boxNarrow} />
              <Box className={styles.boxNarrow} />
              <Box className={styles.boxNarrow} />
            </Stack>
          </div>
          <div className={styles.group}>
            <span className={styles.label}>
              col
            </span>
            <Stack direction="col" gap={3}>
              <Box />
              <Box />
              <Box />
            </Stack>
          </div>
        </div>
      </Demo>

      <Demo label="Align">
        <div className={styles.column}>
          {ALIGNS.map((a) => (
            <div key={a} className={styles.group}>
              <span className={styles.label}>
                align {a}
              </span>
              <Stack
                direction="row"
                gap={3}
                align={a as Align}
                className={styles.alignFrame}
              >
                <div className={[styles.chip, styles.chipShort, styles.wide16].join(" ")} />
                <div className={[styles.chip, styles.chipTall, styles.wide16].join(" ")} />
                <div className={[styles.chip, styles.chipMid, styles.wide16].join(" ")} />
              </Stack>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Justify">
        <div className={styles.column}>
          {JUSTIFIES.map((j) => (
            <div key={j} className={styles.group}>
              <span className={styles.label}>
                justify {j}
              </span>
              <Stack
                direction="row"
                gap={3}
                justify={j as Justify}
                className={styles.justifyFrame}
              >
                <div className={[styles.chip, styles.chipShort, styles.wide16].join(" ")} />
                <div className={[styles.chip, styles.chipShort, styles.wide16].join(" ")} />
                <div className={[styles.chip, styles.chipShort, styles.wide16].join(" ")} />
              </Stack>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Wrap">
        <div className={styles.column}>
          <div className={styles.group}>
            <span className={styles.label}>
              wrap
            </span>
            <Stack direction="row" gap={2} wrap className={styles.wrapFrame}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className={[styles.chip, styles.chipShort, styles.wide24].join(" ")} />
              ))}
            </Stack>
          </div>
          <div className={styles.group}>
            <span className={styles.label}>
              no wrap
            </span>
            <Stack direction="row" gap={2} className={styles.noWrapFrame}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className={[styles.chip, styles.chipShort, styles.wide24, styles.fixed].join(" ")} />
              ))}
            </Stack>
          </div>
        </div>
      </Demo>
    </StoryShell>
  );
}
