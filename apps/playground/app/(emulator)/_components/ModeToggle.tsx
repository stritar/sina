"use client";

/**
 * ModeToggle — segmented control for the run mode. `mock` replays a recorded
 * stream through streamUI; `direct` feeds a hand-authored payload straight to the
 * gate; `live` calls a real Claude model (needs ANTHROPIC_API_KEY).
 */

import styles from "./ModeToggle.module.css";

export type Mode = "mock" | "direct" | "live";

const MODES: { id: Mode; label: string }[] = [
  { id: "mock", label: "mock" },
  { id: "direct", label: "direct" },
  { id: "live", label: "live" },
];

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className={styles.track} role="group" aria-label="Run mode">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          aria-pressed={mode === m.id}
          className={[styles.tab, mode === m.id ? styles.tabActive : styles.tabInactive]
            .filter(Boolean)
            .join(" ")}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
