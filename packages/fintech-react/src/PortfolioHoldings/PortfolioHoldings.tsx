/**
 * PortfolioHoldings — a SINA presentational fintech component (ungoverned).
 * Renders the validated `portfolio_holdings` payload: positions with value and a
 * signed day-change Badge (sign carries meaning, not color alone). Read-only.
 * Placing a trade is a governed flow (a new intent), not a button here.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatAmount, formatPct, readPortfolioHoldings } from "../format.js";
import styles from "./PortfolioHoldings.module.css";

export interface PortfolioHoldingsProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function PortfolioHoldings({ payload }: PortfolioHoldingsProps) {
  const { currency, totalValue, holdings } = readPortfolioHoldings(payload);

  return (
    <Stack gap={3} aria-label="Portfolio holdings" className={styles.card}>
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className={styles.title}>Portfolio</span>
        <span className={styles.amount}>{formatAmount(totalValue, currency)}</span>
      </Stack>

      {holdings.length === 0 ? (
        <p className={styles.empty}>No holdings to show.</p>
      ) : (
        <Stack as="ul" gap={0} className={styles.list}>
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
                className={styles.row}
              >
                <span className={styles.info}>
                  <span className={styles.symbol}>{h.symbol}</span>
                  <span className={styles.sub}>
                    {h.name} · {h.quantity}
                  </span>
                </span>
                <span className={styles.meta}>
                  <span className={styles.amount}>{formatAmount(h.value, currency)}</span>
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
