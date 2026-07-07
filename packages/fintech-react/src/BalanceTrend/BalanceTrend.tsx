/**
 * BalanceTrend — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `balance_trend` payload the gate already passed: a masked
 * account, a `KpiStat` headline (latest balance + change vs the start of the
 * window), and an interactive `LineChart` over the point series (visible points +
 * hover tooltip). It carries NO governance logic and offers no write action — any
 * action must emit a NEW intent through the gate via `onIntent`, never a raw
 * button. The account label renders as TEXT (never `dangerouslySetInnerHTML`),
 * neutralising any markup a tool might have returned. The chart's canvas is
 * `aria-hidden` and its tooltip is mouse-only, so the KpiStat text carries the
 * data. Brand-open tokens only.
 *
 * Client component: the interactive chart needs the browser (and we pass a
 * `valueFormatter` function to it, which cannot cross the RSC boundary). The gate
 * still runs server-side — this only renders the decision it already made.
 */

"use client";

import type { IntentEnvelope } from "@sina-design-system/governance";
import { KpiStat, LineChart, Stack } from "@sina-design-system/core";

import { formatAmount, formatDate } from "../format.js";
import styles from "./BalanceTrend.module.css";

export interface BalanceTrendProps {
  /** The server-validated `balance_trend` payload. */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers. The host feeds
   * it back through the gate. Unused in the proving slice — the display stays
   * read-only until an action intent exists.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface TrendPointView {
  date: string;
  balance: number;
}

interface BalanceTrendView {
  account: { label: string; maskedNumber: string };
  currency: string;
  points: TrendPointView[];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read a balance trend off a (server-validated) payload, tolerating a hostile shape. */
function readBalanceTrend(payload: unknown): BalanceTrendView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const account = (data.account ?? {}) as Record<string, unknown>;
  const rawPoints = Array.isArray(data.points) ? data.points : [];
  return {
    account: { label: str(account.label, "—"), maskedNumber: str(account.maskedNumber) },
    currency: str(data.currency, "USD"),
    points: rawPoints.map((row) => {
      const point = (row ?? {}) as Record<string, unknown>;
      return { date: str(point.date), balance: num(point.balance) };
    }),
  };
}

export function BalanceTrend({ payload }: BalanceTrendProps) {
  const { account, currency, points } = readBalanceTrend(payload);
  const latest = points.length > 0 ? points[points.length - 1] : undefined;
  const first = points.length > 0 ? points[0] : undefined;

  return (
    <Stack
      gap={3}
      aria-label={`Balance trend for ${account.label}`}
      className={styles.card}
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className={styles.accountLabel}>{account.label}</span>
        {account.maskedNumber ? (
          <span className={styles.maskedNumber}>{account.maskedNumber}</span>
        ) : null}
      </Stack>

      {latest ? (
        <>
          <KpiStat
            size="lg"
            value={latest.balance}
            comparisonValue={first?.balance}
            comparisonLabel="since start of period"
            showChangeAsPercentage
            valueFormatter={(v) => formatAmount(v, currency)}
          />
          <div className={styles.chart}>
            <LineChart
              data={{
                labels: points.map((point) => formatDate(point.date)),
                datasets: [{ label: "Balance", data: points.map((point) => point.balance) }],
              }}
              label={`Balance trend, ${points.length} points`}
              valueFormatter={(v) => formatAmount(v, currency)}
            />
          </div>
        </>
      ) : (
        <p className={styles.empty}>No trend data.</p>
      )}
    </Stack>
  );
}
