/**
 * @sina-design-system/core — Field
 *
 * Accessible form-control wrapper: label + optional description + optional error.
 * Clones its control child to wire `id` / `aria-describedby` / `aria-invalid`, so
 * every input is screen-reader-correct from one seam. Takes an element child
 * (not a render-prop function) so it can be mounted from a Server Component — the
 * RSC boundary forbids passing functions to client components.
 *
 * Presentational only — NO validation logic. Per ROADMAP §1b, client-side checks
 * are untrusted UX sugar; the authoritative gate is server-side (the Zod
 * constitution, Phase 3). Field merely *displays* an `error` passed to it.
 * Domain-agnostic.
 */
"use client";

import { Label } from "radix-ui";
import { cloneElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn.js";

/** A11y props Field injects onto its control child. Forward them to the <input>. */
export interface FieldControlProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export interface FieldProps {
  /** Visible label, associated with the control. */
  label: ReactNode;
  /** Optional helper text rendered below the label. */
  description?: ReactNode;
  /** Error message. When present, the control is marked invalid and announced. */
  error?: ReactNode;
  /** Append a visual required marker to the label. */
  required?: boolean;
  className?: string;
  /** The control element. Receives `id` / `aria-describedby` / `aria-invalid`. */
  children: ReactElement<FieldControlProps>;
}

export function Field({ label, description, error, required, className, children }: FieldProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const invalid = error != null && error !== false;

  const describedBy =
    [description ? descriptionId : null, invalid ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const control = cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": invalid || undefined,
  });

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label.Root htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required ? (
          <span aria-hidden className="text-danger">
            {" *"}
          </span>
        ) : null}
      </Label.Root>

      {description ? (
        <p id={descriptionId} className="text-sm text-text-muted">
          {description}
        </p>
      ) : null}

      {control}

      {invalid ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
