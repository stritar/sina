/**
 * BlockedState — the designed first-class moment when SINA drops a stream. A
 * danger card naming the violations (with citations) and the governed component
 * the gate forces in place of a raw confirm.
 */

import { Alert, Badge } from "@sina-design-system/core";
import type { GateTrace } from "../_lib/gate";
import type { Violation } from "@sina-design-system/governance";
import type { ConsoleView } from "../_lib/types";
import { resolveGovernedComponent } from "../_lib/registry";
import styles from "./BlockedState.module.css";

function severityIntent(severity: Violation["severity"]): "danger" | "warning" | "neutral" {
  if (severity === "reject" || severity === "escalate") return "danger";
  if (severity === "flag") return "warning";
  return "neutral";
}

export function BlockedState({
  trace,
  turnId,
  onApproved,
}: {
  trace: GateTrace;
  turnId?: string;
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
          <Governed trace={trace} turnId={turnId} onApproved={onApproved} />
        </div>
      )}
    </div>
  );
}
