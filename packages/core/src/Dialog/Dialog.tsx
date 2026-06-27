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

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

export const DialogContent = forwardRef<
  ComponentRef<typeof Primitive.Content>,
  ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Overlay className="fixed inset-0 z-overlay bg-text/50 transition-opacity duration-fast ease-standard" />
    <Primitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2",
        "flex flex-col gap-4 rounded-lg border border-border bg-surface-raised p-6 shadow-lg",
        "focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </Primitive.Content>
  </Primitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogTitle = forwardRef<
  ComponentRef<typeof Primitive.Title>,
  ComponentPropsWithoutRef<typeof Primitive.Title>
>(({ className, ...props }, ref) => (
  <Primitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-text", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
  ComponentRef<typeof Primitive.Description>,
  ComponentPropsWithoutRef<typeof Primitive.Description>
>(({ className, ...props }, ref) => (
  <Primitive.Description
    ref={ref}
    className={cn("text-sm text-text-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
