/**
 * @sina-design-system/core — Button
 *
 * Action trigger. Native <button> — or any element via `asChild` + Radix Slot —
 * with theme-token variants (primary / secondary / danger / ghost), sizes, and a
 * loading state (spinner + `aria-busy`, disabled while pending). Domain-agnostic:
 * labels like "Confirm" / "Approve" are the caller's concern.
 */
"use client";

import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils/cn.js";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium",
    "transition-[background-color,box-shadow,color] duration-fast ease-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
    // Disabled: muted, not blanket-dimmed (states matrix). Ghost overrides bg.
    "disabled:pointer-events-none disabled:bg-secondary disabled:text-text-subtle",
  ),
  {
    variants: {
      variant: {
        // Filled actions darken on press; danger keeps full strength
        // (governance carve-out — never quieted).
        primary: "bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-secondary text-secondary-fg hover:bg-secondary-hover active:bg-secondary-hover",
        danger: "bg-danger text-danger-fg hover:bg-danger/90 active:bg-danger/80",
        // Quiet control: translucent overlay, not a color swap.
        ghost: "text-text hover:bg-hover active:bg-pressed disabled:bg-transparent",
      },
      size: {
        sm: "h-6 gap-1 px-2 text-ui",
        md: "h-7 px-2.5 text-ui",
        lg: "h-8 px-3 text-ui",
        // Comfortable rung — marketing (apps/web) heroes and touch surfaces.
        xl: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (Radix Slot) instead of a <button>. */
  asChild?: boolean;
  /** Show a spinner and disable the button while an action is pending. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : "button";
    // Slot expects a single child, so the spinner is only injected on the native path.
    const showSpinner = loading && !asChild;

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {showSpinner ? (
          <>
            <CircleNotch
              aria-hidden
              className="size-control-xs animate-spin motion-reduce:animate-none"
            />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";
