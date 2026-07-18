"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { CaretDown, Check } from "@phosphor-icons/react/dist/ssr";
import { cn } from "./cn";
import type { ButtonSize, ForceState } from "./ButtonSecondary";
import styles from "./Select.module.css";

export type SelectOption = {
  /** Stable value emitted on selection. */
  value: string;
  /** Visible text label — also the option's accessible name. */
  label: string;
  /** Optional left icon: a Phosphor node from the caller, never bundled here. */
  icon?: ReactNode;
};

export type SelectProps = {
  options: readonly SelectOption[];
  /** Controlled selected value. Omit for the uncontrolled mode. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ButtonSize;
  /** Visible label; renders a <span> and names the trigger + listbox. */
  label?: string;
  /** Accessible name when there is no visible label. */
  "aria-label"?: string;
  /** Red trigger border; the trigger is a button, so this is styling only. */
  invalid?: boolean;
  placeholder?: string;
  /** Uncontrolled initial open — the showcase uses it to preview the open list. */
  defaultOpen?: boolean;
  /** Preview only: force a visual state so the showcase can show it statically. */
  forceState?: ForceState;
  disabled?: boolean;
  className?: string;
};

/**
 * Broadsheet select: a custom listbox popover on the shared field surface. The
 * trigger carries `data-broadsheet` (earning the global blue focus outline);
 * the open list uses ARIA virtual focus (`aria-activedescendant`), so options
 * are not individually focusable and the highlighted row is the focus cue. This
 * component never authors focus styles.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  label,
  "aria-label": ariaLabel,
  invalid = false,
  placeholder = "Select…",
  defaultOpen = false,
  forceState,
  disabled = false,
  className,
}: SelectProps) {
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const [open, setOpen] = useState<boolean>(defaultOpen && !disabled);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const typeahead = useRef<{ query: string; at: number }>({ query: "", at: 0 });

  const baseId = useId();
  const labelId = `${baseId}-label`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  // Controlled when `value` is supplied; otherwise track our own state.
  const selected = value ?? internal;
  const selectedIndex = options.findIndex((opt) => opt.value === selected);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const last = options.length - 1;
  const safeActive = Math.min(Math.max(activeIndex, 0), Math.max(last, 0));

  // Focus the listbox on open; return focus to the trigger on close.
  useEffect(() => {
    if (open) listboxRef.current?.focus();
  }, [open]);

  // Keep the highlighted option in view as it moves (scrollIntoView is absent
  // in jsdom, so guard the method itself, not just the node).
  useEffect(() => {
    if (open) optionRefs.current[safeActive]?.scrollIntoView?.({ block: "nearest" });
  }, [open, safeActive]);

  // Close on a click outside the whole control.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openMenu(active: number) {
    setActiveIndex(Math.min(Math.max(active, 0), Math.max(last, 0)));
    setOpen(true);
  }

  function closeMenu(refocus: boolean) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function commit(index: number) {
    const opt = options[index];
    if (opt) {
      if (value === undefined) setInternal(opt.value);
      onValueChange?.(opt.value);
    }
    closeMenu(true);
  }

  function toggle() {
    if (disabled) return;
    if (open) closeMenu(true);
    else openMenu(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(selectedIndex >= 0 ? selectedIndex : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(selectedIndex >= 0 ? selectedIndex : last);
    }
    // Enter / Space fall through to the native button click → toggle().
  }

  function onListboxKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(safeActive);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu(true);
        break;
      case "Tab":
        // Let focus leave naturally (native-select feel); the list closes.
        setOpen(false);
        break;
      default: {
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const now = Date.now();
          const query =
            (now - typeahead.current.at > 500 ? "" : typeahead.current.query) +
            event.key.toLowerCase();
          typeahead.current = { query, at: now };
          const idx = options.findIndex((opt) => opt.label.toLowerCase().startsWith(query));
          if (idx >= 0) setActiveIndex(idx);
        }
      }
    }
  }

  function onRootBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (rootRef.current && !rootRef.current.contains(event.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, className)}
      data-size={size}
      onBlur={onRootBlur}
    >
      {label ? (
        <span className={styles.fieldLabel} id={labelId}>
          {label}
        </span>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        data-broadsheet=""
        data-size={size}
        data-force-state={forceState}
        data-invalid={invalid || undefined}
        disabled={disabled}
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
      >
        {selectedOption ? (
          <span className={styles.value}>
            {selectedOption.icon ? (
              <span className={styles.slot} aria-hidden="true">
                {selectedOption.icon}
              </span>
            ) : null}
            <span className={styles.label}>{selectedOption.label}</span>
          </span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <span className={styles.caret} aria-hidden="true">
          <CaretDown weight="bold" />
        </span>
      </button>

      {open ? (
        <div className={styles.popover}>
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            className={styles.listbox}
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : ariaLabel}
            aria-activedescendant={optionId(safeActive)}
            onKeyDown={onListboxKeyDown}
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === selected;
              return (
                <div
                  key={opt.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  data-active={index === safeActive || undefined}
                  data-selected={isSelected || undefined}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  className={styles.option}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                >
                  {opt.icon ? (
                    <span className={styles.slot} aria-hidden="true">
                      {opt.icon}
                    </span>
                  ) : null}
                  <span className={styles.label}>{opt.label}</span>
                  {isSelected ? (
                    <span className={styles.check} aria-hidden="true">
                      <Check weight="bold" />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
