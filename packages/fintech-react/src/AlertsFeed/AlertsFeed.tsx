/**
 * AlertsFeed — a SINA presentational fintech component (ungoverned).
 * Renders the validated `alerts_feed` payload: a time-ordered feed of account
 * alerts, each a severity Badge + title + date. Read-only; renders free text as
 * text (never HTML), so a hostile string is neutralised on display.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatDate } from "../format.js";

export interface AlertsFeedProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

type Severity = "info" | "warning" | "critical";

const SEVERITIES: readonly Severity[] = ["info", "warning", "critical"];

/** Severity → Badge intent (meaning carried by the label, not colour alone). */
const BADGE_INTENT: Record<Severity, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

interface AlertRowView {
  id: string;
  at: string;
  severity: Severity;
  title: string;
  body?: string;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && (SEVERITIES as readonly string[]).includes(value);
}

/** Read an alerts feed off a (server-validated) payload, tolerating a hostile shape. */
function readAlerts(payload: unknown): AlertRowView[] {
  const data = (payload ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.alerts) ? data.alerts : [];
  return list.map((raw, index) => {
    const a = (raw ?? {}) as Record<string, unknown>;
    return {
      id: str(a.id, `alert_${index}`),
      at: str(a.at),
      severity: isSeverity(a.severity) ? a.severity : "info",
      title: str(a.title, "—"),
      body: typeof a.body === "string" ? a.body : undefined,
    };
  });
}

export function AlertsFeed({ payload }: AlertsFeedProps) {
  const alerts = readAlerts(payload);

  return (
    <Stack
      gap={3}
      aria-label="Alerts"
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      {alerts.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No alerts.</p>
      ) : (
        <Stack as="ul" gap={0} aria-label="Alerts" className="divide-y divide-border-subtle">
          {alerts.map((a) => {
            const intent = BADGE_INTENT[a.severity];
            return (
              <Stack
                as="li"
                key={a.id}
                direction="row"
                justify="between"
                align="start"
                gap={3}
                className="py-2"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <Badge intent={intent} size="sm">
                      {a.severity}
                    </Badge>
                    <span className="truncate text-ui font-medium text-text">{a.title}</span>
                  </span>
                  {a.body ? (
                    <span className="truncate text-xs text-text-muted">{a.body}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs text-text-muted">{formatDate(a.at)}</span>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
