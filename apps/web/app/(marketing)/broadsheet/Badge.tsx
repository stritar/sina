import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./Badge.module.css";

/** The 12 agnostic hues. Names are colors, not meanings — use any for anything. */
export type BadgeColor =
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
 * icon. Purely presentational and non-interactive. The `data-broadsheet` marker
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
