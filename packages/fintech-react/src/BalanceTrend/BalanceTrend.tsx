/**
 * BalanceTrend — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `balance_trend` payload the gate already passed: a masked
 * account, its latest balance, and a compact `Chart` sparkline over the point
 * series. It carries NO governance logic and offers no write action — any action
 * must emit a NEW intent through the gate via `onIntent`, never a raw button. The
 * account label renders as TEXT (never `dangerouslySetInnerHTML`), neutralising
 * any markup a tool might have returned. Brand-open tokens only.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Chart, Stack } from "@sina-design-system/core";

import { formatAmount } from "../format.js";

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

  return (
    <Stack
      gap={3}
      aria-label={`Balance trend for ${account.label}`}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className="text-ui font-medium text-text">{account.label}</span>
        {account.maskedNumber ? (
          <span className="font-mono text-xs text-text-subtle">{account.maskedNumber}</span>
        ) : null}
      </Stack>

      {latest ? (
        <span className="text-2xl font-semibold text-text">
          {formatAmount(latest.balance, currency)}
        </span>
      ) : (
        <p className="text-ui text-text-muted">No trend data</p>
      )}

      <div className="h-16 w-full text-primary">
        <Chart data={points.map((point) => point.balance)} label={`Balance trend, ${points.length} points`} />
      </div>
    </Stack>
  );
}
