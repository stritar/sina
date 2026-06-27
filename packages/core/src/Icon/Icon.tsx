/**
 * @sina-design-system/core — Icon
 *
 * Accessibly-labeled glyph. Wraps a lucide-react icon: pass `label` for a
 * meaningful icon (announced via Radix AccessibleIcon) or `decorative` for one
 * that is purely visual (hidden from assistive tech). Color follows
 * `currentColor`, so theme `text-*` tokens drive it — no hardcoded color. The
 * lucide dependency stays behind this wrapper, keeping it swappable.
 * Domain-agnostic.
 */
import { AccessibleIcon } from "radix-ui";
import type { LucideIcon } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface IconProps {
  /** The lucide glyph component to render. */
  icon: LucideIcon;
  /** Accessible name. Omit (or set `decorative`) for a purely visual icon. */
  label?: string;
  /** Mark the icon as decorative — hidden from assistive tech. */
  decorative?: boolean;
  /** Square size in pixels. Defaults to 16 (theme `size--xs`). */
  size?: number;
  className?: string;
}

export function Icon({ icon: Glyph, label, decorative, size = 16, className }: IconProps) {
  const glyph = (
    <Glyph aria-hidden width={size} height={size} className={cn("shrink-0", className)} />
  );

  if (decorative || !label) return glyph;

  return <AccessibleIcon.Root label={label}>{glyph}</AccessibleIcon.Root>;
}
