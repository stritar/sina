import { runGate, runExperience } from "./gate.js";
import { getScenario, resolveScenarios } from "./scenarios.js";
import { InteractiveDemo } from "./InteractiveDemo.js";
import type { ConsoleView } from "./types.js";
import styles from "./GovernanceDemo.module.css";

export interface GovernanceDemoProps {
  /** A canned scenario id from `SCENARIOS` (e.g. `"over-limit"`) — the one it opens on. */
  scenario: string;
  /**
   * Sibling scenario ids offered as picker chips, so a reader can walk the boundary
   * (a clean pass, an escalation, a reject) without leaving the page. Omit for a
   * single-scenario embed.
   */
  scenarios?: string[];
  /**
   * Show the governed-vs-ungoverned comparison toggle. Defaults on for wire
   * scenarios (the money shot), off otherwise.
   */
  comparison?: boolean;
}

/**
 * The governance demo — mountable in docs (Phase 7) and the marketing landing
 * (Phase 9). It runs the real constitution and renders the interception console.
 *
 * This is a Server Component (no `"use client"`): the gate for the OPENING decision
 * executes here — on the server, at build (SSG) — and only the serialized decision is
 * shipped to the client. So the page paints a complete, correct console with no
 * JavaScript, and nothing shifts on hydration.
 *
 * From there `InteractiveDemo` takes over and it is genuinely live: every subsequent
 * run and every approval re-gate goes back to a **server** through the injected
 * `GateTransport` (an Edge Route Handler in the docs, a `"use server"` action in the
 * playground). The gate is never re-run in the browser — §1b holds on the first
 * decision and on every one after it.
 */
export function GovernanceDemo({ scenario, scenarios, comparison }: GovernanceDemoProps) {
  const found = getScenario(scenario);
  if (!found) {
    return <p className={styles.missing}>Unknown scenario: {scenario}</p>;
  }

  const initialView: ConsoleView =
    found.envelopes && found.envelopes.length > 0
      ? { kind: "experience", traces: runExperience(found.envelopes) }
      : { kind: "gate", trace: runGate(found.envelope) };

  return (
    <section className={styles.demo} aria-label={`Governance demo: ${found.label}`}>
      {/* See InteractiveDemo: a <p> here would inherit the docs' `.prose p` margin. */}
      <div className={styles.label}>{found.label}</div>
      <InteractiveDemo
        scenario={found}
        initialView={initialView}
        scenarios={resolveScenarios(scenarios)}
        comparison={comparison}
      />
    </section>
  );
}
