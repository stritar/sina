/**
 * ActivityFeed — a SINA presentational fintech component (ungoverned).
 * Renders the validated `activity_feed` payload: a timeline of recent account
 * events, each a kind Badge + title + date, with optional detail. Read-only;
 * free text renders as text (never HTML). Brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatDate } from "../format.js";

export interface ActivityFeedProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

type ActivityKind = "login" | "payment" | "transfer" | "alert" | "statement" | "card";
type BadgeIntent = "success" | "info" | "warning" | "neutral";

interface ActivityItemView {
  id: string;
  at: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
}

const KINDS: readonly ActivityKind[] = [
  "login",
  "payment",
  "transfer",
  "alert",
  "statement",
  "card",
];

const KIND_INTENT: Record<ActivityKind, BadgeIntent> = {
  login: "neutral",
  payment: "success",
  transfer: "info",
  alert: "warning",
  statement: "neutral",
  card: "neutral",
};

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Normalise a hostile/unknown `kind` to a known one rather than throwing. */
function readKind(value: unknown): ActivityKind {
  return typeof value === "string" && (KINDS as readonly string[]).includes(value)
    ? (value as ActivityKind)
    : "alert";
}

/** Read an activity feed off a (server-validated) payload, tolerating a hostile shape. */
function readActivityFeed(payload: unknown): ActivityItemView[] {
  const data = (payload ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(data.items) ? data.items : [];
  return rows.map((row, index) => {
    const item = (row ?? {}) as Record<string, unknown>;
    const detail = str(item.detail);
    return {
      id: str(item.id, `evt_${index}`),
      at: str(item.at),
      kind: readKind(item.kind),
      title: str(item.title, "—"),
      detail: detail === "" ? undefined : detail,
    };
  });
}

export function ActivityFeed({ payload }: ActivityFeedProps) {
  const items = readActivityFeed(payload);

  return (
    <Stack
      gap={3}
      aria-label="Activity feed"
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      {items.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No recent activity.</p>
      ) : (
        <Stack
          as="ul"
          gap={0}
          aria-label="Recent activity"
          className="divide-y divide-border-subtle"
        >
          {items.map((item) => {
            const intent = KIND_INTENT[item.kind];
            return (
              <Stack
                as="li"
                key={item.id}
                direction="row"
                align="start"
                gap={3}
                className="py-2"
              >
                <Badge intent={intent} size="sm">
                  {item.kind}
                </Badge>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-ui font-medium text-text">{item.title}</span>
                  {item.detail ? (
                    <span className="text-xs text-text-muted">{item.detail}</span>
                  ) : null}
                </span>
                <span className="ml-auto shrink-0 text-xs text-text-subtle">
                  {formatDate(item.at)}
                </span>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
