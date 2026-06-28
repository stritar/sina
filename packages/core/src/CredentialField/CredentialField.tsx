/**
 * @sina-design-system/core — CredentialField
 *
 * Masked secondary-approval secret. Two forms, both domain-neutral (CAC / PIN
 * specifics stay in `defense`):
 *   - `CredentialField` — `type=password` in `Field`, with a leading lock and a
 *     trailing show/hide toggle.
 *   - `CredentialOTP` — a segmented one-time-code input (per-digit boxes,
 *     auto-advance, paste distribution, arrow-key nav).
 * Presentational only — NO validation; the authoritative check is server-side
 * (the Zod constitution, Phase 3).
 */
"use client";

import { Eye, EyeSlash, Lock } from "@phosphor-icons/react/dist/ssr";
import {
  forwardRef,
  useRef,
  useState,
  type ClipboardEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Field } from "../Field/Field.js";
import { cn } from "../utils/cn.js";

/* -------------------------------------------------------------------------- */
/*  CredentialField — masked input + reveal toggle                            */
/* -------------------------------------------------------------------------- */

/**
 * The bare masked control. A separate forwardRef component so `Field` can
 * `cloneElement` it and inject `id` / `aria-describedby` / `aria-invalid`, which
 * we forward onto the real <input>.
 */
const SecretInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, disabled, ...inputProps }, ref) => {
    const [revealed, setRevealed] = useState(false);
    return (
      <div className="relative">
        <Lock
          aria-hidden
          weight="fill"
          className="pointer-events-none absolute inset-y-0 left-2.5 my-auto size-control-2xs text-text-muted"
        />
        <input
          ref={ref}
          type={revealed ? "text" : "password"}
          disabled={disabled}
          {...inputProps}
          className={cn(
            "h-7 w-full rounded-md border border-subtle bg-surface pl-7 pr-8 text-ui text-text",
            "placeholder:text-text-subtle transition-colors duration-fast ease-standard",
            "focus-visible:outline-none focus-visible:border-focus-ring focus-visible:ring-1 focus-visible:ring-focus-ring",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-subtle",
            "aria-[invalid=true]:border-danger",
            className,
          )}
        />
        <button
          type="button"
          tabIndex={disabled ? -1 : 0}
          disabled={disabled}
          aria-pressed={revealed}
          aria-label={revealed ? "Hide code" : "Show code"}
          onClick={() => setRevealed((v) => !v)}
          className={cn(
            "absolute inset-y-0 right-1.5 my-auto flex size-6 items-center justify-center rounded-sm text-text-muted",
            "transition-colors duration-fast ease-standard hover:bg-hover hover:text-text",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {revealed ? (
            <EyeSlash aria-hidden weight="fill" className="size-control-2xs" />
          ) : (
            <Eye aria-hidden weight="fill" className="size-control-2xs" />
          )}
        </button>
      </div>
    );
  },
);
SecretInput.displayName = "CredentialField.Input";

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export interface CredentialFieldProps extends NativeInputProps {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
}

export const CredentialField = forwardRef<HTMLInputElement, CredentialFieldProps>(
  ({ label, description, error, required, ...props }, ref) => (
    <Field label={label} description={description} error={error} required={required}>
      <SecretInput ref={ref} {...props} />
    </Field>
  ),
);
CredentialField.displayName = "CredentialField";

/* -------------------------------------------------------------------------- */
/*  CredentialOTP — segmented one-time code                                   */
/* -------------------------------------------------------------------------- */

export interface CredentialOTPProps {
  /** Number of digit boxes. */
  length?: number;
  /** Controlled value (the joined code). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Marks every box invalid (e.g. wrong code). */
  invalid?: boolean;
  /** Accessible label for the whole group. */
  "aria-label"?: string;
  className?: string;
}

export function CredentialOTP({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  disabled = false,
  invalid = false,
  "aria-label": ariaLabel = "One-time code",
  className,
}: CredentialOTPProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => defaultValue.replace(/\D/g, "").slice(0, length));
  const current = (isControlled ? (value ?? "") : internal).replace(/\D/g, "").slice(0, length);
  const chars = Array.from({ length }, (_, i) => current[i] ?? "");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    if (!isControlled) setInternal(clean);
    onChange?.(clean);
  };

  const focusBox = (i: number) => {
    const target = refs.current[Math.max(0, Math.min(length - 1, i))];
    target?.focus();
    target?.select();
  };

  const handleInput = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const arr = chars.slice();
    if (!digits) {
      arr[i] = "";
      commit(arr.join(""));
      return;
    }
    let pos = i;
    for (const ch of digits) {
      if (pos >= length) break;
      arr[pos] = ch;
      pos += 1;
    }
    commit(arr.join(""));
    focusBox(pos);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (chars[i]) {
        const arr = chars.slice();
        arr[i] = "";
        commit(arr.join(""));
      } else if (i > 0) {
        e.preventDefault();
        const arr = chars.slice();
        arr[i - 1] = "";
        commit(arr.join(""));
        focusBox(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(i + 1);
    }
  };

  const handlePaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleInput(i, e.clipboardData.getData("text"));
  };

  return (
    <div role="group" aria-label={ariaLabel} className={cn("flex gap-1.5", className)}>
      {chars.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          value={ch}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-10 rounded-md border border-subtle bg-surface text-center text-base font-medium text-text",
            "transition-colors duration-fast ease-standard",
            "focus-visible:outline-none focus-visible:border-focus-ring focus-visible:ring-1 focus-visible:ring-focus-ring",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-subtle",
            "aria-[invalid=true]:border-danger",
          )}
        />
      ))}
    </div>
  );
}
