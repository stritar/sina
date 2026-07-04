/**
 * @sina-design-system/core — Dialog
 *
 * Focus-trapped modal shell on Radix Dialog, styled via theme tokens. Ships as a
 * set of named exports: Dialog (root) / DialogTrigger / DialogContent /
 * DialogTitle / DialogDescription / DialogClose. `DialogContent` bundles the
 * portal + scrim and traps focus; Title + Description back the `aria-labelledby`
 * / `aria-describedby` wiring Radix derives, so a `DialogContent` should always
 * contain both. Esc and overlay-click close.
 *
 * Exported individually (not as one object) so each is its own client reference
 * — a single object export from a "use client" module loses deep property access
 * across the RSC server/client boundary. Domain-agnostic.
 */
"use client";

import { Dialog as Primitive } from "radix-ui";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";
import styles from "./Dialog.module.css";

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

export const DialogContent = forwardRef<
  ComponentRef<typeof Primitive.Content>,
  ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Overlay className={styles.overlay} />
    <Primitive.Content ref={ref} className={cn(styles.content, className)} {...props}>
      {children}
    </Primitive.Content>
  </Primitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogTitle = forwardRef<
  ComponentRef<typeof Primitive.Title>,
  ComponentPropsWithoutRef<typeof Primitive.Title>
>(({ className, ...props }, ref) => (
  <Primitive.Title ref={ref} className={cn(styles.title, className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
  ComponentRef<typeof Primitive.Description>,
  ComponentPropsWithoutRef<typeof Primitive.Description>
>(({ className, ...props }, ref) => (
  <Primitive.Description ref={ref} className={cn(styles.description, className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";
