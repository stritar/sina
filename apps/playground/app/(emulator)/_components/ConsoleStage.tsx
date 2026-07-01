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
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

export type StageStatus = "pass" | "fail" | "flag" | "info";

const NODE: Record<StageStatus, { Icon: typeof CheckCircle; className: string }> = {
  pass: { Icon: CheckCircle, className: "text-success" },
  fail: { Icon: WarningCircle, className: "text-danger" },
  flag: { Icon: Warning, className: "text-warning" },
  info: { Icon: Info, className: "text-text-muted" },
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
    <div className="relative pl-7">
      {/* rail */}
      {!last && (
        <span aria-hidden className="absolute left-[9px] top-6 bottom-0 w-px bg-border" />
      )}
      {/* status node */}
      <span className="absolute left-0 top-0.5">
        <Icon className={`size-control-sm ${className}`} aria-hidden />
      </span>

      <div className="pb-4">
        {hasDetail ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center gap-1.5 rounded-sm text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
          >
            {open ? (
              <CaretDown className="size-control-2xs text-text-muted" aria-hidden />
            ) : (
              <CaretRight className="size-control-2xs text-text-muted" aria-hidden />
            )}
            <span className="text-ui font-medium text-text">{title}</span>
            {latencyMs != null && (
              <Badge intent="neutral" size="sm">
                <span className="font-mono">{latencyMs.toFixed(1)} ms</span>
              </Badge>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-ui font-medium text-text">{title}</span>
            {latencyMs != null && (
              <Badge intent="neutral" size="sm">
                <span className="font-mono">{latencyMs.toFixed(1)} ms</span>
              </Badge>
            )}
          </div>
        )}

        {hasDetail && open && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}
