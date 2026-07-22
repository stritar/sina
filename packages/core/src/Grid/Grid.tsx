/**
 * @sina-design-system/core — Grid
 *
 * Wrapped-column layout. Column count + gap come from on-system enums (the 8-pt
 * token scale), so spacing stays on-system — no magic numbers. Polymorphic via
 * `as`. Presentational and domain-agnostic; the column-based substrate `Stack`
 * and `SummaryList` build on.
 */
import { forwardRef } from "react";
import type { ElementType, HTMLAttributes } from "react";
import { cn } from "../utils/cn.js";
import type { GapStep } from "../Stack/Stack.js";
import styles from "./Grid.module.css";

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;

// Each on-system count/step maps to its own module class (CSS Module class access
// is `string | undefined` under noUncheckedIndexedAccess).
const COLS: Record<GridCols, string | undefined> = {
  1: styles.cols1,
  2: styles.cols2,
  3: styles.cols3,
  4: styles.cols4,
  5: styles.cols5,
  6: styles.cols6,
  12: styles.cols12,
};

const GAP: Record<GapStep, string | undefined> = {
  0: styles.gap0,
  1: styles.gap1,
  2: styles.gap2,
  3: styles.gap3,
  4: styles.gap4,
  5: styles.gap5,
  6: styles.gap6,
  8: styles.gap8,
  10: styles.gap10,
  12: styles.gap12,
  16: styles.gap16,
  20: styles.gap20,
  24: styles.gap24,
};

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Render as a different element (default `div`). */
  as?: ElementType;
  /** Number of columns. */
  cols?: GridCols;
  /** Gap between cells, in on-system steps. */
  gap?: GapStep;
}

export const Grid = forwardRef<HTMLElement, GridProps>(
  ({ as, cols = 2, gap = 4, className, ...props }, ref) => {
    const Comp = (as ?? "div") as ElementType;
    return (
      <Comp
        ref={ref}
        className={cn(styles.root, COLS[cols], GAP[gap], className)}
        {...props}
      />
    );
  },
);

Grid.displayName = "Grid";
