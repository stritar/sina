/**
 * AssetDetail — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `asset_detail` payload the gate already passed: one
 * instrument's symbol, name, price, and signed day change in a `SummaryList`,
 * plus a compact `Chart` sparkline over its bounded price series. Read-only and
 * carries NO governance logic — any action must emit a NEW intent through the
 * gate via `onIntent`, never a raw button. Free text (symbol / name) renders as
 * TEXT (never `dangerouslySetInnerHTML`), neutralising any markup a tool returned.
 * Brand-open tokens only.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Chart, Stack, SummaryList, type SummaryItem } from "@sina-design-system/core";

import { formatAmount, formatPct } from "../format.js";

export interface AssetDetailProps {
  /** The server-validated `asset_detail` payload. */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers. The host feeds
   * it back through the gate. Unused in the read-only slice.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface AssetDetailView {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  changePct: number;
  points: number[];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read an asset detail off a (server-validated) payload, tolerating a hostile shape. */
function readAssetDetail(payload: unknown): AssetDetailView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const rawPoints = Array.isArray(data.points) ? data.points : [];
  return {
    symbol: str(data.symbol, "—"),
    name: str(data.name, "—"),
    price: num(data.price),
    currency: str(data.currency, "USD"),
    changePct: num(data.changePct),
    points: rawPoints.map((point) => num(point)),
  };
}

export function AssetDetail({ payload }: AssetDetailProps) {
  const { symbol, name, price, currency, changePct, points } = readAssetDetail(payload);

  const items: SummaryItem[] = [
    { label: "Symbol", value: symbol },
    { label: "Name", value: name },
    { label: "Price", value: formatAmount(price, currency), emphasis: true },
    { label: "Day change", value: formatPct(changePct) },
  ];

  return (
    <Stack
      gap={3}
      aria-label={`Asset detail for ${symbol}`}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <SummaryList items={items} />

      {points.length > 0 ? (
        <div className="h-12 w-full text-primary">
          <Chart data={points} label={`${symbol} price trend, ${points.length} points`} />
        </div>
      ) : (
        <p className="text-ui text-text-muted">No chart data</p>
      )}
    </Stack>
  );
}
