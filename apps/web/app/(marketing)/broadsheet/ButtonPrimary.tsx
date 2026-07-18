import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./Spinner";
import type { ButtonSize, ForceState } from "./ButtonSecondary";
import styles from "./ButtonPrimary.module.css";

export type ButtonPrimaryProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  /** Preview only: force a visual state so the showcase can show it statically. */
  forceState?: ForceState;
  type?: "button" | "submit" | "reset";
};

/**
 * Broadsheet primary button: a solid evergreen pill with light ink, the confident
 * default action. Sizes sm/md/lg, optional left and right icons. The
 * `data-broadsheet` marker earns the global blue focus outline (see
 * broadsheet.css); this component never authors focus styles.
 */
export function ButtonPrimary({
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
}: ButtonPrimaryProps) {
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
