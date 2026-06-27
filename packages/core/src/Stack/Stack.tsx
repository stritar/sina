/**
 * @sina-design-system/core — Stack
 *
 * One-axis flex layout. Spacing comes straight from the 8-pt token scale (no
 * magic numbers) — `gap` is an enum of on-system steps, not an arbitrary number,
 * so a caller (or an AI agent) cannot reach for off-system spacing. Polymorphic
 * via `as`. Presentational and domain-agnostic; pairs with `Grid`.
 */
import { forwardRef } from "react";
import type { ElementType, HTMLAttributes } from "react";
import { cn } from "../utils/cn.js";

/** On-system spacing steps (mirror the theme `space` scale). */
export type GapStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Literal class strings so Tailwind's JIT can see them (no dynamic `gap-${n}`).
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

const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const;

const JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const;

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Render as a different element (default `div`). */
  as?: ElementType;
  /** Flow axis. */
  direction?: "row" | "col";
  /** Gap between children, in on-system steps. */
  gap?: GapStep;
  align?: keyof typeof ALIGN;
  justify?: keyof typeof JUSTIFY;
  wrap?: boolean;
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  (
    { as, direction = "col", gap = 4, align, justify, wrap = false, className, ...props },
    ref,
  ) => {
    const Comp = (as ?? "div") as ElementType;
    return (
      <Comp
        ref={ref}
        className={cn(
          "flex",
          direction === "col" ? "flex-col" : "flex-row",
          GAP[gap],
          align && ALIGN[align],
          justify && JUSTIFY[justify],
          wrap && "flex-wrap",
          className,
        )}
        {...props}
      />
    );
  },
);

Stack.displayName = "Stack";
