import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./Badge.module.css";

/** The 12 agnostic hues. Names are colors, not meanings — use any for anything. */
export type BadgeHue =
  | "gray"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "green"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "violet"
  | "pink";

/**
 * The gate verdict palette: the one set of badge colors that MEANS something.
 *
 * Unlike the hues above it is not free for reuse. `GateCard` owns it, the
 * industry tint moves its fills so a verdict chip belongs to whichever page it
 * sits on, and it is authored `solid` only. See the block comment beside
 * `--sinamk-color-gate-*` in broadsheet.css.
 */
export type GateColor = "gate-pass" | "gate-escalate" | "gate-reject" | "gate-flag";

export type BadgeColor = BadgeHue | GateColor;

/** `solid` = bright fill; `soft` = pale tint + saturated ink (inverts in dark). */
export type BadgeVariant = "solid" | "soft";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "color"> & {
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: ButtonSize;
  /** Optional leading icon: a Phosphor node from the caller, never bundled here. */
  icon?: ReactNode;
};

/**
 * Broadsheet badge: a vibrant pill label in one of 12 agnostic hues, in a bright
 * `solid` or a tinted `soft` variant, sizes sm/md/lg, with an optional leading
 * icon. `color` also accepts the four `gate-*` verdict colors, which are
 * meaningful and industry-tinted and belong to `GateCard`; they are authored
 * `solid` only, so pairing one with `soft` falls back to the base blue.
 * Purely presentational and non-interactive. The `data-broadsheet` marker
 * earns the global blue focus outline (see broadsheet.css); this component never
 * authors focus styles.
 */
export function Badge({
  color = "blue",
  variant = "solid",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  const hasLabel = children != null && children !== "";
  return (
    <span
      {...rest}
      data-broadsheet=""
      data-color={color}
      data-variant={variant}
      data-size={size}
      className={cn(styles.root, className)}
    >
      {icon ? (
        <span className={styles.slot} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {hasLabel ? <span className={styles.label}>{children}</span> : null}
    </span>
  );
}
