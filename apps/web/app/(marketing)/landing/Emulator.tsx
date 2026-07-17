"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { Alert, Badge, Button, VisuallyHidden } from "@sina-design-system/core";
import { INDUSTRIES, emulator as copy, type Industry } from "./copy";
import { useIndustry } from "./IndustryContext";
import { FINTECH_DEFAULT, FINTECH_SCENARIOS } from "./emulator/fintech";
import {
  DEFENSE_DEFAULT,
  DEFENSE_SCENARIOS,
  HEALTHCARE_DEFAULT,
  HEALTHCARE_SCENARIOS,
  simulate,
} from "./emulator/simulated";
import { runFintechScenario } from "./emulator/transport";
import type {
  EmulatorScenario,
  EmulatorTrace,
  SimulatedScenario,
  Verdict,
} from "./emulator/types";
import styles from "./Emulator.module.css";

/**
 * The landing centerpiece: a simplified, wireframe-styled walk through the SINA
 * loop. Stage 1 shows the intent the agent emits, stage 2 the gate deciding,
 * stage 3 what actually reaches the user. Fintech runs against the REAL Edge
 * gate endpoint (`/api/gate`, scenario id only; §1b holds); healthcare and
 * defense play openly labeled canned simulations in the browser.
 */

const SETS: Record<Industry, readonly EmulatorScenario[]> = {
  fintech: FINTECH_SCENARIOS,
  healthcare: HEALTHCARE_SCENARIOS,
  defense: DEFENSE_SCENARIOS,
};

const DEFAULTS: Record<Industry, string> = {
  fintech: FINTECH_DEFAULT,
  healthcare: HEALTHCARE_DEFAULT,
  defense: DEFENSE_DEFAULT,
};

const BADGE_INTENT: Record<Verdict | "flag", "danger" | "warning" | "info"> = {
  reject: "danger",
  escalate: "warning",
  flag: "info",
  pass: "info",
};

type RunState =
  | { phase: "idle" }
  | { phase: "emitting" }
  | { phase: "gating" }
  | { phase: "verdict"; trace: EmulatorTrace }
  | { phase: "error"; message: string };

