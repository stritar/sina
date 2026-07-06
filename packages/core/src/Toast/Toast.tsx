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
import { X, Info, CheckCircle, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";
import styles from "./Toast.module.css";

export const ToastProvider = Primitive.Provider;

export const ToastViewport = forwardRef<
  ComponentRef<typeof Primitive.Viewport>,
  ComponentPropsWithoutRef<typeof Primitive.Viewport>
>(({ className, ...props }, ref) => (
  <Primitive.Viewport ref={ref} className={cn(styles.viewport, className)} {...props} />
));
ToastViewport.displayName = "ToastViewport";

type ToastVariant = "success" | "danger" | "info";

// Intent variant → its vivid-fill background class. (CSS Module class access is
// `string | undefined` under noUncheckedIndexedAccess.)
const variantClass: Record<ToastVariant, string | undefined> = {
  success: styles.success,
  danger: styles.danger,
  info: styles.info,
};

/** Leading intent glyph per variant (mirrors Alert). Ink is shared black. */
const TOAST_ICONS: Record<ToastVariant, PhosphorIcon> = {
  info: Info,
  success: CheckCircle,
  danger: WarningOctagon,
};

export interface ToastProps extends ComponentPropsWithoutRef<typeof Primitive.Root> {
  /** Intent — colors the left rule and default icon. */
  variant?: ToastVariant;
  /** Override the default intent icon, or pass `false` to omit it. */
  icon?: PhosphorIcon | false;
}

export const Toast = forwardRef<ComponentRef<typeof Primitive.Root>, ToastProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    const defaultIcon = TOAST_ICONS[variant ?? "info"];
    const Glyph = icon === false ? null : (icon ?? defaultIcon);
    return (
      <Primitive.Root
        ref={ref}
        className={cn(styles.toast, variantClass[variant ?? "info"], className)}
        {...props}
      >
        {Glyph ? <Glyph aria-hidden weight="bold" className={styles.icon} /> : null}
        <div className={styles.body}>{children}</div>
      </Primitive.Root>
    );
  },
);
Toast.displayName = "Toast";

export const ToastTitle = forwardRef<
  ComponentRef<typeof Primitive.Title>,
  ComponentPropsWithoutRef<typeof Primitive.Title>
>(({ className, ...props }, ref) => (
  <Primitive.Title ref={ref} className={cn(styles.title, className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = forwardRef<
  ComponentRef<typeof Primitive.Description>,
  ComponentPropsWithoutRef<typeof Primitive.Description>
>(({ className, ...props }, ref) => (
  <Primitive.Description ref={ref} className={cn(styles.description, className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

export const ToastAction = forwardRef<
  ComponentRef<typeof Primitive.Action>,
  ComponentPropsWithoutRef<typeof Primitive.Action>
>(({ className, ...props }, ref) => (
  <Primitive.Action ref={ref} className={cn(styles.action, className)} {...props} />
));
ToastAction.displayName = "ToastAction";

export const ToastClose = forwardRef<
  ComponentRef<typeof Primitive.Close>,
  ComponentPropsWithoutRef<typeof Primitive.Close>
>(({ className, "aria-label": ariaLabel = "Dismiss", ...props }, ref) => (
  <Primitive.Close
    ref={ref}
    aria-label={ariaLabel}
    className={cn(styles.close, className)}
    {...props}
  >
    <X aria-hidden weight="bold" className={styles.closeIcon} />
  </Primitive.Close>
));
ToastClose.displayName = "ToastClose";
