/**
 * Fintech transport: the landing's own thin client for the existing Edge gate
 * endpoint (app/api/gate/route.ts), mirroring the docs' GateTransportBoundary.
 * Only a catalog scenario id goes over the wire; the server re-derives the
 * terms and runs the real Zod constitution (§1b holds on the landing too).
 *
 * TYPE-ONLY imports from the demo package: pulling its runtime here would drag
 * the docs console (and its Radix chunks) into the landing bundle.
 */

import type { ConsoleView } from "@sina-design-system/governance-demo/server";
import type { EmulatorScenario, EmulatorTrace, EmulatorViolation, Verdict } from "./types";

const ENDPOINT = "/api/gate";

/** A failed round-trip is a transport failure, not a governance decision. */
export type FintechRun =
  | { ok: true; trace: EmulatorTrace }
  | { ok: false; message: string };

export async function runFintechScenario(
  scenario: EmulatorScenario,
  signal: AbortSignal,
): Promise<FintechRun> {
  let view: ConsoleView;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "gate", scenarioId: scenario.id }),
      signal,
    });
    if (!response.ok) {
      return { ok: false, message: `The gate endpoint returned ${response.status}.` };
    }
    view = (await response.json()) as ConsoleView;
  } catch {
    return { ok: false, message: "Could not reach the gate endpoint." };
  }

  // The landing's chips are all single-envelope scenarios, so anything but a
  // plain gate reply is unexpected and reported as transport, never as a verdict.
  if (view.kind !== "gate") {
    return { ok: false, message: "The gate returned an unexpected reply." };
  }

  const { trace } = view;
  const verdict: Verdict = trace.result.valid
    ? "pass"
    : trace.result.requiredComponent
      ? "escalate"
      : "reject";

  const violations: EmulatorViolation[] = trace.result.violations.map((violation) => ({
    code: violation.code,
    severity: violation.severity,
    message: violation.message,
    ...(violation.standard ? { standard: violation.standard } : {}),
  }));

  return {
    ok: true,
    trace: {
      intent: trace.intent,
      verdict,
      mount: trace.mount ?? trace.result.requiredComponent,
      violations,
      latencyMs: Math.max(1, Math.round(trace.latencyMs)),
      simulated: false,
    },
  };
}
