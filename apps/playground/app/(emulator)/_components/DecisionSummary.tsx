"use client";

/**
 * DecisionSummary — the console header band: the headline verdict (GOVERNED /
 * BLOCKED) plus the at-a-glance metrics (valid · violations · gate latency).
 */

import { Badge } from "@sina-design-system/core";
import type { GateTrace } from "../_lib/gate";

export function DecisionSummary({ trace }: { trace: GateTrace }) {
  const governed = trace.result.valid;
  const violations = trace.result.violations.length;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ${
        governed ? "border-success/40 bg-success-bg" : "border-danger/40 bg-danger-bg"
      }`}
    >
      <span
        className={`font-mono text-sm font-semibold tracking-wide ${
          governed ? "text-success" : "text-danger"
        }`}
      >
        {governed ? "GOVERNED" : "BLOCKED"}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge intent="neutral" size="sm">
          <span className="font-mono">valid={String(governed)}</span>
        </Badge>
        <Badge intent={violations ? (governed ? "warning" : "danger") : "neutral"} size="sm">
          <span className="font-mono">
            {violations} violation{violations === 1 ? "" : "s"}
          </span>
        </Badge>
        <Badge intent="neutral" size="sm">
          <span className="font-mono">{trace.latencyMs.toFixed(1)} ms</span>
        </Badge>
      </div>
    </div>
  );
}
