"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./ThemeSwitcher.module.css";

/** What the user CHOSE. `system` defers to the OS and keeps following it. */
type Mode = "system" | "light" | "dark";

const MODES: readonly Mode[] = ["system", "light", "dark"];
const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;
const LABELS: Record<Mode, string> = { system: "System", light: "Light", dark: "Dark" };

const prefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

/** Stamp the RESOLVED theme on <html>; `system` resolves against the OS. */
function apply(mode: Mode) {
  const resolved = mode === "system" ? (prefersDark() ? "dark" : "light") : mode;
  document.documentElement.setAttribute("data-theme", resolved);
}

export type ThemeSwitcherProps = {
  size?: ButtonSize;
  className?: string;
};

/**
 * Broadsheet theme switcher: a segmented `radiogroup` — system / light / dark
 * all visible, the chosen one shown as a raised surface chip on the sage
 * secondary-button track. Inherits the secondary button's look, feel, and sizes
 * (sm/md/lg). Stamps `data-theme` on `<html>` and persists the choice to
 * localStorage; the pre-paint script in `app/layout.tsx` applies the initial
 * value (no FOUC). The marketing twin of the docs `ThemeToggle`, with no
 * LocaleProvider dependency so it works anywhere in the marketing tree.
 *
 * `system` is a real third state, not just the default: without it, one click
 * pins the theme forever and the user can never hand control back to the OS.
 */
export function ThemeSwitcher({ size = "md", className }: ThemeSwitcherProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Recover the persisted CHOICE. (The resolved theme is already on <html>, but
  // it can't tell us whether the user picked "dark" or is following a dark OS.)
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("sina-docs-theme");
    } catch {
      // Storage denied (private mode) — fall through to "system".
    }
    setMode(stored === "light" || stored === "dark" ? stored : "system");
  }, []);

  // While following the system, track it live — an OS theme change mid-session
  // should move the page with it.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  function select(next: Mode) {
    setMode(next);
    apply(next);
    try {
      localStorage.setItem("sina-docs-theme", next);
    } catch {
      // Storage denied (private mode) — the switcher still works for the session.
    }
  }

  // Arrow keys move within the group and select as they go (native radiogroup UX).
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (delta === 0) return;
    event.preventDefault();
    const nextIndex = (index + delta + MODES.length) % MODES.length;
    const nextMode = MODES[nextIndex]!;
    select(nextMode);
    refs.current[nextIndex]?.focus();
  }

  // The active index also drives roving tabindex; before mount nothing is chosen,
  // so the first segment is the tab stop.
  const activeIndex = mode ? MODES.indexOf(mode) : 0;

  return (
    <div className={cn(styles.root, className)} role="radiogroup" aria-label="Theme" data-size={size}>
      {MODES.map((m, index) => {
        const Icon = ICONS[m];
        const checked = mode === m;
        return (
          <button
            key={m}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            data-broadsheet=""
            aria-checked={checked}
            aria-label={LABELS[m]}
            title={LABELS[m]}
            tabIndex={index === activeIndex ? 0 : -1}
            className={styles.segment}
            data-active={checked || undefined}
            onClick={() => select(m)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <Icon weight="bold" className={styles.icon} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
