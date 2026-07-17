/**
 * Framework-free types for the landing emulator. `EmulatorTrace` is shaped
 * after the real `GateTrace` (packages/governance-demo/src/gate.ts) so the
 * verdict renderers are industry-agnostic: fintech traces are mapped from the
 * real `/api/gate` response, healthcare/defense traces come canned from
 * `simulated.ts`.
 */

export type Verdict = "pass" | "escalate" | "reject";

/** Mirrors the governance `Violation` shape (severity: reject | escalate | flag). */
export interface EmulatorViolation {
  /** Machine code (e.g. "AMOUNT_REQUIRES_APPROVAL") — the badge fallback label. */
  code: string;
  severity: "reject" | "escalate" | "flag";
  message: string;
  /** Cited standard, when the rule cites one (e.g. "FinCEN Travel Rule"). */
  standard?: string;
}

export interface EmulatorTrace {
  /** The intent verb the envelope carried (e.g. `wire_transfer`). */
  intent: string;
  verdict: Verdict;
  /** What SINA mounts: the component on a pass, the forced governed component
   * on escalation, or null on a plain block. */
  mount: string | null;
  violations: EmulatorViolation[];
  latencyMs: number;
  /** True when the trace came from the canned browser engine, not the server. */
  simulated: boolean;
}

export interface EmulatorScenario {
  /** For fintech this is a REAL catalog id the gate endpoint re-derives terms
   * from; for simulations it is local. */
  id: string;
  /** Short chip label. */
  chip: string;
  /** The outcome hint shown on the chip. */
  expected: Verdict;
  /** The user's ask, rendered as the chat prompt. */
  prompt: string;
  /** The intent verb, shown in mono beside the payload. */
  intent: string;
  /** One-line plain description of the emitted payload. */
  summary: string;
  /** Illustrative pretty-printed intent JSON (display only; the fintech server
   * re-derives the real terms from its own catalog). */
  intentJson: string;
}

/** A canned scenario bundles the verdict the "gate" will hand back. */
export interface SimulatedScenario extends EmulatorScenario {
  result: {
    verdict: Verdict;
    mount: string | null;
    violations: EmulatorViolation[];
  };
}

export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
