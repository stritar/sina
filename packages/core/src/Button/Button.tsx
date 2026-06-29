/**
 * @sina-design-system/core — Button
 *
 * Action trigger. Native <button> — or any element via `asChild` + Radix Slot —
 * with theme-token variants (primary / secondary / danger / ghost), sizes, and a
 * loading state (spinner + `aria-busy`, disabled while pending). Optional `iconLeft`
 * / `iconRight` slots flank the label; the button sizes the glyphs per `size`. With
 * no label (icon-only) it renders square — pass `aria-label` for an accessible name.
 * Spacing lives on the label (not a flex gap), so it stays even with or without icons.
 * Every variant carries a zero-width, per-variant border as an outlined-button hook:
 * a caller setting `className="border"` gets a correctly-colored outline per variant.
 * Domain-agnostic: labels like "Confirm" / "Approve" are the caller's concern.
 */
"use client";

import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils/cn.js";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md",
    // Zero-width border by default — outlined-button hook; color set per variant.
    "border-0",
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
        primary:
          "border-primary bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "border-border bg-secondary text-secondary-fg hover:bg-secondary-hover active:bg-secondary-hover",
        danger: "border-danger bg-danger text-danger-fg hover:bg-danger/90 active:bg-danger/80",
        // Quiet control: translucent overlay, not a color swap.
        ghost: "border-border text-text hover:bg-hover active:bg-pressed disabled:bg-transparent",
      },
      // Outer padding only — the rest of the horizontal breathing room rides on the
      // label (see labelVariants), so icon↔label spacing matches label-only spacing.
      // Weight scales with size: sm/md read as body text, lg leans in, xl is a hero CTA.
      size: {
        sm: "h-6 px-1 text-ui font-normal",
        md: "h-7 px-1 text-ui font-normal",
        lg: "h-8 px-1.5 text-ui font-medium",
        // Comfortable rung — marketing (apps/web) heroes and touch surfaces.
        xl: "h-10 px-2.5 text-sm font-bold",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

// Label padding replaces the old flex gap: outer (button) + label = the original
// edge padding, so a label-only button keeps its width and the icon↔label gap holds.
const labelVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: { sm: "px-1", md: "px-1.5", lg: "px-1.5", xl: "px-1.5" },
  },
  defaultVariants: { size: "md" },
});

// Glyphs scale with the control so icons stay balanced from sm → xl.
const iconSize = {
  sm: "size-control-2xs",
  md: "size-control-xs",
  lg: "size-control-xs",
  xl: "size-5",
} as const;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (Radix Slot) instead of a <button>. */
  asChild?: boolean;
  /** Show a spinner and disable the button while an action is pending. */
  loading?: boolean;
  /** Icon rendered before the label (replaced by the spinner while loading). */
  iconLeft?: ReactNode;
  /** Icon rendered after the label. */
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      iconLeft,
      iconRight,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : "button";
    const resolvedSize = size ?? "md";
    // inline-flex so the box honors width/height and centers the glyph — a bare
    // <span> is display:inline, which ignores size-* and baseline-aligns the SVG.
    // [&_svg]:size-full sizes the passed glyph to the integer-sized box instead of
    // letting it default to 1em — a 13px icon centered in a 16px box lands on a
    // half-pixel and renders fuzzy; filling the box keeps strokes on whole pixels.
    const glyph = cn(
      iconSize[resolvedSize],
      "inline-flex shrink-0 items-center justify-center [&_svg]:size-full",
    );

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          // Slot takes a single child, so the label wrapper can't apply — fold its
          // padding onto the root to keep asChild geometry identical to a plain button.
          asChild && labelVariants({ size }),
          className,
        )}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <span className={glyph}>
                <CircleNotch aria-hidden weight="fill" className="animate-spin motion-reduce:animate-none" />
              </span>
            ) : (
              iconLeft && <span className={glyph}>{iconLeft}</span>
            )}
            {children != null && children !== false && (
              <span className={labelVariants({ size })}>{children}</span>
            )}
            {iconRight && <span className={glyph}>{iconRight}</span>}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";
