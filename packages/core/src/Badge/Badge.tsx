/**
 * @sina-design-system/core — Badge
 *
 * Status pill. Role-based inline `<span>` — meaning is carried by text (plus an
 * optional dot or icon), never by color alone, so it stays accessible. Two
 * appearances (subtle tint / solid fill) across neutral + status intents, in two
 * sizes. Domain-agnostic: labels like "Blocked" / "Compliant" are the caller's
 * concern; this primitive only knows neutral intents.
 */
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-full font-medium",
  {
    variants: {
      appearance: { subtle: "border", solid: "" },
      intent: { danger: "", success: "", warning: "", info: "", neutral: "" },
      size: {
        sm: "gap-1 px-2 py-0.5 text-xs",
        md: "gap-1.5 px-2.5 py-1 text-sm",
      },
    },
    compoundVariants: [
      { appearance: "subtle", intent: "danger", class: "border-danger/30 bg-danger-bg text-danger" },
      { appearance: "subtle", intent: "success", class: "border-success/30 bg-success-bg text-success" },
      { appearance: "subtle", intent: "warning", class: "border-warning/30 bg-warning-bg text-warning" },
      { appearance: "subtle", intent: "info", class: "border-info/30 bg-info-bg text-info" },
      { appearance: "subtle", intent: "neutral", class: "border-border bg-surface text-text-muted" },
      { appearance: "solid", intent: "danger", class: "bg-danger text-danger-fg" },
      { appearance: "solid", intent: "success", class: "bg-success text-success-fg" },
      { appearance: "solid", intent: "warning", class: "bg-warning text-warning-fg" },
      { appearance: "solid", intent: "info", class: "bg-info text-info-fg" },
      { appearance: "solid", intent: "neutral", class: "bg-text text-bg" },
    ],
    defaultVariants: { appearance: "subtle", intent: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {
  /** Show a leading status dot (inherits the badge's text color). */
  dot?: boolean;
  /** Leading icon (lucide glyph). Ignored when `dot` is set. */
  icon?: LucideIcon;
  children?: ReactNode;
}

export function Badge({
  appearance,
  intent,
  size,
  dot = false,
  icon: Glyph,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ appearance, intent, size }), className)} {...props}>
      {dot ? (
        <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
      ) : Glyph ? (
        <Glyph aria-hidden className={cn("shrink-0", size === "sm" ? "size-3" : "size-3.5")} />
      ) : null}
      {children}
    </span>
  );
}
