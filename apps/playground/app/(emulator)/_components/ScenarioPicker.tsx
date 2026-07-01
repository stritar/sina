"use client";

/**
 * ScenarioPicker — quick-stream chips for the headline scenarios plus a Select for
 * the full catalog. Each scenario is a canned LLM intent from the fintech fixtures.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sina-design-system/core";
import { SCENARIOS, getScenario } from "../_lib/scenarios";

const QUICK_IDS = ["small", "five-thousand", "over-limit", "smuggled-card"] as const;

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
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {QUICK_IDS.map((id) => {
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
      <Select disabled={disabled} onValueChange={onPick}>
        <SelectTrigger aria-label="All scenarios">
          <SelectValue placeholder="All scenarios…" />
        </SelectTrigger>
        <SelectContent>
          {SCENARIOS.map((scenario) => (
            <SelectItem key={scenario.id} value={scenario.id}>
              {scenario.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
