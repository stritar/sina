"use client";

/**
 * The gate's mounted reply — the single place that turns a `GateTrace` into UI.
 *
 * A clean ungoverned pass mounts the validated presentational component directly
 * (TransactionList, BalanceCard). Money movement (a wire) keeps the ComparisonToggle
 * "money shot" — SINA's governed render vs. the raw confirm an ungoverned app would
 * have streamed — on both pass and block; reads don't, since there's no dangerous
 * action to contrast.
 *
 * The branch on `trace.result.valid` is load-bearing and is why this lives in ONE
 * place. The docs embed used to skip it and hand the comparison a hardcoded
 * `GovernedWireSummary` ("The payload cleared the constitution") for every wire — so
 * a REJECTED payload was announced as passing, directly above a timeline that said
 * BLOCKED. Rendering the decision the gate actually made is not a detail; it is the
 * whole product.
 */

import { Suspense } from "react";
import { INTENTS } from "@sina-design-system/fintech";

import { BlockedState } from "./BlockedState.js";
import { ComparisonToggle } from "./ComparisonToggle.js";
import { GovernedWireSummary } from "./GovernedWireSummary.js";
import { resolvePresentational } from "./registry.js";
import type { GateTrace } from "./gate.js";
import type { ConsoleView } from "./types.js";

export interface GateReplyProps {
  trace: GateTrace;
  turnId?: string;
  scenarioId?: string;
  onApproved?: (turnId: string, view: ConsoleView) => void;
  /** Force the governed/ungoverned comparison on or off. Defaults on for wires. */
  comparison?: boolean;
}

export function GateReply({
  trace,
  turnId,
  scenarioId,
  onApproved,
  comparison,
}: GateReplyProps) {
  if (trace.result.valid) {
    const Mounted = resolvePresentational(trace.mount);
    // Lazy (the registry) — an SSR suspend without a boundary throws.
    if (Mounted)
      return (
        <Suspense fallback={null}>
          <Mounted payload={trace.payload} />
        </Suspense>
      );
  }

  const inner = trace.result.valid ? (
    <GovernedWireSummary payload={trace.payload} />
  ) : (
    <BlockedState
      trace={trace}
      turnId={turnId}
      scenarioId={scenarioId}
      onApproved={onApproved}
    />
  );

  const showComparison = comparison ?? trace.intent === INTENTS.WIRE_TRANSFER;
  return showComparison ? (
    <ComparisonToggle payload={trace.payload} governed={inner} />
  ) : (
    inner
  );
}

/** True when the reply is a clean ungoverned read (validated + a presentational mount). */
export function isReadReply(view: ConsoleView): boolean {
  if (view.kind === "gate") {
    return view.trace.result.valid && resolvePresentational(view.trace.mount) !== null;
  }
  if (view.kind === "experience") {
    return (
      view.traces.length > 0 &&
      view.traces.every(
        (trace) => trace.result.valid && resolvePresentational(trace.mount) !== null,
      )
    );
  }
  return false;
}
