"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./SegmentSelector.module.css";

export type SegmentItem = {
  /** Stable value emitted on selection. */
  value: string;
  /** Visible text label — also the segment's accessible name. */
  label: string;
  /** Optional left icon: a Phosphor node from the caller, never bundled here. */
  icon?: ReactNode;
};

export type SegmentSelectorProps = {
  items: readonly SegmentItem[];
  /** Controlled selected value. Omit for the uncontrolled mode. */
  value?: string;
  /** Uncontrolled initial value; defaults to the first item. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ButtonSize;
  /** Accessible name for the group (there is no visible group label). */
  "aria-label": string;
  className?: string;
};

/**
 * Broadsheet segment selector: a generic segmented `radiogroup` on the same sage
 * secondary-button track as the theme switcher, with the chosen segment shown as
 * a raised surface chip. Unlike ThemeSwitcher (icon-only, localStorage-bound),
 * this is a generic control — text labels with an optional left icon, sizes
 * sm/md/lg, and controlled or uncontrolled selection. Each segment `<button>`
 * carries `data-broadsheet`, which earns the global blue focus outline; this
 * component never authors focus styles.
 */
export function SegmentSelector({
  items,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  "aria-label": ariaLabel,
  className,
}: SegmentSelectorProps) {
  const [internal, setInternal] = useState<string | undefined>(
    defaultValue ?? items[0]?.value,
  );
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Controlled when `value` is supplied; otherwise track our own state.
  const selected = value ?? internal;

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  // Arrow keys move within the group and select as they go (native radiogroup UX).
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (delta === 0 || items.length === 0) return;
    event.preventDefault();
    const nextIndex = (index + delta + items.length) % items.length;
    const next = items[nextIndex]!;
    select(next.value);
    refs.current[nextIndex]?.focus();
  }

  // The active index drives roving tabindex; if nothing matches, the first
  // segment is the tab stop.
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.value === selected),
  );

  return (
    <div
      className={cn(styles.root, className)}
      role="radiogroup"
      aria-label={ariaLabel}
      data-size={size}
    >
      {items.map((item, index) => {
        const checked = item.value === selected;
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            data-broadsheet=""
            aria-checked={checked}
            tabIndex={index === activeIndex ? 0 : -1}
            className={styles.segment}
            data-active={checked || undefined}
            onClick={() => select(item.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.icon ? (
              <span className={styles.slot} aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
