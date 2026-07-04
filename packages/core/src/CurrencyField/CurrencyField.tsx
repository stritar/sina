/**
 * @sina-design-system/core — CurrencyField
 *
 * Formatted numeric input wrapped in `Field`. Display formatting ONLY — groups
 * digits with thousands separators on blur and constrains entry to a decimal
 * numeric value. It holds NO limit / threshold / approval logic; any governance
 * rule lives server-side in the Zod constitution (Phase 3). Domain-agnostic: the
 * currency symbol is a neutral formatting affordance, not a business amount.
 */
"use client";

import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Field } from "../Field/Field.js";
import { cn } from "../utils/cn.js";
import styles from "./CurrencyField.module.css";

/** Strip to digits + a single decimal point. */
function sanitize(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [intPart = "", ...rest] = cleaned.split(".");
  return rest.length ? `${intPart}.${rest.join("")}` : intPart;
}

/** Group the integer part with thousands separators for display. */
function formatGrouped(raw: string): string {
  const value = sanitize(raw);
  if (value === "") return "";
  const [intPart = "", decPart] = value.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
}

/**
 * Input with an optional leading currency symbol. A separate component so Field
 * can `cloneElement` it and inject a11y props, which we forward to the <input>
 * (the adornment wrapper would otherwise swallow them).
 */
const AdornedInput = forwardRef<
  HTMLInputElement,
  { symbol?: string } & InputHTMLAttributes<HTMLInputElement>
>(({ symbol, className, ...inputProps }, ref) => (
  <div className={styles.wrapper}>
    {symbol ? (
      <span aria-hidden className={styles.symbol}>
        {symbol}
      </span>
    ) : null}
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      {...inputProps}
      className={cn(styles.input, symbol ? styles.padSymbol : styles.padPlain, className)}
    />
  </div>
));
AdornedInput.displayName = "CurrencyField.Input";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "value" | "defaultValue" | "onChange"
>;

export interface CurrencyFieldProps extends NativeInputProps {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Leading currency symbol (neutral formatting affordance). */
  currencySymbol?: string;
  /** Initial raw value (uncontrolled). */
  defaultValue?: string | number;
  /** Called with the sanitized numeric string on each edit. */
  onValueChange?: (value: string) => void;
}

export const CurrencyField = forwardRef<HTMLInputElement, CurrencyFieldProps>(
  (
    {
      label,
      description,
      error,
      required,
      currencySymbol = "$",
      defaultValue,
      onValueChange,
      onBlur,
      className,
      ...props
    },
    ref,
  ) => {
    const [display, setDisplay] = useState(() =>
      defaultValue != null ? formatGrouped(String(defaultValue)) : "",
    );

    return (
      <Field label={label} description={description} error={error} required={required}>
        <AdornedInput
          ref={ref}
          symbol={currencySymbol}
          className={className}
          value={display}
          onChange={(event) => {
            const next = sanitize(event.target.value);
            setDisplay(next);
            onValueChange?.(next);
          }}
          onBlur={(event) => {
            setDisplay(formatGrouped(event.target.value));
            onBlur?.(event);
          }}
          {...props}
        />
      </Field>
    );
  },
);

CurrencyField.displayName = "CurrencyField";
