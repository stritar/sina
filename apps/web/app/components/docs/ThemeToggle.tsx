"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@sina-design-system/core";
import styles from "./ThemeToggle.module.css";

/** What the user CHOSE. `system` defers to the OS and keeps following it. */
type Mode = "system" | "light" | "dark";

const NEXT_MODE = { system: "light", light: "dark", dark: "system" } as const;
const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;
const LABELS = {
  system: "Theme: follow system",
  light: "Theme: light",
  dark: "Theme: dark",
} as const;

const prefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

/** Stamp the RESOLVED theme on <html>; `system` resolves against the OS. */
function apply(mode: Mode) {
  const resolved = mode === "system" ? (prefersDark() ? "dark" : "light") : mode;
  document.documentElement.setAttribute("data-theme", resolved);
}

/**
 * Theme control, cycling `system → light → dark`. Stamps `data-theme` on `<html>`
 * and persists the choice to localStorage; the initial value is applied before
 * paint by the inline script in `app/layout.tsx` (no FOUC). The SINA `theme`
 * package reassigns every `--sina-*` var under `[data-theme="dark"]`, so flipping
 * the attribute re-colors the whole page — chrome, prose, and (via globals.css)
 * shiki code blocks.
 *
 * `system` is a real third state, not just the default: without it, one click
 * pins the theme forever and the user can never hand control back to the OS.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);

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

  function cycle() {
    const next = NEXT_MODE[mode ?? "system"];
    setMode(next);
    apply(next);
    try {
      localStorage.setItem("sina-docs-theme", next);
    } catch {
      // Storage denied (private mode) — the toggle still works for the session.
    }
  }

  // Render nothing glyph-wise until mounted: the chosen mode is only knowable on
  // the client, and guessing it would flash the wrong icon.
  const Icon = mode == null ? null : ICONS[mode];
  return (
    <Button
      variant="ghost"
      size="sm"
      className={styles.toggle}
      onClick={cycle}
      aria-label={mode == null ? "Toggle theme" : LABELS[mode]}
      title={mode == null ? "Toggle theme" : LABELS[mode]}
    >
      {Icon ? <Icon weight="fill" className={styles.icon} aria-hidden="true" /> : null}
    </Button>
  );
}
