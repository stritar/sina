/**
 * Presentational pieces of the hero emulator's thread, ported from the retired
 * mid-page Emulator. Two visual lanes: solid-bordered "conversation" bubbles
 * (the user's ask, the outcome the user sees) and dashed, sunken, mono
 * "under the hood" cards (the intent the agent emits, the gate deciding).
 * Escalate/reject verdicts carry the mandatory bold Phosphor glyph; a blocked
 * outcome keeps the BlockedState pattern (text-only danger Alert + SIBLING
 * severity badges, never nested).
 */

import Link from "next/link";
import { Warning, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import { Alert, Badge } from "@sina-design-system/core";
import { emulator as copy, heroEmulator as heroCopy } from "../copy";
import type { EmulatorScenario, EmulatorTrace, Verdict } from "../emulator/types";
import styles from "./HeroEmulator.module.css";

const BADGE_INTENT: Record<Verdict | "flag", "danger" | "warning" | "info"> = {
  reject: "danger",
  escalate: "warning",
  flag: "info",
  pass: "info",
};

export function UserBubble({ prompt }: { prompt: string }) {
  return (
    <div className={styles.userBubble}>
      <span className={styles.bubbleKicker}>{copy.intentUserLabel}</span>
      <p className={styles.bubbleText}>{prompt}</p>
    </div>
  );
}

export function IntentCard({ scenario }: { scenario: EmulatorScenario }) {
  return (
    <div className={styles.hoodCard}>
      <p className={styles.hoodKicker}>{heroCopy.underHood}</p>
      <p className={styles.intentLead}>{copy.intentAgentLabel}</p>
      <p className={styles.summary}>
        <code className={styles.intentVerb}>{scenario.intent}</code>
        {scenario.summary}
      </p>
      <details className={styles.details}>
        <summary className={styles.detailsSummary}>{copy.showJson}</summary>
        <pre className={styles.json}>
          <code>{scenario.intentJson}</code>
        </pre>
      </details>
    </div>
  );
}

/** The gate card: a busy line while checking, the decision once it lands. */
export function GateStrip({ trace, checking }: { trace: EmulatorTrace | null; checking: boolean }) {
  return (
    <div className={`${styles.hoodCard} ${styles.gateCard}`}>
      <p className={styles.hoodKicker}>{copy.stages.gate.slice(3)}</p>
      {checking ? (
        <p className={styles.gateBusy} data-busy>
          {copy.gateChecking}&hellip;
        </p>
      ) : null}
      {trace ? (
        <div className={styles.decision}>
          <p className={styles.gateVerdict} data-verdict={trace.verdict}>
            {trace.verdict === "escalate" ? (
              <Warning weight="bold" aria-hidden="true" className={styles.verdictGlyph} />
            ) : null}
            {trace.verdict === "reject" ? (
              <WarningOctagon weight="bold" aria-hidden="true" className={styles.verdictGlyph} />
            ) : null}
            {copy.gateVerdict[trace.verdict]}
          </p>
          {trace.violations.length === 0 ? (
            <p className={styles.noViolations}>{copy.noViolations}</p>
          ) : (
            <ul className={styles.violations} aria-label={copy.violationsHeading}>
              {trace.violations.map((violation) => (
                <li key={violation.code} className={styles.violation}>
                  <span className={styles.severity} data-severity={violation.severity}>
                    {violation.severity}
                  </span>
                  <span className={styles.violationText}>
                    {violation.message}
                    {violation.standard ? (
                      <cite className={styles.cite}>{violation.standard}</cite>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.latency}>
            {trace.latencyMs} ms {copy.latency} &middot; {heroCopy.logged}
            {trace.simulated ? ` (${copy.latencySimulated})` : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** The outcome lane: what actually reaches the user for this verdict. */
export function OutcomeBubble({ trace }: { trace: EmulatorTrace }) {
  return (
    <div className={styles.outcome}>
      <span className={styles.bubbleKicker}>{heroCopy.userSees}</span>
      <VerdictView trace={trace} />
    </div>
  );
}

function VerdictView({ trace }: { trace: EmulatorTrace }) {
  if (trace.verdict === "pass") {
    const withheld = trace.violations.some((v) => v.severity === "flag");
    return (
      <div className={styles.verdictBody}>
        <p className={styles.verdictHeader}>
          <span>{copy.verdictPass}</span>
          {trace.mount ? <code className={styles.mountName}>{trace.mount}</code> : null}
        </p>
        <div className={styles.sketch}>
          <span className={styles.sketchBar} aria-hidden="true" />
          <span className={styles.sketchBar} data-w="70" aria-hidden="true" />
          {withheld ? (
            <span className={styles.sketchWithheld}>{copy.withheldRow}</span>
          ) : (
            <span className={styles.sketchBar} data-w="50" aria-hidden="true" />
          )}
        </div>
        <p className={styles.verdictNote}>{copy.verdictPassNote}</p>
      </div>
    );
  }

  if (trace.verdict === "escalate") {
    return (
      <div className={styles.verdictBody}>
        <p className={styles.verdictHeader}>{copy.verdictEscalate}</p>
        <div className={styles.dialogSketch}>
          <p className={styles.dialogTitle}>
            <code className={styles.mountName}>{trace.mount ?? "GovernedDialog"}</code>
          </p>
          <div className={styles.dialogFields} aria-hidden="true">
            <span className={styles.fieldLabel} />
            <span className={styles.fieldBox} />
            <span className={styles.fieldLabel} data-w="40" />
            <span className={styles.fieldBox} />
          </div>
          <div className={styles.dialogActions} aria-hidden="true">
            <span className={styles.approveBlock}>{copy.approveSketch}</span>
            <span className={styles.denyBlock}>{copy.denySketch}</span>
          </div>
        </div>
        <p className={styles.verdictNote}>
          {copy.verdictEscalateNote}{" "}
          <Link className={styles.docsLink} href="/docs/governance/wire-transfer">
            {copy.escalateDocsLink}
          </Link>
        </p>
      </div>
    );
  }

  // Reject: the BlockedState pattern — a text-only danger Alert with the
  // violation Badges in a SIBLING row (never nested inside the Alert).
  return (
    <div className={styles.verdictBody}>
      <Alert variant="danger" title={copy.verdictReject}>
        {copy.verdictRejectNote}
      </Alert>
      <div className={styles.blockedBadges}>
        {trace.violations.map((violation) => (
          <Badge key={violation.code} intent={BADGE_INTENT[violation.severity]} size="sm">
            {violation.standard ?? violation.code}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/** A live run could not reach the gate: a network problem, not a verdict. */
export function TransportErrorBubble({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.outcome}>
      <div className={styles.verdictBody}>
        <Alert variant="warning" title={copy.transportTitle}>
          {copy.transportBody}
        </Alert>
        <div className={styles.retryRow}>
          <button type="button" className={styles.textAction} data-broadsheet="" onClick={onRetry}>
            {copy.retry}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The three-step story indicator: where the loop is in the SINA narrative. */
export function StoryStrip({ activeStep }: { activeStep: 0 | 1 | 2 }) {
  const steps = [copy.stages.intent, copy.stages.gate, copy.stages.verdict];
  return (
    <ol className={styles.story} aria-hidden="true">
      {steps.map((label, i) => (
        <li key={label} className={styles.storyStep} data-active={i === activeStep || undefined}>
          {label}
        </li>
      ))}
    </ol>
  );
}
