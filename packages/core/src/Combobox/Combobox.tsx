/**
 * @sina-design-system/core — Combobox
 *
 * Searchable single-select picker. Radix has no Combobox primitive, so this is
 * built on Radix Popover (portal + positioning) + a native text input wired as
 * an ARIA `combobox` over a filtered `listbox`: type to filter, arrow keys move
 * the active option, Enter selects, Esc closes; the match substring is
 * highlighted and the selected option shows a check. An upgrade over `Select`
 * when option lists grow. Domain-agnostic — options are the caller's content.
 */
"use client";

import { Popover as Primitive } from "radix-ui";
import { CheckFatIcon, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "../utils/cn.js";
import styles from "./Combobox.module.css";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional secondary text shown after the label. */
  description?: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Accessible label for the input. */
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

/** Render `label` with the portion matching `query` emphasized. */
function highlight(label: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return label;
  const idx = label.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return label;
  return (
    <>
      {label.slice(0, idx)}
      <span className={styles.highlightMatch}>{label.slice(idx, idx + q.length)}</span>
      {label.slice(idx + q.length)}
    </>
  );
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Search…",
  "aria-label": ariaLabel = "Search",
  disabled = false,
  className,
}: ComboboxProps) {
  const baseId = useId();
  const listId = `${baseId}-listbox`;
  const selected = options.find((o) => o.value === value);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selected?.label ?? "");
  const [active, setActive] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const choose = (option: ComboboxOption | undefined) => {
    if (!option) return;
    onValueChange?.(option.value);
    setQuery(option.label);
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(0);
      } else {
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[active]) {
        e.preventDefault();
        choose(filtered[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Primitive.Root open={open} onOpenChange={setOpen}>
      <Primitive.Anchor asChild>
        <div ref={anchorRef} className={cn(styles.anchor, className)}>
          <MagnifyingGlass aria-hidden weight="bold" className={styles.searchIcon} />
          <input
            type="text"
            role="combobox"
            aria-label={ariaLabel}
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && filtered[active] ? optionId(active) : undefined}
            autoComplete="off"
            disabled={disabled}
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className={styles.input}
          />
        </div>
      </Primitive.Anchor>
      <Primitive.Portal>
        <Primitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
          className={styles.content}
        >
          <ul id={listId} role="listbox" aria-label={ariaLabel} className={styles.list}>
            {filtered.length === 0 ? (
              <li className={styles.empty}>No results</li>
            ) : (
              filtered.map((option, i) => {
                const isSelected = option.value === value;
                const isActive = i === active;
                return (
                  <li
                    key={option.value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      // keep focus in the input
                      e.preventDefault();
                      choose(option);
                    }}
                    className={cn(styles.option, isActive && styles.optionActive)}
                  >
                    <span className={styles.optionLabel}>
                      {highlight(option.label, query)}
                      {option.description ? (
                        <span className={styles.optionDescription}> · {option.description}</span>
                      ) : null}
                    </span>
                    {isSelected ? (
                      <CheckFatIcon aria-hidden weight="fill" className={styles.optionCheck} />
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
