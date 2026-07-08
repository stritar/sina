import type { ConsoleView } from "./types";
import { runGate, runExperience } from "./gate";
import { getScenario } from "./scenarios";
import { ConsoleTimeline } from "./ConsoleTimeline";
import { ComparisonToggle } from "./ComparisonToggle";
import { GovernedWireSummary } from "./GovernedWireSummary";
import styles from "./GovernanceDemo.module.css";

export interface GovernanceDemoProps {
  /** A canned scenario id from `SCENARIOS` (e.g. `"over-limit"`). */
  scenario: string;
  /**
   * Show the governed-vs-ungoverned comparison toggle. Defaults on for wire
   * scenarios (the money shot), off otherwise.
   */
  comparison?: boolean;
}

/**
 * A read-only, deterministic governance demo — mountable in docs (Phase 7) and
 * the marketing landing (Phase 9). It runs the real constitution through
 * `runGate` and renders the interception console.
 *
 * This is a Server Component (no `"use client"`): the gate executes here — on
 * the server, at build (SSG) — and only the serialized decision is shipped to
 * the client. That honors the §1b invariant ("validate, then mount") with no
 * `"use server"` action and no edge runtime; the interactive re-gate flows stay
 * in the playground.
 */
export function GovernanceDemo({ scenario, comparison }: GovernanceDemoProps) {
  const found = getScenario(scenario);
  if (!found) {
    return <p className={styles.missing}>Unknown scenario: {scenario}</p>;
  }

  if (found.envelopes && found.envelopes.length > 0) {
    const view: ConsoleView = { kind: "experience", traces: runExperience(found.envelopes) };
    return (
      <section className={styles.demo} aria-label={`Governance demo: ${found.label}`}>
        <p className={styles.label}>{found.label}</p>
        <p className={styles.desc}>{found.description}</p>
        <ConsoleTimeline view={view} />
      </section>
    );
  }

  const trace = runGate(found.envelope);
  const showComparison = comparison ?? trace.intent === "wire_transfer";
  const view: ConsoleView = { kind: "gate", trace };

  return (
    <section className={styles.demo} aria-label={`Governance demo: ${found.label}`}>
      <p className={styles.label}>{found.label}</p>
      <p className={styles.desc}>{found.description}</p>
      {showComparison ? (
        <ComparisonToggle
          payload={trace.payload}
          governed={<GovernedWireSummary payload={trace.payload} />}
        />
      ) : null}
      <ConsoleTimeline view={view} />
    </section>
  );
}
