/**
 * Watchlist — a SINA presentational fintech component (ungoverned).
 * Renders the validated `watchlist` payload: tracked instruments with price and a
 * signed day-change Badge. Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatAmount, formatPct, readWatchlist } from "../format.js";
import { useFintechLocale } from "../locale.js";
import styles from "./Watchlist.module.css";

export interface WatchlistProps {
  /** The server-validated `watchlist` payload (`IntentProps<"watchlist">` in `@sina-design-system/fintech`). */
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
  /** BCP-47 locale for money/date formatting. Overrides `FintechLocaleProvider`; defaults to `en-US`. */
  locale?: string;
}

export function Watchlist({ payload, locale: localeProp }: WatchlistProps) {
  const locale = useFintechLocale(localeProp);
  const items = readWatchlist(payload);

  return (
    <Stack gap={3} aria-label="Watchlist" className={styles.card}>
      {items.length === 0 ? (
        <p className={styles.empty}>Your watchlist is empty.</p>
      ) : (
        <Stack as="ul" gap={0} className={styles.list}>
          {items.map((w) => {
            const up = w.changePct >= 0;
            return (
              <Stack
                as="li"
                key={w.symbol}
                direction="row"
                justify="between"
                align="center"
                gap={3}
                className={styles.row}
              >
                <span className={styles.info}>
                  <span className={styles.symbol}>{w.symbol}</span>
                  <span className={styles.sub}>{w.name}</span>
                </span>
                <span className={styles.meta}>
                  <span className={styles.price}>{formatAmount(w.price, w.currency, locale)}</span>
                  <Badge intent={up ? "success" : "danger"} size="sm">
                    {formatPct(w.changePct, locale)}
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
