/**
 * @sina-design-system/core — Progress
 *
 * Determinate / indeterminate progress bar on Radix Progress (renders
 * `role="progressbar"` with the right ARIA value attributes). Determinate when a
 * `value` is given; indeterminate (animated, reduced-motion aware) when it is
 * omitted. Domain-agnostic.
 */
"use client";

import { Progress as Primitive } from "radix-ui";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";
import styles from "./Progress.module.css";

export interface ProgressProps
  extends Omit<ComponentPropsWithoutRef<typeof Primitive.Root>, "value"> {
  /** Completion 0–100. Omit (or null) for an indeterminate bar. */
  value?: number | null;
  /** Accessible label for the progress bar. */
  label?: string;
}

export const Progress = forwardRef<ComponentRef<typeof Primitive.Root>, ProgressProps>(
  ({ value, label, className, ...props }, ref) => {
    const indeterminate = value == null;
    const clamped = indeterminate ? 0 : Math.max(0, Math.min(100, value));

    return (
      <Primitive.Root
        ref={ref}
        value={indeterminate ? null : clamped}
        aria-label={label}
        className={cn(styles.root, className)}
        {...props}
      >
        <Primitive.Indicator
          className={cn(styles.indicator, indeterminate && styles.indeterminate)}
          style={indeterminate ? undefined : { width: `${clamped}%` }}
        />
      </Primitive.Root>
    );
  },
);

Progress.displayName = "Progress";
