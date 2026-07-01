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
import type { GateTrace } from "../_lib/gate";
import { resolvePresentational } from "../_lib/registry";
import type { ConsoleView, Turn } from "../_lib/types";
import { BlockedState } from "./BlockedState";
import { ComparisonToggle } from "./ComparisonToggle";
import { GovernedWireSummary } from "./GovernedWireSummary";
import { TransportState } from "./TransportState";

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
      <div className="flex items-center gap-2 text-text-muted">
        <Spinner size="sm" /> <span className="text-ui">Streaming intent…</span>
      </div>
    );
  }
  // Resolved reply eases in as the gate "snaps shut" after the streaming skeleton
  // (motion-safe only — the theme zeroes durations under prefers-reduced-motion).
  const reply =
    view.kind === "transport" ? (
      <TransportState error={view.error} onRetry={onRetry} />
    ) : (
      <GateReply trace={view.trace} turnId={turnId} onApproved={onApproved} />
    );
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1">
      {reply}
    </div>
  );
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
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <ShieldCheck className="size-8 text-text-subtle" aria-hidden />
        <p className="text-ui text-text-muted">
          Send a prompt or pick a scenario — every reply is governed before it mounts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {turns.map((turn) => (
        <div key={turn.id} className="flex flex-col gap-2">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl bg-secondary px-3 py-2 text-ui text-secondary-fg">
              {turn.prompt}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Badge intent="success" size="sm" icon={ShieldCheck}>
                governed by SINA
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
      ))}
    </div>
  );
}
