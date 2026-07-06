"use client";

/**
 * ChatThread — the product-facing conversation. User turns are plain bubbles;
 * assistant turns are the generative UI SINA mounted, headed by a "governed by
 * SINA" mark. Wire outcomes get the ComparisonToggle (the money shot); transport
 * failures render distinctly.
 */

import { Badge, Spinner } from "@sina-design-system/core";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { INTENTS } from "@sina-design-system/fintech";
import type { GateTrace } from "@sina-design-system/governance-demo";
import { resolvePresentational } from "../_lib/registry";
import type { ConsoleView, Turn } from "@sina-design-system/governance-demo";
import { BlockedState } from "./BlockedState";
import { ComparisonToggle } from "@sina-design-system/governance-demo";
import { GovernedWireSummary } from "@sina-design-system/governance-demo";
import { TransportState } from "@sina-design-system/governance-demo";
import styles from "./ChatThread.module.css";

/**
 * The gate's mounted reply. A clean ungoverned pass mounts the validated
 * presentational component directly (TransactionList, BalanceCard). Money-movement
 * (wire) keeps the ComparisonToggle "money shot" — SINA's governed render vs the
 * raw confirm an ungoverned app would have streamed — on both pass and block;
 * reads don't, since there's no dangerous action to contrast.
 */
function GateReply({
  trace,
  turnId,
  onApproved,
}: {
  trace: GateTrace;
  turnId?: string;
  onApproved?: (turnId: string, view: ConsoleView) => void;
}) {
  if (trace.result.valid) {
    const Mounted = resolvePresentational(trace.mount);
    if (Mounted) return <Mounted payload={trace.payload} />;
  }

  const inner = trace.result.valid ? (
    <GovernedWireSummary payload={trace.payload} />
  ) : (
    <BlockedState trace={trace} turnId={turnId} onApproved={onApproved} />
  );

  return trace.intent === INTENTS.WIRE_TRANSFER ? (
    <ComparisonToggle payload={trace.payload} governed={inner} />
  ) : (
    inner
  );
}

/** A composed "experience" — several gated reads from one prompt, stacked. */
function Surface({
  traces,
  turnId,
  onApproved,
}: {
  traces: GateTrace[];
  turnId?: string;
  onApproved?: (turnId: string, view: ConsoleView) => void;
}) {
  return (
    <div className={styles.surface}>
      {traces.map((trace, i) => (
        <GateReply key={i} trace={trace} turnId={turnId} onApproved={onApproved} />
      ))}
    </div>
  );
}

/** True when the reply is a clean ungoverned read (validated + a presentational mount). */
function isReadReply(view: ConsoleView): boolean {
  if (view.kind === "gate") {
    return view.trace.result.valid && resolvePresentational(view.trace.mount) !== null;
  }
  if (view.kind === "experience") {
    return (
      view.traces.length > 0 &&
      view.traces.every((trace) => trace.result.valid && resolvePresentational(trace.mount) !== null)
    );
  }
  return false;
}

function AssistantReply({
  view,
  onRetry,
  turnId,
  onApproved,
}: {
  view: ConsoleView;
  onRetry?: () => void;
  turnId?: string;
  onApproved?: (turnId: string, view: ConsoleView) => void;
}) {
  if (view.kind === "idle") {
    return (
      <div className={styles.idle}>
        <Spinner size="sm" /> <span className={styles.idleLabel}>Streaming intent…</span>
      </div>
    );
  }
  // Resolved reply eases in as the gate "snaps shut" after the streaming skeleton
  // (motion-safe only — the theme zeroes durations under prefers-reduced-motion).
  const reply =
    view.kind === "transport" ? (
      <TransportState error={view.error} onRetry={onRetry} />
    ) : view.kind === "experience" ? (
      <Surface traces={view.traces} turnId={turnId} onApproved={onApproved} />
    ) : (
      <GateReply trace={view.trace} turnId={turnId} onApproved={onApproved} />
    );
  return <div className={styles.reply}>{reply}</div>;
}

export function ChatThread({
  turns,
  onRetry,
  onApproved,
}: {
  turns: Turn[];
  onRetry?: () => void;
  onApproved?: (turnId: string, view: ConsoleView) => void;
}) {
  if (turns.length === 0) {
    return (
      <div className={styles.empty}>
        <ShieldCheck weight="fill" className={styles.emptyIcon} aria-hidden />
        <p className={styles.emptyText}>
          Send a prompt or pick a scenario — every reply is governed before it mounts.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.thread}>
      {turns.map((turn) => {
        // A clean ungoverned read is "validated"; escalations/blocks/wires are "governed".
        const validated = !turn.streaming && isReadReply(turn.view);
        return (
          <div key={turn.id} className={styles.turn}>
            <div className={styles.userRow}>
              <div className={styles.bubble}>
                {turn.prompt}
              </div>
            </div>
            <div className={styles.assistant}>
              <div className={styles.badgeRow}>
                <Badge intent={validated ? "info" : "success"} size="sm" icon={ShieldCheck}>
                  {validated ? "validated by SINA" : "governed by SINA"}
                </Badge>
              </div>
              <AssistantReply
                view={turn.streaming ? { kind: "idle" } : turn.view}
                onRetry={onRetry}
                turnId={turn.id}
                onApproved={onApproved}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
