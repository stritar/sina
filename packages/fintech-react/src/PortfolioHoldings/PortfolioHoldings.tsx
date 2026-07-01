/**
 * PortfolioHoldings — a SINA presentational fintech component (ungoverned).
 * Renders the validated `portfolio_holdings` payload: positions with value and a
 * signed day-change Badge (sign carries meaning, not color alone). Read-only.
 * Placing a trade is a governed flow (a new intent), not a button here.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatAmount, formatPct, readPortfolioHoldings } from "../format.js";

export interface PortfolioHoldingsProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function PortfolioHoldings({ payload }: PortfolioHoldingsProps) {
  const { currency, totalValue, holdings } = readPortfolioHoldings(payload);

  return (
    <Stack
      gap={3}
      aria-label="Portfolio holdings"
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className="text-ui font-medium text-text">Portfolio</span>
        <span className="text-ui font-semibold text-text">{formatAmount(totalValue, currency)}</span>
      </Stack>

      {holdings.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No holdings to show.</p>
      ) : (
        <Stack as="ul" gap={0} className="divide-y divide-border-subtle">
          {holdings.map((h) => {
            const up = h.changePct >= 0;
            return (
              <Stack
                as="li"
                key={h.symbol}
                direction="row"
                justify="between"
                align="center"
                gap={3}
                className="py-2"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-ui font-medium text-text">{h.symbol}</span>
                  <span className="truncate text-xs text-text-muted">
                    {h.name} · {h.quantity}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-ui font-semibold text-text">
                    {formatAmount(h.value, currency)}
                  </span>
                  <Badge intent={up ? "success" : "danger"} size="sm">
                    {formatPct(h.changePct)}
                  </Badge>
                </span>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
