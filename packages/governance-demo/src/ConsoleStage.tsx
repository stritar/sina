"use client";

/**
 * ConsoleStage — one span row on the interception timeline. A status node on a
 * vertical rail, a title + latency chip, and expandable detail (a CodeBlock or
 * violation rows). Modeled on the span-hierarchy idiom of agent-observability
 * devtools.
 */

import { useState, type ReactNode } from "react";
import { Badge } from "@sina-design-system/core";
import {
  CaretDown,
  CaretRight,
  CheckCircle,
  Info,
  Warning,
  WarningOctagon,
} from "@phosphor-icons/react/dist/ssr";
import styles from "./ConsoleStage.module.css";

export type StageStatus = "pass" | "fail" | "flag" | "info";

const NODE: Record<StageStatus, { Icon: typeof CheckCircle; className: string | undefined }> = {
  pass: { Icon: CheckCircle, className: styles.nodePass },
  fail: { Icon: WarningOctagon, className: styles.nodeFail },
  flag: { Icon: Warning, className: styles.nodeFlag },
  info: { Icon: Info, className: styles.nodeInfo },
};

export function ConsoleStage({
  status,
  title,
  latencyMs,
  defaultOpen = false,
  last = false,
  children,
}: {
  status: StageStatus;
  title: string;
  latencyMs?: number;
  defaultOpen?: boolean;
  /** Suppress the connector tail on the final stage. */
  last?: boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { Icon, className } = NODE[status];
  const hasDetail = Boolean(children);

  return (
    <div className={styles.root}>
      {/* rail */}
      {!last && <span aria-hidden className={styles.rail} />}
      {/* status node */}
      <span className={styles.nodeSlot}>
        <Icon weight="regular" className={[styles.node, className].filter(Boolean).join(" ")} aria-hidden />
      </span>

      <div className={styles.body}>
        {hasDetail ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={styles.toggle}
          >
            {open ? (
              <CaretDown weight="regular" className={styles.caret} aria-hidden />
            ) : (
              <CaretRight weight="regular" className={styles.caret} aria-hidden />
            )}
            <span className={styles.title}>{title}</span>
            {latencyMs != null && (
              <Badge intent="neutral" size="sm">
                {latencyMs.toFixed(1)} ms
              </Badge>
            )}
          </button>
        ) : (
          <div className={styles.staticTitle}>
            <span className={styles.title}>{title}</span>
            {latencyMs != null && (
              <Badge intent="neutral" size="sm">
                {latencyMs.toFixed(1)} ms
              </Badge>
            )}
          </div>
        )}

        {hasDetail && open && <div className={styles.detail}>{children}</div>}
      </div>
    </div>
  );
}