function isSimulated(scenario: EmulatorScenario): scenario is SimulatedScenario {
  return "result" in scenario;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Emulator() {
  const { industry } = useIndustry();
  const [selected, setSelected] = useState<Record<Industry, string>>({ ...DEFAULTS });
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const definition = INDUSTRIES[industry];
  const scenarios = SETS[industry];
  const scenario = scenarios.find((s) => s.id === selected[industry]) ?? scenarios[0];

  // Invalidate any in-flight run (stale results are discarded by run-id check).
  function cancel() {
    runIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
  }

  // Switching industry resets the run; unmount aborts outstanding work.
  useEffect(() => {
    cancel();
    setState({ phase: "idle" });
  }, [industry]);
  useEffect(() => cancel, []);

  if (!scenario) return null;

  function selectScenario(id: string) {
    cancel();
    setState({ phase: "idle" });
    setSelected((prev) => ({ ...prev, [industry]: id }));
  }

  async function run() {
    if (!scenario) return;
    cancel();
    const runId = runIdRef.current;
    const active = scenario;
    const reduced = prefersReducedMotion();

    setState({ phase: "emitting" });
    await sleep(reduced ? 0 : 600);
    if (runId !== runIdRef.current) return;

    setState({ phase: "gating" });
    if (isSimulated(active)) {
      const trace = await simulate(active, reduced);
      if (runId !== runIdRef.current) return;
      setState({ phase: "verdict", trace });
    } else {
      const controller = new AbortController();
      abortRef.current = controller;
      const outcome = await runFintechScenario(active, controller.signal);
      if (runId !== runIdRef.current) return;
      setState(
        outcome.ok
          ? { phase: "verdict", trace: outcome.trace }
          : { phase: "error", message: outcome.message },
      );
    }
  }

  const running = state.phase === "emitting" || state.phase === "gating";
  const trace = state.phase === "verdict" ? state.trace : null;

  const verdictHeader: Record<Verdict, string> = {
    pass: copy.verdictPass,
    escalate: copy.verdictEscalate,
    reject: copy.verdictReject,
  };

  const status =
    state.phase === "emitting"
      ? copy.gateEmitting
      : state.phase === "gating"
        ? copy.gateChecking
        : state.phase === "verdict"
          ? `${copy.stages.verdict.slice(3)}: ${verdictHeader[state.trace.verdict]}`
          : state.phase === "error"
            ? copy.transportTitle
            : "";

  return (
    <div className={styles.emulator}>
      <fieldset className={styles.chips}>
        <legend className={styles.legend}>{copy.pickLabel}</legend>
        <div className={styles.chipRow}>
          {scenarios.map((s) => (
            <label key={s.id} className={styles.chip} data-selected={s.id === scenario.id || undefined}>
              <input
                className={styles.chipInput}
                type="radio"
                name="sina-emulator-scenario"
                value={s.id}
                checked={s.id === scenario.id}
                onChange={() => selectScenario(s.id)}
              />
              <span className={styles.chipLabel}>{s.chip}</span>
              <span className={styles.chipHint}>{copy.expected[s.expected]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.controls}>
        <Button
          variant="primary"
          size="md"
          iconLeft={<Play weight="bold" />}
          loading={running}
          onClick={() => void run()}
        >
          {running ? copy.running : copy.run}
        </Button>
      </div>

      {/* Screen-reader narration of the run; rendered permanently so the live
          region exists before its content changes. */}
      <VisuallyHidden>
        <p role="status">{status}</p>
      </VisuallyHidden>

      <div className={styles.stages}>
        <div className={styles.stage}>
          <h3 className={styles.stageTitle}>{copy.stages.intent}</h3>
          <p className={styles.prompt}>
            <span className={styles.promptLabel}>{copy.intentUserLabel}</span>
            {scenario.prompt}
          </p>
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

        <div className={`${styles.stage} ${styles.gate}`}>
          <h3 className={styles.stageTitle}>{copy.stages.gate}</h3>
          <p className={styles.gateMode} data-live={definition.live || undefined}>
            {definition.live ? copy.gateLive : copy.gateSimulated}
          </p>
          {state.phase === "idle" || state.phase === "error" ? (
            <p className={styles.gateBody}>{copy.gateIdle}</p>
          ) : null}
          {state.phase === "emitting" ? (
            <p className={styles.gateBody} data-busy>
              {copy.gateEmitting}&hellip;
            </p>
          ) : null}
          {state.phase === "gating" ? (
            <p className={styles.gateBody} data-busy>
              {copy.gateChecking}&hellip;
            </p>
          ) : null}
          {trace ? (
            <div className={styles.decision}>
              <p className={styles.gateVerdict} data-verdict={trace.verdict}>
                {copy.gateVerdict[trace.verdict]}
              </p>
              <p className={styles.latency}>
                {trace.latencyMs} ms {copy.latency}
                {trace.simulated ? ` (${copy.latencySimulated})` : ""}
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
            </div>
          ) : null}
        </div>

        <div className={styles.stage}>
          <h3 className={styles.stageTitle}>{copy.stages.verdict}</h3>
          {state.phase === "error" ? (
            <div className={styles.verdictBody}>
              <Alert variant="warning" title={copy.transportTitle}>
                {copy.transportBody}
              </Alert>
              <div className={styles.retryRow}>
                <Button variant="secondary" size="sm" onClick={() => void run()}>
                  {copy.retry}
                </Button>
              </div>
            </div>
          ) : trace ? (
            <VerdictView trace={trace} />
          ) : (
            <p className={styles.verdictIdle}>{copy.verdictIdle}</p>
          )}
        </div>
      </div>
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
