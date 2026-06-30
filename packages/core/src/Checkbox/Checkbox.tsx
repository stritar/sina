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
        className={cn(
          // 16px visual; a ::before expander keeps a ≥24px hit target (32px on
          // coarse pointers) without enlarging the box.
          "group relative flex size-4 shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-primary-fg",
          "before:absolute before:-inset-1 before:content-[''] pointer-coarse:before:-inset-2",
          "transition-colors duration-fast ease-standard",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
          "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <Primitive.Indicator>
          {/* The checkmark uses Phosphor's CheckFat (fill weight) for a consistent
              mark across primitives. The indeterminate dash stays inline — it's a
              dash, not a check. `currentColor` inherits the box's `text-primary-fg`. */}
          <CheckFatIcon
            aria-hidden
            weight="fill"
            className="hidden size-3 shrink-0 group-data-[state=checked]:block"
          />
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            fill="none"
            className="hidden size-3 shrink-0 group-data-[state=indeterminate]:block"
          >
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
      <div className="flex items-center gap-2">
        {control}
        <label id={labelId} htmlFor={controlId} className="text-ui text-text">
          {label}
        </label>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
