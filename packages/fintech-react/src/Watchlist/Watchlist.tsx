/**
 * Watchlist — a SINA presentational fintech component (ungoverned).
 * Renders the validated `watchlist` payload: tracked instruments with price and a
 * signed day-change Badge. Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatAmount, formatPct, readWatchlist } from "../format.js";

export interface WatchlistProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function Watchlist({ payload }: WatchlistProps) {
  const items = readWatchlist(payload);

  return (
    <Stack
      gap={3}
      aria-label="Watchlist"
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      {items.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">Your watchlist is empty.</p>
      ) : (
        <Stack as="ul" gap={0} className="divide-y divide-border-subtle">
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
                className="py-2"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-ui font-medium text-text">{w.symbol}</span>
                  <span className="truncate text-xs text-text-muted">{w.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-ui font-semibold text-text">
                    {formatAmount(w.price, w.currency)}
                  </span>
                  <Badge intent={up ? "success" : "danger"} size="sm">
                    {formatPct(w.changePct)}
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
