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
          <span className={styles.mono}>valid={String(governed)}</span>
        </Badge>
        <Badge intent={violations ? (governed ? "warning" : "danger") : "neutral"} size="sm">
          <span className={styles.mono}>
            {violations} violation{violations === 1 ? "" : "s"}
          </span>
        </Badge>
        <Badge intent="neutral" size="sm">
          <span className={styles.mono}>{trace.latencyMs.toFixed(1)} ms</span>
        </Badge>
      </div>
    </div>
  );
}
