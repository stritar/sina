"use client";

/**
 * BlockedState — the designed first-class moment when SINA drops a stream. A danger
 * card naming the violations (with citations) and the governed component the gate
 * forces in place of a raw confirm.
 *
 * Note the shape: a TEXT-ONLY `Alert` with the severity `Badge`s in a SIBLING row
 * beneath it, never nested inside it. This is the canonical de-nested status pattern
 * the `status-nesting` guard is written against (see `/no-nested-status`).
 *
 * The forced component is `React.lazy` (the registry), so it renders inside a
 * `<Suspense>` — without a boundary an SSR suspend throws.
 */

import { Suspense } from "react";
import { Alert, Badge } from "@sina-design-system/core";
import type { Violation } from "@sina-design-system/governance";

import { resolveGovernedComponent } from "./registry.js";
import type { GateTrace } from "./gate.js";
import type { ConsoleView } from "./types.js";
import styles from "./BlockedState.module.css";

function severityIntent(severity: Violation["severity"]): "danger" | "warning" | "neutral" {
  if (severity === "reject" || severity === "escalate") return "danger";
  if (severity === "flag") return "warning";
  return "neutral";
}

export function BlockedState({
  trace,
  turnId,
  scenarioId,
  onApproved,
}: {
  trace: GateTrace;
  turnId?: string;
  scenarioId?: string;
  onApproved?: (turnId: string, view: ConsoleView) => void;
}) {
  const blocking = trace.result.violations.filter(
    (v) => v.severity === "reject" || v.severity === "escalate",
  );
  const Governed = resolveGovernedComponent(trace.result.requiredComponent);

  return (
    <div className={styles.root}>
      <Alert variant="danger" title="Stream intercepted">
        SINA blocked the raw render — the payload violated the constitution.
      </Alert>

      <div className={styles.violations}>
        {blocking.map((violation, i) => (
          <div key={i} className={styles.violation}>
            <div className={styles.violationHead}>
              <Badge intent={severityIntent(violation.severity)} size="sm">
                <span className={styles.mono}>{violation.severity}</span>
              </Badge>
              <span className={styles.message}>{violation.message}</span>
            </div>
            {violation.standard && (
              <span className={styles.standard}>{violation.standard}</span>
            )}
          </div>
        ))}
      </div>

      {Governed && (
        <div className={styles.governedRow}>
          <span className={styles.governedLabel}>
            Forced governed component:{" "}
            <span className={styles.governedName}>{trace.result.requiredComponent}</span>
          </span>
          <Suspense fallback={null}>
            <Governed
              trace={trace}
              turnId={turnId}
              scenarioId={scenarioId}
              onApproved={onApproved}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
