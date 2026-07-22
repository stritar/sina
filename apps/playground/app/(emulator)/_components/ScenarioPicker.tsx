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
import { SCENARIOS, getScenario } from "@sina-design-system/governance-demo";
import styles from "./ScenarioPicker.module.css";

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

const EXPECTATION_INTENT: Record<string, string | undefined> = {
  pass: styles.expectPass,
  escalate: styles.expectDanger,
  reject: styles.expectDanger,
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
    <div className={styles.root}>
      <div className={styles.track} role="group" aria-label="Scenario type">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            type="button"
            disabled={disabled}
            onClick={() => setSegment(s.key)}
            aria-pressed={segment === s.key}
            className={[styles.tab, segment === s.key ? styles.tabActive : styles.tabInactive]
              .filter(Boolean)
              .join(" ")}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className={styles.chips}>
        {QUICK_IDS[segment].map((id) => {
          const scenario = getScenario(id);
          if (!scenario) return null;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onPick(id)}
              className={[
                styles.chip,
                EXPECTATION_INTENT[scenario.expectation] ?? styles.chipDefault,
              ]
                .filter(Boolean)
                .join(" ")}
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
