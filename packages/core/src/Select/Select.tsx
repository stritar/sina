/**
 * @sina-design-system/core — Select
 *
 * Single-select listbox on Radix Select, styled via theme tokens. Ships as a set
 * of named exports: Select (root) / SelectTrigger / SelectValue / SelectContent /
 * SelectItem / SelectGroup / SelectLabel / SelectSeparator. Radix provides
 * typeahead, arrow-key navigation, and `aria-activedescendant`.
 *
 * Exported individually (not as one object) so each is its own client reference
 * — a single object export from a "use client" module loses deep property access
 * across the RSC server/client boundary. Domain-agnostic — option contents
 * (accounts, etc.) are the caller's concern.
 */
"use client";

import { Select as Primitive } from "radix-ui";
import { Check, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";

export const Select = Primitive.Root;
export const SelectValue = Primitive.Value;
export const SelectGroup = Primitive.Group;

export const SelectTrigger = forwardRef<
  ComponentRef<typeof Primitive.Trigger>,
  ComponentPropsWithoutRef<typeof Primitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <Primitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-7 w-full items-center justify-between gap-1.5 rounded-md border border-border-subtle bg-surface px-2.5 text-ui text-text",
      "data-[placeholder]:text-text-subtle transition-colors duration-fast ease-standard",
      "focus-visible:outline-none focus-visible:border-focus-ring focus-visible:ring-1 focus-visible:ring-focus-ring",
      "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-subtle",
      className,
    )}
    {...props}
  >
    {children}
    <Primitive.Icon asChild>
      <CaretDown aria-hidden weight="bold" className="size-control-2xs text-text-muted" />
    </Primitive.Icon>
  </Primitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = forwardRef<
  ComponentRef<typeof Primitive.Content>,
  ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      position={position}
      className={cn(
        "z-dropdown overflow-hidden rounded-md border border-border-subtle bg-surface-raised shadow-md",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    >
      <Primitive.Viewport
        className={cn("p-1", position === "popper" && "w-[var(--radix-select-trigger-width)]")}
      >
        {children}
      </Primitive.Viewport>
    </Primitive.Content>
  </Primitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = forwardRef<
  ComponentRef<typeof Primitive.Item>,
  ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, children, ...props }, ref) => (
  <Primitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-1.5 rounded-sm py-1.5 pl-6 pr-2 text-ui text-text outline-none",
      "data-[highlighted]:bg-hover data-[state=checked]:font-medium",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute inset-y-0 left-1.5 inline-flex items-center">
      <Primitive.ItemIndicator>
        <Check aria-hidden weight="bold" className="size-control-2xs shrink-0" />
      </Primitive.ItemIndicator>
    </span>
    <Primitive.ItemText>{children}</Primitive.ItemText>
  </Primitive.Item>
));
SelectItem.displayName = "SelectItem";

export const SelectLabel = forwardRef<
  ComponentRef<typeof Primitive.Label>,
  ComponentPropsWithoutRef<typeof Primitive.Label>
>(({ className, ...props }, ref) => (
  <Primitive.Label
    ref={ref}
    className={cn("px-2 py-1 text-xs font-medium text-text-muted", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

export const SelectSeparator = forwardRef<
  ComponentRef<typeof Primitive.Separator>,
  ComponentPropsWithoutRef<typeof Primitive.Separator>
>(({ className, ...props }, ref) => (
  <Primitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border-subtle", className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";
