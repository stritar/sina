/**
 * @sina-design-system/core — DropdownMenu
 *
 * Action menu on Radix DropdownMenu — a list of *commands* fired from a trigger
 * (unlike Select, which is a listbox that holds a value). Radix provides the
 * roving focus, typeahead, Escape-to-close and focus return. Ships as named
 * exports (DropdownMenu / DropdownMenuTrigger / DropdownMenuContent /
 * DropdownMenuItem / DropdownMenuGroup / DropdownMenuLabel /
 * DropdownMenuSeparator) so each is its own client reference — a single object
 * export from a "use client" module loses deep property access across the RSC
 * server/client boundary. Domain-agnostic — item contents are the caller's.
 */
"use client";

import { DropdownMenu as Primitive } from "radix-ui";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";
import styles from "./DropdownMenu.module.css";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;

export const DropdownMenuContent = forwardRef<
  ComponentRef<typeof Primitive.Content>,
  ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, sideOffset = 4, align = "end", ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(styles.content, className)}
      {...props}
    >
      {children}
    </Primitive.Content>
  </Primitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = forwardRef<
  ComponentRef<typeof Primitive.Item>,
  ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, ...props }, ref) => (
  <Primitive.Item ref={ref} className={cn(styles.item, className)} {...props} />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof Primitive.Label>,
  ComponentPropsWithoutRef<typeof Primitive.Label>
>(({ className, ...props }, ref) => (
  <Primitive.Label ref={ref} className={cn(styles.label, className)} {...props} />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = forwardRef<
  ComponentRef<typeof Primitive.Separator>,
  ComponentPropsWithoutRef<typeof Primitive.Separator>
>(({ className, ...props }, ref) => (
  <Primitive.Separator ref={ref} className={cn(styles.separator, className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
