/**
 * BlockedState — the designed first-class moment when SINA drops a stream. A
 * danger card naming the violations (with citations) and the governed component
 * the gate forces in place of a raw confirm.
 */

import { Alert, Badge } from "@sina-design-system/core";
import type { GateTrace } from "../_lib/gate";
import type { Violation } from "@sina-design-system/governance";
import { SecureWireDialogPlaceholder } from "./SecureWireDialogPlaceholder";

function severityIntent(severity: Violation["severity"]): "danger" | "warning" | "neutral" {
  if (severity === "reject" || severity === "escalate") return "danger";
  if (severity === "flag") return "warning";
  return "neutral";
}

export function BlockedState({ trace }: { trace: GateTrace }) {
  const blocking = trace.result.violations.filter(
    (v) => v.severity === "reject" || v.severity === "escalate",
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-danger/40 bg-surface p-3">
      <Alert variant="danger" title="Stream intercepted">
        SINA blocked the raw render — the payload violated the constitution.
      </Alert>

      <div className="flex flex-col gap-2">
        {blocking.map((violation, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Badge intent={severityIntent(violation.severity)} size="sm">
                <span className="font-mono">{violation.severity}</span>
              </Badge>
              <span className="text-ui text-text">{violation.message}</span>
            </div>
            {violation.standard && (
              <span className="pl-1 font-mono text-xs text-text-subtle">{violation.standard}</span>
            )}
          </div>
        ))}
      </div>

      {trace.result.requiredComponent === "SecureWireDialog" && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-surface-secure p-2.5">
          <span className="text-ui text-text-muted">
            Forced governed component:{" "}
            <span className="font-mono text-text">{trace.result.requiredComponent}</span>
          </span>
          <SecureWireDialogPlaceholder />
        </div>
      )}
    </div>
  );
}
