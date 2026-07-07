/**
 * @sina-design-system/core — Button
 *
 * Action trigger. Native <button> — or any element via `asChild` + Radix Slot —
 * with theme-token variants (primary / secondary / danger / ghost), sizes, and a
 * loading state (spinner + `aria-busy`, disabled while pending). Optional `iconLeft`
 * / `iconRight` slots flank the label; the button sizes the glyphs per `size`. With
 * no label (icon-only) it renders square — pass `aria-label` for an accessible name.
 * Spacing lives on the label (not a flex gap), so it stays even with or without icons.
 * The vivid fills (primary / danger) carry a present-but-invisible 1px placeholder
 * border (the Badge/Alert pattern): a themer reveals it by raising the alpha on
 * `--sina-color-button-border--{primary,danger}`, with no layout shift. Secondary /
 * ghost keep a zero-width fill-contrast border as a latent outlined-button hook.
 * Domain-agnostic: labels like "Confirm" / "Approve" are the caller's concern.
 */
"use client";

import { Slot } from "radix-ui";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils/cn.js";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";

// Glyph box scales with the control so icons stay balanced sm → xl.
// (CSS Module class access is `string | undefined` under noUncheckedIndexedAccess.)
const glyphSize: Record<ButtonSize, string | undefined> = {
  sm: styles.glyphSm,
  md: styles.glyphMd,
  lg: styles.glyphMd,
  xl: styles.glyphXl,
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
      variant = "primary",
      size = "md",
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
    // Outer (button) + label = original edge padding; sm is tighter.
    const labelPad = size === "sm" ? styles.labelPadSm : styles.labelPad;
    const glyph = cn(styles.glyph, glyphSize[size]);

    return (
      <Comp
        ref={ref}
        className={cn(
          styles.root,
          styles[variant],
          styles[size],
          // Slot takes a single child, so the label wrapper can't apply — fold its
          // padding onto the root to keep asChild geometry identical to a button.
          asChild && labelPad,
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
                <CircleNotch aria-hidden weight="bold" className={styles.spinner} />
              </span>
            ) : (
              iconLeft && <span className={glyph}>{iconLeft}</span>
            )}
            {children != null && children !== false && (
              <span className={cn(styles.label, labelPad)}>{children}</span>
            )}
            {iconRight && <span className={glyph}>{iconRight}</span>}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";
