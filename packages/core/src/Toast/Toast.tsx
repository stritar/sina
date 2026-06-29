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
import { X, Info, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
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
      "fixed bottom-0 right-0 z-toast flex w-full max-w-[360px] flex-col gap-2 p-4 outline-none",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

export const toastVariants = cva(
  cn(
    "relative flex items-start gap-2.5 rounded-md border border-border-subtle bg-surface-raised p-3 pr-7 shadow-md",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
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

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>;

/** Leading intent glyph + color per variant (mirrors Alert). */
const TOAST_ICONS: Record<ToastVariant, { icon: PhosphorIcon; color: string }> = {
  info: { icon: Info, color: "text-info" },
  success: { icon: CheckCircle, color: "text-success" },
  danger: { icon: WarningCircle, color: "text-danger" },
};

export interface ToastProps
  extends ComponentPropsWithoutRef<typeof Primitive.Root>,
    VariantProps<typeof toastVariants> {
  /** Override the default intent icon, or pass `false` to omit it. */
  icon?: PhosphorIcon | false;
}

export const Toast = forwardRef<ComponentRef<typeof Primitive.Root>, ToastProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    const { icon: defaultIcon, color } = TOAST_ICONS[variant ?? "info"];
    const Glyph = icon === false ? null : (icon ?? defaultIcon);
    return (
      <Primitive.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
        {Glyph ? <Glyph aria-hidden weight="fill" className={cn("size-5 shrink-0", color)} /> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</div>
      </Primitive.Root>
    );
  },
);
Toast.displayName = "Toast";

export const ToastTitle = forwardRef<
  ComponentRef<typeof Primitive.Title>,
  ComponentPropsWithoutRef<typeof Primitive.Title>
>(({ className, ...props }, ref) => (
  <Primitive.Title ref={ref} className={cn("text-ui font-medium text-text", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = forwardRef<
  ComponentRef<typeof Primitive.Description>,
  ComponentPropsWithoutRef<typeof Primitive.Description>
>(({ className, ...props }, ref) => (
  <Primitive.Description
    ref={ref}
    className={cn("text-ui text-text-muted", className)}
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
      "-ml-1.5 inline-flex w-fit items-center rounded-sm px-1.5 py-0.5 text-ui font-medium text-text",
      "transition-colors duration-fast ease-standard hover:bg-hover",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
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
      "absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-sm text-text-muted",
      "transition-colors duration-fast ease-standard hover:bg-hover hover:text-text",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
      className,
    )}
    {...props}
  >
    <X aria-hidden weight="bold" className="size-control-2xs" />
  </Primitive.Close>
));
ToastClose.displayName = "ToastClose";
