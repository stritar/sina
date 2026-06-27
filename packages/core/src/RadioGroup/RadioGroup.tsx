/**
 * @sina-design-system/core — RadioGroup
 *
 * Exclusive choice on Radix RadioGroup. Roving focus + arrow-key navigation come
 * from Radix; each item shows a filled inner dot when selected, with a visible
 * focus ring and an optional associated label. Ships as named exports
 * (RadioGroup / RadioGroupItem) so each is its own client reference across the
 * RSC boundary. Domain-agnostic.
 */
"use client";

import { RadioGroup as Primitive } from "radix-ui";
import { forwardRef, useId } from "react";
import type { ComponentPropsWithoutRef, ComponentRef, ReactNode } from "react";
import { cn } from "../utils/cn.js";

export const RadioGroup = forwardRef<
  ComponentRef<typeof Primitive.Root>,
  ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, ...props }, ref) => (
  <Primitive.Root ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends ComponentPropsWithoutRef<typeof Primitive.Item> {
  /** Optional inline label associated with the radio. */
  label?: ReactNode;
}

export const RadioGroupItem = forwardRef<
  ComponentRef<typeof Primitive.Item>,
  RadioGroupItemProps
>(({ className, label, id, ...props }, ref) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const labelId = `${controlId}-label`;

  const control = (
    <Primitive.Item
      ref={ref}
      id={controlId}
      aria-labelledby={label != null ? labelId : props["aria-labelledby"]}
      className={cn(
        // 16px visual; ::before expander keeps a ≥24px hit target (32px coarse).
        "relative flex size-4 shrink-0 items-center justify-center rounded-full border border-border bg-surface",
        "before:absolute before:-inset-1 before:content-[''] pointer-coarse:before:-inset-2",
        "transition-colors duration-fast ease-standard",
        "data-[state=checked]:border-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Primitive.Indicator className="block size-1.5 rounded-full bg-primary" />
    </Primitive.Item>
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
});
RadioGroupItem.displayName = "RadioGroupItem";
