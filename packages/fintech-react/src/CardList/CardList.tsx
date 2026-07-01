/**
 * CardList — a SINA presentational fintech component (ungoverned).
 * Renders the validated `list_cards` payload as a Grid of card tiles with a
 * masked number (never a full PAN) and a status Badge. Read-only; brand-open
 * tokens. Freezing/cancelling a card is a governed flow (a new intent), not a
 * button here.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Grid, Stack } from "@sina-design-system/core";
import type { BadgeProps } from "@sina-design-system/core";

import { readCardList } from "../format.js";

export interface CardListProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

const STATUS_INTENT: Record<string, NonNullable<BadgeProps["intent"]>> = {
  active: "success",
  frozen: "warning",
  cancelled: "neutral",
};

export function CardList({ payload }: CardListProps) {
  const cards = readCardList(payload);

  if (cards.length === 0) {
    return (
      <div
        aria-label="Cards"
        className="rounded-lg border border-border-subtle bg-surface p-3"
      >
        <p className="py-6 text-center text-ui text-text-muted">No cards to show.</p>
      </div>
    );
  }

  return (
    <Grid aria-label="Cards" cols={2} gap={3}>
      {cards.map((c) => (
        <Stack
          key={c.id}
          gap={2}
          className="rounded-lg border border-border-subtle bg-surface p-3"
        >
          <Stack direction="row" justify="between" align="center" gap={2}>
            <span className="text-ui font-medium text-text">{c.label}</span>
            <Badge intent={STATUS_INTENT[c.status] ?? "neutral"} size="sm">
              {c.status}
            </Badge>
          </Stack>
          <span className="font-mono text-sm text-text">{c.maskedNumber}</span>
          <Stack direction="row" justify="between" align="center" gap={2}>
            <span className="text-xs uppercase text-text-subtle">{c.network}</span>
            <span className="text-xs text-text-subtle">exp {c.expiry}</span>
          </Stack>
        </Stack>
      ))}
    </Grid>
  );
}
