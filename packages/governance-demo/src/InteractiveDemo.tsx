"use client";

/**
 * The runnable half of {@link GovernanceDemo} — a real emulator instance, embeddable
 * in prose.
 *
 * Seeded with the decision the server already made at build (`initialView`), so the
 * page paints a complete, correct console with no JavaScript and nothing shifts on
 * hydration. From there it is live: pick a canned scenario, hit Run, and the envelope
 * goes back to a SERVER gate through the injected `GateTransport` — never a
 * client-side check (§1b). An escalation mounts the governed component the
 * constitution forced, and approving inside it re-gates on the server too.
 *
 * The proof that it really ran is in the output, not in a spinner: every run returns a
 * fresh `latencyMs` and a fresh `decisionId`, and the audit ledger grows a row per
 * decision. A frozen build-time snapshot cannot do that.
 *
 * Mock only, by design: the reader picks from the canned catalog and supplies an
 * approver's evidence. There is no free-form payload authoring here — that (and live
 * model mode) is the playground's job.
 */

import { useRef, useState } from "react";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@sina-design-system/core";
import type { AuditEvent } from "@sina-design-system/governance";

import { AuditLedger } from "./AuditLedger.js";
import { ConsoleTimeline } from "./ConsoleTimeline.js";
import { GateReply } from "./GateReply.js";
import { TransportState } from "./TransportState.js";
import { useGateTransport } from "./TransportProvider.js";
import { collectAudits, type ConsoleView } from "./types.js";
import type { Scenario } from "./scenarios.js";
import styles from "./InteractiveDemo.module.css";

/** What the gate is expected to do — colours the picker chip. */
const EXPECT_CLASS: Record<Scenario["expectation"], string | undefined> = {
  pass: styles.expectPass,
  escalate: styles.expectDanger,
  reject: styles.expectDanger,
};

const EXPECT_LABEL: Record<Scenario["expectation"], string> = {
  pass: "passes",
  escalate: "escalates",
  reject: "blocked",
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export interface InteractiveDemoProps {
  /** The scenario the embed opens on — already gated at build into `initialView`. */
  scenario: Scenario;
  /** The build-time decision. Rendered as-is until the reader runs something. */
  initialView: ConsoleView;
  /** Sibling scenarios offered as picker chips. Omit for a single-scenario embed. */
  scenarios?: Scenario[];
  /** Force the governed/ungoverned comparison on or off. Defaults on for wires. */
  comparison?: boolean;
}

export function InteractiveDemo({
  scenario,
  initialView,
  scenarios,
  comparison,
}: InteractiveDemoProps) {
  const transport = useGateTransport();

  const [current, setCurrent] = useState<Scenario>(scenario);
  const [view, setView] = useState<ConsoleView>(initialView);
  const [audits, setAudits] = useState<AuditEvent[]>(() => collectAudits(initialView));
  const [running, setRunning] = useState(false);

  // Guards against a slow first run resolving after a second one — the reader can
  // click a different chip mid-flight, and the later click must win.
  const runIdRef = useRef(0);

  async function run(next: Scenario) {
    const runId = ++runIdRef.current;
    setRunning(true);
    setCurrent(next);
    setView({ kind: "idle" });

    // Block-the-stream: a beat of "streaming" before the gate snaps shut.
    if (!prefersReducedMotion()) await sleep(450);

    const result = await transport.runScenario(next);
    if (runId !== runIdRef.current) return; // superseded by a later click

    setView(result);
    setAudits(collectAudits(result));
    setRunning(false);
  }

  /**
   * The approval re-gate came back from the server. Swap the reply to the new decision
   * and APPEND its audit event — the approval is its own governance decision, so the
   * ledger records both.
   */
  function handleApproved(_turnId: string, next: ConsoleView) {
    setView(next);
    setAudits((prev) => [...prev, ...collectAudits(next)]);
  }

  const chips = scenarios ?? [];

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        {chips.length > 0 && (
          <div className={styles.chips} role="group" aria-label="Pick a request to gate">
            {chips.map((option) => {
              const selected = option.id === current.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={styles.chip}
                  aria-pressed={selected}
                  disabled={running}
                  onClick={() => void run(option)}
                >
                  <span className={styles.chipLabel}>{option.label}</span>
                  <span
                    className={[styles.chipHint, EXPECT_CLASS[option.expectation]]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {EXPECT_LABEL[option.expectation]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <Button
          type="button"
          size="sm"
          variant="secondary"
          loading={running}
          iconLeft={<Play weight="fill" aria-hidden />}
          onClick={() => void run(current)}
          className={styles.run}
        >
          Run the gate
        </Button>
      </div>

      {/* Not a <p>: inside the docs' `.prose`, a `.prose p` element selector (0,1,1)
          outranks this class (0,1,0) and would stack a margin on top of the flex gap.
          This is demo chrome, not body copy. */}
      <div className={styles.desc}>{current.description}</div>

      <div className={styles.reply} aria-busy={running}>
        {view.kind === "idle" ? (
          <div className={styles.streaming}>Streaming intent…</div>
        ) : view.kind === "transport" ? (
          <TransportState error={view.error} onRetry={() => void run(current)} />
        ) : view.kind === "experience" ? (
          <div className={styles.surface}>
            {view.traces.map((trace, i) => (
              <GateReply
                key={i}
                trace={trace}
                turnId={current.id}
                scenarioId={current.id}
                onApproved={handleApproved}
                comparison={comparison}
              />
            ))}
          </div>
        ) : (
          <GateReply
            trace={view.trace}
            turnId={current.id}
            scenarioId={current.id}
            onApproved={handleApproved}
            comparison={comparison}
          />
        )}
      </div>

      <ConsoleTimeline view={view} />
      <AuditLedger events={audits} />
    </div>
  );
}
