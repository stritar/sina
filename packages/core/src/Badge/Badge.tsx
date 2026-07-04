/**
 * @sina-design-system/core — Badge
 *
 * Status pill. Role-based inline `<span>` — meaning is carried by text (plus an
 * optional dot or icon), never by color alone, so it stays accessible. A subtle
 * tint across neutral + status intents, in two sizes. Spacing rides on the label
 * (not a flex gap), mirroring Button: outer
 * padding on the pill + horizontal padding on the label, so a leading dot/icon and
 * a trailing dismiss button sit flush and stay evenly spaced with or without a label.
 * Domain-agnostic: labels like "Blocked" / "Compliant" are the caller's concern.
 */
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { X } from "@phosphor-icons/react/dist/ssr";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn.js";
import styles from "./Badge.module.css";

type BadgeIntent = "danger" | "success" | "warning" | "info" | "neutral";
type BadgeSize = "sm" | "md";

// Subtle tint: tinted bg + 40% intent border + intent text.
// (CSS Module class access is `string | undefined` under noUncheckedIndexedAccess.)
const intentClass: Record<BadgeIntent, string | undefined> = {
  danger: styles.danger,
  success: styles.success,
  warning: styles.warning,
  info: styles.info,
  neutral: styles.neutral,
};

// Outer padding only — the rest of the horizontal breathing room rides on the
// label (see labelPadClass), so dot/icon↔label spacing matches label-only spacing.
const sizeClass: Record<BadgeSize, string | undefined> = {
  sm: styles.sm,
  md: styles.md,
};

// Label padding replaces the old flex gap: outer (pill) + label = the original edge
// padding (8px sm / 10px md), so a label-only badge keeps its width and the
// icon↔label / label↔close gaps hold even.
const labelPadClass: Record<BadgeSize, string | undefined> = {
  sm: styles.labelSm,
  md: styles.labelMd,
};

// Glyphs (leading icon + close) scale with the pill so they stay balanced sm → md.
const glyphSizeClass: Record<BadgeSize, string | undefined> = {
  sm: styles.glyphSm,
  md: styles.glyphMd,
};

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Subtle tint across neutral + status intents. */
  intent?: BadgeIntent;
  /** Two sizes: sm reads as body text, md leans in. */
  size?: BadgeSize;
  /** Show a leading status dot (inherits the badge's text color). */
  dot?: boolean;
  /** Leading icon (Phosphor glyph). Ignored when `dot` is set. */
  icon?: PhosphorIcon;
  /** Render a trailing dismiss button; invoked when it is activated. */
  onClose?: () => void;
  /** Accessible name for the dismiss button. */
  closeLabel?: string;
  children?: ReactNode;
}

export function Badge({
  intent,
  size,
  dot = false,
  icon: Glyph,
  onClose,
  closeLabel = "Dismiss",
  className,
  children,
  ...props
}: BadgeProps) {
  const resolvedIntent = intent ?? "neutral";
  const resolvedSize = size ?? "md";
  // Glyphs (leading icon + close) scale with the pill so they stay balanced sm → md.
  const glyph = glyphSizeClass[resolvedSize];

  return (
    <span
      className={cn(styles.root, intentClass[resolvedIntent], sizeClass[resolvedSize], className)}
      {...props}
    >
      {dot ? (
        // Dot rides in an icon-sized, centered container so it lands in the same
        // leading slot as a glyph and stays consistently positioned across both.
        <span aria-hidden className={cn(styles.slot, glyph)}>
          <span className={styles.dot} />
        </span>
      ) : Glyph ? (
        <Glyph aria-hidden weight="fill" className={cn(styles.icon, glyph)} />
      ) : null}
      {children != null && children !== false && (
        <span className={cn(styles.label, labelPadClass[resolvedSize])}>{children}</span>
      )}
      {onClose && (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          // Inherits the pill's text color (currentColor) so it matches the label
          // exactly; hover adds a faint tint for affordance instead of dimming.
          className={cn(styles.close, glyph)}
        >
          <X aria-hidden weight="bold" className={styles.closeIcon} />
        </button>
      )}
    </span>
  );
}
