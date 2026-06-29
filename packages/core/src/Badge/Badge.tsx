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
import { cva, type VariantProps } from "class-variance-authority";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { X } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-full border",
  {
    variants: {
      // Subtle tint: tinted bg + 40% intent border + intent text.
      intent: {
        danger: "border-danger/40 bg-danger-bg text-danger",
        success: "border-success/40 bg-success-bg text-success",
        warning: "border-warning/40 bg-warning-bg text-warning",
        info: "border-info/40 bg-info-bg text-info",
        neutral: "border-border bg-surface text-text-muted",
      },
      // Outer padding only — the rest of the horizontal breathing room rides on the
      // label (see labelVariants), so dot/icon↔label spacing matches label-only
      // spacing. Weight scales with size: sm reads as body text, md leans in.
      size: {
        sm: "px-1 py-0.5 text-xs font-normal",
        md: "px-1 py-1 text-ui font-medium",
      },
    },
    defaultVariants: { intent: "neutral", size: "md" },
  },
);

// Label padding replaces the old flex gap: outer (pill) + label = the original edge
// padding (8px sm / 10px md), so a label-only badge keeps its width and the
// icon↔label / label↔close gaps hold even.
const labelVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: { sm: "px-1", md: "px-1.5" },
  },
  defaultVariants: { size: "md" },
});

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {
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
  const resolvedSize = size ?? "md";
  // Glyphs (leading icon + close) scale with the pill so they stay balanced sm → md.
  const glyph = resolvedSize === "sm" ? "size-3" : "size-control-2xs";

  return (
    <span className={cn(badgeVariants({ intent, size }), className)} {...props}>
      {dot ? (
        // Dot rides in an icon-sized, centered container so it lands in the same
        // leading slot as a glyph and stays consistently positioned across both.
        <span aria-hidden className={cn("inline-flex shrink-0 items-center justify-center", glyph)}>
          <span className="size-1.5 rounded-full bg-current" />
        </span>
      ) : Glyph ? (
        <Glyph aria-hidden weight="fill" className={cn("shrink-0", glyph)} />
      ) : null}
      {children != null && children !== false && (
        <span className={labelVariants({ size })}>{children}</span>
      )}
      {onClose && (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className={cn(
            glyph,
            // Inherits the pill's text color (currentColor) so it matches the label
            // exactly; hover adds a faint tint for affordance instead of dimming.
            "inline-flex shrink-0 items-center justify-center rounded-full",
            "transition-colors hover:bg-current/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
          )}
        >
          <X aria-hidden className="size-full" />
        </button>
      )}
    </span>
  );
}
