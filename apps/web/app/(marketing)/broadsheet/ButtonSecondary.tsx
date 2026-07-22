import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./Spinner";
import styles from "./ButtonSecondary.module.css";

export type ButtonSize = "sm" | "md" | "lg";
export type ForceState = "hover" | "pressed" | "focus";

export type ButtonSecondaryProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  /** Preview only: force a visual state so the showcase can show it statically. */
  forceState?: ForceState;
  type?: "button" | "submit" | "reset";
};

/**
 * Broadsheet secondary button: a tinted sage pill, sizes sm/md/lg, optional left
 * and right icons. The `data-broadsheet` marker earns the global blue focus
 * outline (see broadsheet.css); this component never authors focus styles.
 */
export function ButtonSecondary({
  size = "md",
  iconLeft,
  iconRight,
  loading = false,
  forceState,
  disabled = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonSecondaryProps) {
  const leftSlot = loading ? <Spinner /> : iconLeft;
  const hasLabel = children != null && children !== "";
  return (
    <button
      {...rest}
      type={type}
      data-broadsheet=""
      data-size={size}
      data-loading={loading || undefined}
      data-force-state={forceState}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(styles.root, className)}
    >
      {leftSlot ? <span className={styles.slot}>{leftSlot}</span> : null}
      {hasLabel ? <span className={styles.label}>{children}</span> : null}
      {iconRight ? <span className={styles.slot}>{iconRight}</span> : null}
    </button>
  );
}
