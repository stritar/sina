/**
 * @sina-design-system/core — Checkbox
 *
 * Boolean (or indeterminate) acknowledgement on Radix Checkbox. Visible focus
 * ring, keyboard-operable, with an optional associated label. `indeterminate`
 * is driven by Radix's `checked="indeterminate"`. Domain-agnostic — the
 * "I authorize this transfer" copy is the caller's.
 */
"use client";

import { Checkbox as Primitive } from "radix-ui";
import { CheckFatIcon } from "@phosphor-icons/react/dist/ssr";
import { forwardRef, useId } from "react";
import type { ComponentPropsWithoutRef, ComponentRef, ReactNode } from "react";
import { cn } from "../utils/cn.js";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof Primitive.Root> {
  /** Optional inline label associated with the control. */
  label?: ReactNode;
}

export const Checkbox = forwardRef<ComponentRef<typeof Primitive.Root>, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const labelId = `${controlId}-label`;

    const control = (
      <Primitive.Root
        ref={ref}
        id={controlId}
        aria-labelledby={label != null ? labelId : props["aria-labelledby"]}
        className={cn(styles.control, className)}
        {...props}
      >
        <Primitive.Indicator>
          {/* The checkmark uses Phosphor's CheckFat (fill weight) for a consistent
              mark across primitives. The indeterminate dash stays inline — it's a
              dash, not a check. `currentColor` inherits the box's `text-primary-fg`. */}
          <CheckFatIcon aria-hidden weight="fill" className={styles.checkIcon} />
          <svg aria-hidden viewBox="0 0 12 12" fill="none" className={styles.dashIcon}>
            <path
              d="M2.5 6L9.5 6"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Primitive.Indicator>
      </Primitive.Root>
    );

    if (label == null) return control;

    return (
      <div className={styles.wrapper}>
        {control}
        <label id={labelId} htmlFor={controlId} className={styles.label}>
          {label}
        </label>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
