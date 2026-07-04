"use client";

/**
 * ConsoleTimeline — the interception X-ray. From a `ConsoleView` it renders the
 * real gate pipeline (intent → schema → policy → decision → audit) or a
 * transport state. Every value shown is the actual `GateTrace` / emitted
 * `AuditEvent` — not a mock of them.
 */

import { Alert, Badge, Separator } from "@sina-design-system/core";
import type { Violation } from "@sina-design-system/governance";
import type { ConsoleView } from "../_lib/types";
import { pretty } from "../_lib/format";
import { CodeBlock } from "./CodeBlock";
import { ConsoleStage } from "./ConsoleStage";
import { DecisionSummary } from "./DecisionSummary";
import { ServerBoundary } from "./ServerBoundary";
import styles from "./ConsoleTimeline.module.css";

function severityIntent(severity: Violation["severity"]): "danger" | "warning" | "neutral" {
  if (severity === "reject" || severity === "escalate") return "danger";
  if (severity === "flag") return "warning";
  return "neutral";
}

function ViolationRow({ violation }: { violation: Violation }) {
  return (
    <div className={styles.violationRow}>
      <div className={styles.violationHead}>
        <Badge intent={severityIntent(violation.severity)} size="sm">
          <span className={styles.mono}>{violation.severity}</span>
        </Badge>
        <span className={styles.violationCode}>{violation.code}</span>
      </div>
      <p className={styles.violationMessage}>{violation.message}</p>
      {violation.standard && (
        <p className={styles.violationStandard}>{violation.standard}</p>
      )}
    </div>
  );
}

export function ConsoleTimeline({ view }: { view: ConsoleView }) {
  if (view.kind === "idle") {
    return (
      <div className={styles.centered}>
        <p className={styles.mutedSubtle}>
          Run a scenario to inspect the governance gate.
        </p>
      </div>
    );
  }

  if (view.kind === "transport") {
    return (
      <div className={styles.panel}>
        <ServerBoundary />
        <Alert variant="warning" title="Transport error — the gate did not run">
          <span className={styles.monoXs}>{view.error.reason}</span> — {view.error.message}
        </Alert>
        <p className={styles.mutedSubtle}>
          This is a model / transport failure, not a governance decision. Retry from the composer.
        </p>
      </div>
    );
  }

  if (view.kind === "experience") {
    return (
      <div className={styles.panel}>
        <ServerBoundary />
        <p className={styles.note}>
          Composed experience — {view.traces.length} intents, each gated independently.
        </p>
        <Separator className={styles.separator} />
        {view.traces.map((trace, i) => (
          <div key={i} className={styles.experienceRow}>
            <span className={styles.intent}>{trace.intent}</span>
            <span className={styles.rowRight}>
              {trace.mount ? (
                <span className={styles.mount}>{trace.mount}</span>
              ) : null}
              <Badge intent={trace.result.valid ? "success" : "danger"} size="sm">
                {trace.result.valid ? "mounted" : "blocked"}
              </Badge>
            </span>
          </div>
        ))}
      </div>
    );
  }

  const { trace } = view;
  const schemaFailed = trace.schemaViolations.length > 0;
  const policyStatus = schemaFailed
    ? "info"
    : trace.policyViolations.some((v) => v.severity === "escalate" || v.severity === "reject")
      ? "fail"
      : trace.policyViolations.length > 0
        ? "flag"
        : "pass";

  return (
    <div className={styles.panel}>
      <DecisionSummary trace={trace} />
      <ServerBoundary />
      <Separator className={styles.separator} />

      <ConsoleStage status="info" title="Intent received" defaultOpen>
        <CodeBlock title={`intent · ${trace.intent}`} code={pretty(trace.payload)} maxLines={14} />
      </ConsoleStage>

      <ConsoleStage
        status={schemaFailed ? "fail" : "pass"}
        title={schemaFailed ? "Schema gate · rejected" : "Schema gate · passed"}
        defaultOpen={schemaFailed}
      >
        {schemaFailed ? (
          <div className={styles.stack}>
            {trace.schemaViolations.map((v, i) => (
              <ViolationRow key={i} violation={v} />
            ))}
          </div>
        ) : (
          <p className={styles.note}>
            `.strict()` structure + ISO format checks passed — no smuggled keys.
          </p>
        )}
      </ConsoleStage>

      <ConsoleStage
        status={policyStatus}
        title={
          schemaFailed
            ? "Policy · not evaluated"
            : trace.policyViolations.length > 0
              ? "Policy · flagged"
              : "Policy · clean"
        }
        defaultOpen={!schemaFailed && trace.policyViolations.length > 0}
      >
        {schemaFailed ? (
          <p className={styles.note}>Skipped — the payload was rejected at the schema gate.</p>
        ) : trace.policyViolations.length > 0 ? (
          <div className={styles.stack}>
            {trace.policyViolations.map((v, i) => (
              <ViolationRow key={i} violation={v} />
            ))}
          </div>
        ) : (
          <p className={styles.note}>No regulatory or limit bands tripped.</p>
        )}
      </ConsoleStage>

      <ConsoleStage
        status={trace.result.valid ? "pass" : "fail"}
        title="Decision"
        latencyMs={trace.latencyMs}
        defaultOpen
      >
        <CodeBlock
          title="InterceptionResult"
          code={pretty({
            valid: trace.result.valid,
            requiredComponent: trace.result.requiredComponent,
            violations: trace.result.violations.length,
          })}
        />
      </ConsoleStage>

      <ConsoleStage status="info" title="Audit event · redacted" last>
        {trace.audit ? (
          <div className={styles.stack}>
            <CodeBlock title="AuditEvent" code={pretty(trace.audit)} maxLines={12} />
            <p className={styles.redaction}>
              redaction: card fields dropped · iban / accountNumber hashed
            </p>
          </div>
        ) : (
          <p className={styles.note}>No audit event captured.</p>
        )}
      </ConsoleStage>
    </div>
  );
}
