"use client";

import { useId, type InputHTMLAttributes } from "react";
import { WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "./cn";
import type { ButtonSize, ForceState } from "./ButtonSecondary";
import styles from "./TextField.module.css";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: ButtonSize;
  /** Visible label; renders an associated <label> and is the accessible name. */
  label?: string;
  /** Marks the field invalid: sets aria-invalid, a red border, and shows errorText. */
  invalid?: boolean;
  /** Muted hint shown beneath the field (hidden when invalid && errorText). */
  helperText?: string;
  /** Error message shown beneath the field when invalid; carries the status glyph. */
  errorText?: string;
  /** Preview only: force a visual state so the showcase can show it statically. */
  forceState?: ForceState;
};

/**
 * Broadsheet text field: a native <input> on the shared field surface in sizes
 * sm/md/lg, with an optional label, helper text, and an invalid state whose
 * error message carries the bold WarningOctagon status glyph (never color +
 * text alone). The <input> carries `data-broadsheet`, earning the global blue
 * focus outline; this component never authors focus styles.
 */
export function TextField({
  size = "md",
  label,
  invalid = false,
  helperText,
  errorText,
  forceState,
  disabled = false,
  id,
  className,
  type,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = `${fieldId}-message`;
  const showError = invalid && errorText != null && errorText !== "";
  const showHelper = !showError && helperText != null && helperText !== "";
  const hasMessage = showError || showHelper;
  const describedBy = cn(hasMessage ? messageId : undefined, ariaDescribedBy) || undefined;

  return (
    <div className={cn(styles.root, className)} data-size={size}>
      {label ? (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <input
        {...rest}
        id={fieldId}
        type={type ?? "text"}
        data-broadsheet=""
        data-force-state={forceState}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        className={styles.input}
      />
      {hasMessage ? (
        <span className={styles.message} id={messageId} data-invalid={showError || undefined}>
          {showError ? <WarningOctagon weight="bold" aria-hidden="true" /> : null}
          {showError ? errorText : helperText}
        </span>
      ) : null}
    </div>
  );
}
