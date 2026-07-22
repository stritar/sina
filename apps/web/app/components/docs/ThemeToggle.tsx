"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { messages } from "./messages";
import styles from "./ThemeToggle.module.css";

/** What the user CHOSE. `system` defers to the OS and keeps following it. */
type Mode = "system" | "light" | "dark";

const MODES: readonly Mode[] = ["system", "light", "dark"];
const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

const prefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

/** Stamp the RESOLVED theme on <html>; `system` resolves against the OS. */
function apply(mode: Mode) {
  const resolved = mode === "system" ? (prefersDark() ? "dark" : "light") : mode;
  document.documentElement.setAttribute("data-theme", resolved);
}

/**
 * Theme control as a segmented `radiogroup` — system / light / dark all visible,
 * the chosen one highlighted (clicking a segment sets it directly). Stamps
 * `data-theme` on `<html>` and persists the choice to localStorage; the initial
 * value is applied before paint by the inline script in `app/layout.tsx` (no
 * FOUC). The SINA `theme` package reassigns every `--sina-*` var under
 * `[data-theme="dark"]`, so flipping the attribute re-colors the whole page.
 *
 * `system` is a real third state, not just the default: without it, one click
 * pins the theme forever and the user can never hand control back to the OS.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const LABELS: Record<Mode, string> = {
    system: messages.theme.system,
    light: messages.theme.light,
    dark: messages.theme.dark,
  };

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
      // Storage denied (private mode) — the toggle still works for the session.
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
    <div className={styles.segmented} role="radiogroup" aria-label={messages.theme.label}>
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
            aria-checked={checked}
            aria-label={LABELS[m]}
            title={LABELS[m]}
            tabIndex={index === activeIndex ? 0 : -1}
            className={styles.segment}
            data-active={checked || undefined}
            onClick={() => select(m)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <Icon weight="fill" className={styles.icon} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
