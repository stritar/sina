"use client";

/**
 * DecisionSummary — the console header band: the headline verdict (GOVERNED /
 * BLOCKED) plus the at-a-glance metrics (valid · violations · gate latency).
 */

import { Badge } from "@sina-design-system/core";
import type { GateTrace } from "./gate";
import styles from "./DecisionSummary.module.css";

export function DecisionSummary({ trace }: { trace: GateTrace }) {
  const governed = trace.result.valid;
  const violations = trace.result.violations.length;

  return (
    <div
      className={[styles.root, governed ? styles.governed : styles.blocked]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[styles.verdict, governed ? styles.verdictGoverned : styles.verdictBlocked]
          .filter(Boolean)
          .join(" ")}
      >
        {governed ? "GOVERNED" : "BLOCKED"}
      </span>
      <div className={styles.metrics}>
        <Badge intent="neutral" size="sm">
          valid={String(governed)}
        </Badge>
        <Badge intent={violations ? (governed ? "warning" : "danger") : "neutral"} size="sm">
          {violations} violation{violations === 1 ? "" : "s"}
        </Badge>
        <Badge intent="neutral" size="sm">
          {trace.latencyMs.toFixed(1)} ms
        </Badge>
      </div>
    </div>
  );
}
