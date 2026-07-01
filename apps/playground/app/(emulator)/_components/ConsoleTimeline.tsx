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

function severityIntent(severity: Violation["severity"]): "danger" | "warning" | "neutral" {
  if (severity === "reject" || severity === "escalate") return "danger";
  if (severity === "flag") return "warning";
  return "neutral";
}

function ViolationRow({ violation }: { violation: Violation }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface p-2.5">
      <div className="flex items-center gap-1.5">
        <Badge intent={severityIntent(violation.severity)} size="sm">
          <span className="font-mono">{violation.severity}</span>
        </Badge>
        <span className="font-mono text-xs text-text-muted">{violation.code}</span>
      </div>
      <p className="text-ui text-text">{violation.message}</p>
      {violation.standard && (
        <p className="font-mono text-xs text-text-subtle">{violation.standard}</p>
      )}
    </div>
  );
}

export function ConsoleTimeline({ view }: { view: ConsoleView }) {
  if (view.kind === "idle") {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-ui text-text-subtle">
          Run a scenario to inspect the governance gate.
        </p>
      </div>
    );
  }

  if (view.kind === "transport") {
    return (
      <div className="flex flex-col gap-3 p-4">
        <ServerBoundary />
        <Alert variant="warning" title="Transport error — the gate did not run">
          <span className="font-mono text-xs">{view.error.reason}</span> — {view.error.message}
        </Alert>
        <p className="text-ui text-text-subtle">
          This is a model / transport failure, not a governance decision. Retry from the composer.
        </p>
      </div>
    );
  }

  if (view.kind === "experience") {
    return (
      <div className="flex flex-col gap-3 p-4">
        <ServerBoundary />
        <p className="text-ui text-text-muted">
          Composed experience — {view.traces.length} intents, each gated independently.
        </p>
        <Separator className="my-1" />
        {view.traces.map((trace, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface p-2.5"
          >
            <span className="font-mono text-xs text-text-muted">{trace.intent}</span>
            <span className="flex items-center gap-2">
              {trace.mount ? (
                <span className="font-mono text-xs text-text">{trace.mount}</span>
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
    <div className="flex flex-col gap-3 p-4">
      <DecisionSummary trace={trace} />
      <ServerBoundary />
      <Separator className="my-1" />

      <ConsoleStage status="info" title="Intent received" defaultOpen>
        <CodeBlock title={`intent · ${trace.intent}`} code={pretty(trace.payload)} maxLines={14} />
      </ConsoleStage>

      <ConsoleStage
        status={schemaFailed ? "fail" : "pass"}
        title={schemaFailed ? "Schema gate · rejected" : "Schema gate · passed"}
        defaultOpen={schemaFailed}
      >
        {schemaFailed ? (
          <div className="flex flex-col gap-2">
            {trace.schemaViolations.map((v, i) => (
              <ViolationRow key={i} violation={v} />
            ))}
          </div>
        ) : (
          <p className="text-ui text-text-muted">
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
          <p className="text-ui text-text-muted">Skipped — the payload was rejected at the schema gate.</p>
        ) : trace.policyViolations.length > 0 ? (
          <div className="flex flex-col gap-2">
            {trace.policyViolations.map((v, i) => (
              <ViolationRow key={i} violation={v} />
            ))}
          </div>
        ) : (
          <p className="text-ui text-text-muted">No regulatory or limit bands tripped.</p>
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
          <div className="flex flex-col gap-2">
            <CodeBlock title="AuditEvent" code={pretty(trace.audit)} maxLines={12} />
            <p className="font-mono text-xs text-text-subtle">
              redaction: card fields dropped · iban / accountNumber hashed
            </p>
          </div>
        ) : (
          <p className="text-ui text-text-muted">No audit event captured.</p>
        )}
      </ConsoleStage>
    </div>
  );
}
