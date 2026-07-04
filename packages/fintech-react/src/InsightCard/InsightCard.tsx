/**
 * InsightCard — a SINA presentational fintech component (ungoverned).
 * Renders the validated `insight` payload: a toned advisory with a title, body,
 * and an optional labelled metric Badge. Read-only; brand-open tokens.
 *
 * Free text renders as TEXT (never `dangerouslySetInnerHTML`), so markup a tool
 * returned is neutralised. SINA validates the payload's SHAPE, not the safety of
 * the app's own copy.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Alert, Badge, Stack } from "@sina-design-system/core";

import styles from "./InsightCard.module.css";

type Tone = "info" | "positive" | "caution";

/** Tone → core intent token (shared by the Alert variant and the metric Badge). */
const TONE_INTENT: Record<Tone, "info" | "success" | "warning"> = {
  info: "info",
  positive: "success",
  caution: "warning",
};

interface InsightView {
  tone: Tone;
  title: string;
  body: string;
  metricLabel?: string;
  metricValue?: string;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isTone(value: unknown): value is Tone {
  return value === "info" || value === "positive" || value === "caution";
}

/** Read a single insight off a (server-validated) payload, tolerating a hostile shape. */
function readInsight(payload: unknown): InsightView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const metricLabel = str(data.metricLabel);
  const metricValue = str(data.metricValue);
  return {
    tone: isTone(data.tone) ? data.tone : "info",
    title: str(data.title),
    body: str(data.body),
    metricLabel: metricLabel || undefined,
    metricValue: metricValue || undefined,
  };
}

export interface InsightCardProps {
  /** The server-validated `insight` payload. */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers. The host feeds
   * it back through the gate. Unused today — the display stays read-only.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function InsightCard({ payload }: InsightCardProps) {
  const insight = readInsight(payload);
  const hasContent = insight.title !== "" || insight.body !== "";
  const intent = TONE_INTENT[insight.tone];

  return (
    <Stack aria-label="Insight">
      {!hasContent ? (
        <p className={styles.empty}>No insight to show.</p>
      ) : (
        <Alert variant={intent} title={insight.title || undefined}>
          <Stack gap={2}>
            {insight.body ? <p>{insight.body}</p> : null}
            {insight.metricValue ? (
              <Stack direction="row" align="center" gap={2}>
                {insight.metricLabel ? (
                  <span className={styles.metricLabel}>{insight.metricLabel}</span>
                ) : null}
                <Badge intent={intent} size="sm">
                  {insight.metricValue}
                </Badge>
              </Stack>
            ) : null}
          </Stack>
        </Alert>
      )}
    </Stack>
  );
}
