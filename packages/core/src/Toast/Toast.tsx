/**
 * @sina-design-system/core — Toast
 *
 * Transient notification on Radix Toast (renders `role="status"`, swipe- and
 * auto-dismiss, stacks in a viewport). Ships as named exports
 * (ToastProvider / ToastViewport / Toast / ToastTitle / ToastDescription /
 * ToastAction / ToastClose) so each is its own client reference across the RSC
 * boundary. In SINA it pairs with audit-event surfacing (Phase 8), but it carries
 * no governance meaning. Domain-agnostic.
 */
"use client";

import { Toast as Primitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";

export const ToastProvider = Primitive.Provider;

export const ToastViewport = forwardRef<
  ComponentRef<typeof Primitive.Viewport>,
  ComponentPropsWithoutRef<typeof Primitive.Viewport>
>(({ className, ...props }, ref) => (
  <Primitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-toast flex w-full max-w-sm flex-col gap-2 p-4 outline-none",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

export const toastVariants = cva(
  cn(
    "relative flex items-start gap-3 rounded-lg border border-border bg-surface-raised p-4 pr-8 shadow-lg",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
  ),
  {
    variants: {
      variant: {
        success: "border-l-4 border-l-success",
        danger: "border-l-4 border-l-danger",
        info: "border-l-4 border-l-info",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

export interface ToastProps
  extends ComponentPropsWithoutRef<typeof Primitive.Root>,
    VariantProps<typeof toastVariants> {}

export const Toast = forwardRef<ComponentRef<typeof Primitive.Root>, ToastProps>(
  ({ className, variant, ...props }, ref) => (
    <Primitive.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
  ),
);
Toast.displayName = "Toast";

export const ToastTitle = forwardRef<
  ComponentRef<typeof Primitive.Title>,
  ComponentPropsWithoutRef<typeof Primitive.Title>
>(({ className, ...props }, ref) => (
  <Primitive.Title ref={ref} className={cn("text-sm font-medium text-text", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = forwardRef<
  ComponentRef<typeof Primitive.Description>,
  ComponentPropsWithoutRef<typeof Primitive.Description>
>(({ className, ...props }, ref) => (
  <Primitive.Description
    ref={ref}
    className={cn("text-sm text-text-muted", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export const ToastAction = forwardRef<
  ComponentRef<typeof Primitive.Action>,
  ComponentPropsWithoutRef<typeof Primitive.Action>
>(({ className, ...props }, ref) => (
  <Primitive.Action
    ref={ref}
    className={cn(
      "mt-1 inline-flex text-sm font-medium text-primary",
      "transition-colors duration-fast ease-standard hover:text-primary-hover",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export const ToastClose = forwardRef<
  ComponentRef<typeof Primitive.Close>,
  ComponentPropsWithoutRef<typeof Primitive.Close>
>(({ className, "aria-label": ariaLabel = "Dismiss", ...props }, ref) => (
  <Primitive.Close
    ref={ref}
    aria-label={ariaLabel}
    className={cn(
      "absolute right-2 top-2 flex size-6 items-center justify-center rounded-md text-text-muted",
      "transition-colors duration-fast ease-standard hover:text-text",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
      className,
    )}
    {...props}
  >
    <X aria-hidden className="size-4" />
  </Primitive.Close>
));
ToastClose.displayName = "ToastClose";
