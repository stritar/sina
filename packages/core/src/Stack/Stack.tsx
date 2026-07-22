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
import styles from "./Stack.module.css";

/** On-system spacing steps (mirror the theme `space` scale). */
export type GapStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Each on-system step maps to its own module class (CSS Module class access is
// `string | undefined` under noUncheckedIndexedAccess).
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

const ALIGN: Record<"start" | "center" | "end" | "stretch" | "baseline", string | undefined> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
  baseline: styles.alignBaseline,
};

const JUSTIFY: Record<"start" | "center" | "end" | "between" | "around", string | undefined> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
  around: styles.justifyAround,
};

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
          styles.root,
          direction === "col" ? styles.col : styles.row,
          GAP[gap],
          align && ALIGN[align],
          justify && JUSTIFY[justify],
          wrap && styles.wrap,
          className,
        )}
        {...props}
      />
    );
  },
);

Stack.displayName = "Stack";
