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
import { Check, Minus } from "lucide-react";
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
          "group flex size-5 shrink-0 items-center justify-center rounded border border-border bg-surface text-primary-fg",
          "transition-colors duration-fast ease-standard",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
          "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <Primitive.Indicator>
          <Check aria-hidden className="hidden size-3.5 group-data-[state=checked]:block" />
          <Minus aria-hidden className="hidden size-3.5 group-data-[state=indeterminate]:block" />
        </Primitive.Indicator>
      </Primitive.Root>
    );

    if (label == null) return control;

    return (
      <div className="flex items-center gap-2">
        {control}
        <label id={labelId} htmlFor={controlId} className="text-sm text-text">
          {label}
        </label>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
