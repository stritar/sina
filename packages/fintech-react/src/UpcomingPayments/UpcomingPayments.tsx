/**
 * UpcomingPayments — a SINA presentational fintech component (ungoverned).
 * Renders the validated `upcoming_payments` payload: scheduled/pending/overdue
 * payments with a due date and a status Badge. Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";
import type { BadgeProps } from "@sina-design-system/core";

import { formatAmount, formatDate, readUpcomingPayments } from "../format.js";
import styles from "./UpcomingPayments.module.css";

export interface UpcomingPaymentsProps {
  /** The server-validated `upcoming_payments` payload (`IntentProps<"upcoming_payments">` in `@sina-design-system/fintech`). */
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
    <Stack gap={3} aria-label="Upcoming payments" className={styles.card}>
      {payments.length === 0 ? (
        <p className={styles.empty}>No upcoming payments.</p>
      ) : (
        <Stack as="ul" gap={0} className={styles.list}>
          {payments.map((p) => (
            <Stack
              as="li"
              key={p.id}
              direction="row"
              justify="between"
              align="center"
              gap={3}
              className={styles.row}
            >
              <span className={styles.info}>
                <span className={styles.payee}>{p.payee}</span>
                <span className={styles.due}>due {formatDate(p.dueAt)}</span>
              </span>
              <span className={styles.meta}>
                <span className={styles.amount}>{formatAmount(p.amount, currency)}</span>
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
