/**
 * @sina-design-system/core — TextField
 *
 * Single-line (or `multiline`) text input wrapped in `Field`, so label /
 * description / error and the `aria-describedby` / `aria-invalid` wiring come for
 * free. Same control chrome as `CurrencyField`. Presentational only — NO
 * validation logic (that gate is server-side per ROADMAP §1b). Domain-agnostic.
 */
"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { Field } from "../Field/Field.js";
import { cn } from "../utils/cn.js";

// Attached focus: the border brightens + a faint 1px ring, instead of a
// detached 2px offset halo — reads as "anchored", not floating.
const CONTROL = cn(
  "w-full rounded-md border border-border-subtle bg-surface text-ui text-text",
  "placeholder:text-text-subtle transition-colors duration-fast ease-standard",
  "focus-visible:outline-none focus-visible:border-focus-ring focus-visible:ring-1 focus-visible:ring-focus-ring",
  "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-subtle",
  "aria-[invalid=true]:border-danger",
);

/**
 * The bare control. A separate forwardRef component so `Field` can `cloneElement`
 * it and inject `id` / `aria-describedby` / `aria-invalid`, which land on the
 * real input/textarea.
 */
type ControlProps =
  | ({ multiline?: false } & InputHTMLAttributes<HTMLInputElement>)
  | ({ multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>);

const TextControl = forwardRef<HTMLInputElement | HTMLTextAreaElement, ControlProps>(
  (props, ref) => {
    if (props.multiline) {
      const { multiline: _m, className, rows = 4, ...rest } = props;
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          rows={rows}
          className={cn(CONTROL, "min-h-16 resize-y px-2.5 py-1.5", className)}
          {...rest}
        />
      );
    }
    const { multiline: _m, className, ...rest } = props;
    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        type="text"
        className={cn(CONTROL, "h-7 px-2.5", className)}
        {...rest}
      />
    );
  },
);
TextControl.displayName = "TextField.Control";

type FieldShellProps = {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
};

export type TextFieldProps = FieldShellProps & ControlProps;

export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  ({ label, description, error, required, ...control }, ref) => (
    <Field label={label} description={description} error={error} required={required}>
      <TextControl ref={ref} {...control} />
    </Field>
  ),
);

TextField.displayName = "TextField";
