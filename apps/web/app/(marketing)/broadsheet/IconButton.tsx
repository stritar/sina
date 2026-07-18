import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./Spinner";
import type { ButtonSize, ForceState } from "./ButtonSecondary";
import styles from "./IconButton.module.css";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
  size?: ButtonSize;
  /** The glyph to render (a Phosphor icon node). */
  icon: ReactNode;
  /** Required accessible name — an icon-only button has no visible text. */
  label: string;
  loading?: boolean;
  forceState?: ForceState;
  type?: "button" | "submit" | "reset";
};

/**
 * Icon-only Broadsheet secondary button: a square tinted pill in sizes sm/md/lg.
 * `label` is required so the control always has an accessible name. Shares the
 * secondary fill, states, transition, and the global blue focus outline.
 */
export function IconButton({
  size = "md",
  icon,
  label,
  loading = false,
  forceState,
  disabled = false,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      data-broadsheet=""
      data-size={size}
      data-loading={loading || undefined}
      data-force-state={forceState}
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(styles.root, className)}
    >
      <span className={styles.slot}>{loading ? <Spinner /> : icon}</span>
    </button>
  );
}
