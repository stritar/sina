/**
 * ActivityFeed — a SINA presentational fintech component (ungoverned).
 * Renders the validated `activity_feed` payload: a timeline of recent account
 * events, each a kind Badge + title + date, with optional detail. Read-only;
 * free text renders as text (never HTML). Brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatDate } from "../format.js";
import styles from "./ActivityFeed.module.css";

export interface ActivityFeedProps {
  /** The server-validated `activity_feed` payload (`IntentProps<"activity_feed">` in `@sina-design-system/fintech`). */
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
      className={styles.card}
    >
      {items.length === 0 ? (
        <p className={styles.empty}>No recent activity.</p>
      ) : (
        <Stack
          as="ul"
          gap={0}
          aria-label="Recent activity"
          className={styles.list}
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
                className={styles.row}
              >
                <Badge intent={intent} size="sm">
                  {item.kind}
                </Badge>
                <span className={styles.titleCol}>
                  <span className={styles.title}>{item.title}</span>
                  {item.detail ? (
                    <span className={styles.detail}>{item.detail}</span>
                  ) : null}
                </span>
                <span className={styles.date}>
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
