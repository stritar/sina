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
import { CheckFatIcon, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";
import styles from "./Select.module.css";

export const Select = Primitive.Root;
export const SelectValue = Primitive.Value;
export const SelectGroup = Primitive.Group;

export const SelectTrigger = forwardRef<
  ComponentRef<typeof Primitive.Trigger>,
  ComponentPropsWithoutRef<typeof Primitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <Primitive.Trigger ref={ref} className={cn(styles.trigger, className)} {...props}>
    {children}
    <Primitive.Icon asChild>
      <CaretDown aria-hidden weight="bold" className={styles.triggerIcon} />
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
      className={cn(styles.content, className)}
      {...props}
    >
      <Primitive.Viewport
        className={cn(styles.viewport, position === "popper" && styles.viewportPopper)}
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
  <Primitive.Item ref={ref} className={cn(styles.item, className)} {...props}>
    <span className={styles.itemIndicator}>
      <Primitive.ItemIndicator>
        <CheckFatIcon aria-hidden weight="fill" className={styles.itemIndicatorIcon} />
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
  <Primitive.Label ref={ref} className={cn(styles.label, className)} {...props} />
));
SelectLabel.displayName = "SelectLabel";

export const SelectSeparator = forwardRef<
  ComponentRef<typeof Primitive.Separator>,
  ComponentPropsWithoutRef<typeof Primitive.Separator>
>(({ className, ...props }, ref) => (
  <Primitive.Separator ref={ref} className={cn(styles.separator, className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";
