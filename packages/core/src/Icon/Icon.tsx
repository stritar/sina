/**
 * @sina-design-system/core — Icon
 *
 * Accessibly-labeled glyph. Wraps a Phosphor icon: pass `label` for a
 * meaningful icon (announced via Radix AccessibleIcon) or `decorative` for one
 * that is purely visual (hidden from assistive tech). Color follows
 * `currentColor`, so theme `text-*` tokens drive it — no hardcoded color.
 *
 * `weight` is the Phosphor affordance: `fill` by default (our house style), with
 * `bold` reserved for directional/action glyphs (carets, arrows, plus/minus,
 * check, close, chevrons, expand/collapse, external-link, clockwise, up/down,
 * play/pause). The Phosphor dependency stays behind this wrapper, keeping it
 * swappable. Domain-agnostic.
 */
import { AccessibleIcon } from "radix-ui";
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react";
import { cn } from "../utils/cn.js";
import styles from "./Icon.module.css";

export interface IconProps {
  /** The Phosphor glyph component to render. */
  icon: PhosphorIcon;
  /** Accessible name. Omit (or set `decorative`) for a purely visual icon. */
  label?: string;
  /** Mark the icon as decorative — hidden from assistive tech. */
  decorative?: boolean;
  /** Square size in pixels. Defaults to 16 (theme `size--xs`). */
  size?: number;
  /** Phosphor weight — defaults to `fill`; pass `bold` for directional/action glyphs. */
  weight?: IconWeight;
  className?: string;
}

export function Icon({
  icon: Glyph,
  label,
  decorative,
  size = 16,
  weight = "fill",
  className,
}: IconProps) {
  const glyph = (
    <Glyph aria-hidden size={size} weight={weight} className={cn(styles.root, className)} />
  );

  if (decorative || !label) return glyph;

  return <AccessibleIcon.Root label={label}>{glyph}</AccessibleIcon.Root>;
}
