/**
 * UpcomingPayments — a SINA presentational fintech component (ungoverned).
 * Renders the validated `upcoming_payments` payload: scheduled/pending/overdue
 * payments with a due date and a status Badge. Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";
import type { BadgeProps } from "@sina-design-system/core";

import { formatAmount, formatDate, readUpcomingPayments } from "../format.js";

export interface UpcomingPaymentsProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

const STATUS_INTENT: Record<string, NonNullable<BadgeProps["intent"]>> = {
  scheduled: "info",
  pending: "warning",
  overdue: "danger",
};

export function UpcomingPayments({ payload }: UpcomingPaymentsProps) {
  const { currency, payments } = readUpcomingPayments(payload);

  return (
    <Stack
      gap={3}
      aria-label="Upcoming payments"
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      {payments.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No upcoming payments.</p>
      ) : (
        <Stack as="ul" gap={0} className="divide-y divide-border-subtle">
          {payments.map((p) => (
            <Stack
              as="li"
              key={p.id}
              direction="row"
              justify="between"
              align="center"
              gap={3}
              className="py-2"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-ui font-medium text-text">{p.payee}</span>
                <span className="text-xs text-text-subtle">due {formatDate(p.dueAt)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-ui font-semibold text-text">
                  {formatAmount(p.amount, currency)}
                </span>
                <Badge intent={STATUS_INTENT[p.status] ?? "neutral"} size="sm">
                  {p.status}
                </Badge>
              </span>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
