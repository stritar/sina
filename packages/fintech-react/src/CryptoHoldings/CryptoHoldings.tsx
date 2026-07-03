/**
 * CryptoHoldings — a SINA presentational fintech component (ungoverned).
 * Renders the validated `crypto_holdings` payload: a total-value header, a value
 * sparkline, and per-asset rows with quantity, value, and a signed day-change
 * Badge (sign carries meaning, not color alone). Read-only; brand-open tokens.
 * Trading a coin is a governed flow (a new intent), not a button here.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import type { SummaryItem } from "@sina-design-system/core";
import { Badge, Chart, Stack, SummaryList } from "@sina-design-system/core";

import { formatAmount, formatPct } from "../format.js";

export interface CryptoHoldingsProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface CryptoHoldingView {
  asset: string;
  name: string;
  quantity: number;
  value: number;
  changePct: number;
}

interface CryptoHoldingsView {
  currency: string;
  totalValue: number;
  holdings: CryptoHoldingView[];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map((row) => (row ?? {}) as Record<string, unknown>) : [];
}

/** Read crypto holdings off a (server-validated) payload, tolerating a hostile shape. */
function readCryptoHoldings(payload: unknown): CryptoHoldingsView {
  const data = (payload ?? {}) as Record<string, unknown>;
  return {
    currency: str(data.currency, "USD"),
    totalValue: num(data.totalValue),
    holdings: rows(data.holdings).map((holding, index) => ({
      asset: str(holding.asset, `A${index}`),
      name: str(holding.name, "—"),
      quantity: num(holding.quantity),
      value: num(holding.value),
      changePct: num(holding.changePct),
    })),
  };
}

export function CryptoHoldings({ payload }: CryptoHoldingsProps) {
  const { currency, totalValue, holdings } = readCryptoHoldings(payload);

  const items: SummaryItem[] = holdings.map((h) => {
    const up = h.changePct >= 0;
    return {
      label: (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-ui font-medium text-text">{h.asset}</span>
          <span className="truncate text-xs text-text-muted">
            {h.name} · {h.quantity}
          </span>
        </span>
      ),
      value: (
        <span className="flex shrink-0 items-center justify-end gap-2">
          <span className="text-ui font-semibold text-text">{formatAmount(h.value, currency)}</span>
          <Badge intent={up ? "success" : "danger"} size="sm">
            {formatPct(h.changePct)}
          </Badge>
        </span>
      ),
    };
  });

  return (
    <Stack
      gap={3}
      aria-label="Crypto holdings"
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className="text-ui font-medium text-text">Crypto holdings</span>
        <span className="text-ui font-semibold text-text">
          {formatAmount(totalValue, currency)}
        </span>
      </Stack>

      {holdings.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No crypto holdings to show.</p>
      ) : (
        <>
          <div className="h-12 w-full text-primary">
            <Chart
              variant="bar"
              data={holdings.map((h) => h.value)}
              label={`Value across ${holdings.length} holdings`}
            />
          </div>
          <SummaryList items={items} />
        </>
      )}
    </Stack>
  );
}
