"use client";

/**
 * ScenarioPicker — a segmented control switches between governed flows and
 * ungoverned reads; each segment shows its own quick-stream chips plus a Select
 * scoped to that group. Each scenario is a canned LLM intent from the fintech
 * fixtures.
 */

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@sina-design-system/core";
import { SCENARIOS, getScenario } from "../_lib/scenarios";

type Segment = "governed" | "read";

const SEGMENTS = [
  { key: "governed", label: "Governed" },
  { key: "read", label: "Ungoverned" },
] as const satisfies readonly { key: Segment; label: string }[];

/** Headline quick-picks per segment. */
const QUICK_IDS: Record<Segment, string[]> = {
  governed: ["over-limit", "smuggled-card"],
  read: ["dashboard", "spending-breakdown"],
};

const SEGMENT_META: Record<Segment, { label: string; placeholder: string }> = {
  governed: { label: "Governed flows", placeholder: "Governed flows…" },
  read: { label: "Ungoverned reads", placeholder: "Ungoverned reads…" },
};

const TRACK = "inline-flex rounded-md bg-surface-sunken p-0.5";
const TAB =
  "rounded-sm px-2 py-0.5 font-mono text-xs transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring";

const EXPECTATION_INTENT: Record<string, string> = {
  pass: "border-success/40 text-success",
  escalate: "border-danger/40 text-danger",
  reject: "border-danger/40 text-danger",
};

export function ScenarioPicker({
  onPick,
  disabled,
}: {
  onPick: (id: string) => void;
  disabled?: boolean;
}) {
  const [segment, setSegment] = useState<Segment>("governed");
  const meta = SEGMENT_META[segment];

  return (
    <div className="flex flex-col gap-2">
      <div className={TRACK} role="group" aria-label="Scenario type">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            type="button"
            disabled={disabled}
            onClick={() => setSegment(s.key)}
            aria-pressed={segment === s.key}
            className={`${TAB} disabled:pointer-events-none disabled:opacity-50 ${
              segment === s.key ? "bg-surface text-text shadow-xs" : "text-text-muted hover:text-text"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_IDS[segment].map((id) => {
          const scenario = getScenario(id);
          if (!scenario) return null;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onPick(id)}
              className={`rounded-full border bg-surface px-2 py-0.5 text-xs transition-colors duration-fast ease-standard hover:bg-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring disabled:pointer-events-none disabled:opacity-50 ${
                EXPECTATION_INTENT[scenario.expectation] ?? "border-border text-text-muted"
              }`}
            >
              {scenario.label}
            </button>
          );
        })}
      </div>
      <Select key={segment} disabled={disabled} onValueChange={onPick}>
        <SelectTrigger aria-label={meta.label}>
          <SelectValue placeholder={meta.placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{meta.label}</SelectLabel>
            {SCENARIOS.filter((scenario) => scenario.group === segment).map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                {scenario.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
