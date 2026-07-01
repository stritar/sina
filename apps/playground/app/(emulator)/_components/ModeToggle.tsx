"use client";

/**
 * ModeToggle — segmented control for the run mode. `mock` replays a recorded
 * stream through streamUI; `direct` feeds a hand-authored payload straight to the
 * gate; `live` calls a real Claude model (needs ANTHROPIC_API_KEY).
 */

export type Mode = "mock" | "direct" | "live";

const MODES: { id: Mode; label: string }[] = [
  { id: "mock", label: "mock" },
  { id: "direct", label: "direct" },
  { id: "live", label: "live" },
];

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div
      className="inline-flex rounded-md bg-surface-sunken p-0.5"
      role="group"
      aria-label="Run mode"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          aria-pressed={mode === m.id}
          className={`rounded-sm px-2 py-0.5 font-mono text-xs transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring ${
            mode === m.id ? "bg-surface text-text shadow-xs" : "text-text-muted hover:text-text"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
