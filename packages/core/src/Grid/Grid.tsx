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

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;

// Literal class strings so Tailwind's JIT can see them.
const COLS: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const GAP: Record<GapStep, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
  20: "gap-20",
  24: "gap-24",
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
        className={cn("grid", COLS[cols], GAP[gap], className)}
        {...props}
      />
    );
  },
);

Grid.displayName = "Grid";
