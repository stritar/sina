"use client";

import { useEffect, useState } from "react";
import { Button } from "@sina-design-system/core";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

/**
 * Light/dark toggle. Stamps `data-theme` on `<html>` and persists the choice to
 * localStorage; the initial value is applied before paint by the inline script in
 * `app/layout.tsx` (no FOUC). The SINA `theme` package reassigns every `--sina-*`
 * var under `[data-theme="dark"]`, so flipping the attribute re-colors the whole
 * page — chrome, prose, and (via globals.css) shiki code blocks.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Read the attribute the inline script already set (avoids a hydration guess).
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("sina-docs-theme", next);
    } catch {
      // Storage denied (private mode) — the toggle still works for the session.
    }
  }

  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="sm"
      className={styles.toggle}
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme"
    >
      <span aria-hidden="true">{theme == null ? "" : isDark ? "☾" : "☀"}</span>
    </Button>
  );
}
