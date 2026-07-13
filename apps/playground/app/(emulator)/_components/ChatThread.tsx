"use client";

/**
 * ChatThread — the product-facing conversation. User turns are plain bubbles;
 * assistant turns are the generative UI SINA mounted, headed by a "governed by
 * SINA" mark. Transport failures render distinctly.
 *
 * The reply itself is `GateReply` from `@sina-design-system/governance-demo` — the one
 * implementation shared with the docs embed, so both render the decision the gate
 * actually made rather than each re-deriving it.
 */

import { Badge, Spinner } from "@sina-design-system/core";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { GateTrace } from "@sina-design-system/governance-demo";
import { GateReply, isReadReply } from "@sina-design-system/governance-demo";
import type { ConsoleView, Turn } from "@sina-design-system/governance-demo";
import { TransportState } from "@sina-design-system/governance-demo";
import styles from "./ChatThread.module.css";

/** A composed "experience" — several gated reads from one prompt, stacked. */
function Surface({
  traces,
  turnId,
  scenarioId,
  onApproved,
}: {
  traces: GateTrace[];
  turnId?: string;
  scenarioId?: string;
  onApproved?: (turnId: string, view: ConsoleView) => void;
}) {
  return (
    <div className={styles.surface}>
      {traces.map((trace, i) => (
        <GateReply
          key={i}
          trace={trace}
          turnId={turnId}
          scenarioId={scenarioId}
          onApproved={onApproved}
        />
      ))}
    </div>
  );
}

function AssistantReply({
  view,
  onRetry,
  turnId,
  scenarioId,
  onApproved,
}: {
  view: ConsoleView;
  onRetry?: () => void;
  turnId?: string;
  scenarioId?: string;
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
      <Surface
        traces={view.traces}
        turnId={turnId}
        scenarioId={scenarioId}
        onApproved={onApproved}
      />
    ) : (
      <GateReply
        trace={view.trace}
        turnId={turnId}
        scenarioId={scenarioId}
        onApproved={onApproved}
      />
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
                scenarioId={turn.scenarioId}
                onApproved={onApproved}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
