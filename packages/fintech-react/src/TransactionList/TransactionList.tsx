/**
 * TransactionList — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `list_transactions` payload the gate already passed.
 * It carries NO governance logic. Two rules it must keep:
 *
 *  1. **Read-only.** It offers no write action. Per SINA's "displays are
 *     read-only" rule, any action (e.g. "repeat this payment") must emit a NEW
 *     intent through the gate via `onIntent` — never a raw button. `onIntent` is
 *     unused in the proving slice; it exists so a later action doesn't smuggle a
 *     money-moving control past the constitution.
 *  2. **Text, never HTML.** Free-text fields (description, counterparty) render
 *     as text — never `dangerouslySetInnerHTML` — which neutralises markup a tool
 *     might have returned. SINA validates the payload's SHAPE and provenance, not
 *     the truthfulness or safety of the app's own data.
 *
 * Brand-open tokens only (ordinary UI that rebrands cleanly); the governed
 * "secure" visual language is reserved for escalations.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Stack } from "@sina-design-system/core";

import { formatAmount, formatDate, readTransactionList } from "../format.js";

export interface TransactionListProps {
  /** The server-validated `list_transactions` payload. */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers (e.g. repeat a
   * payment). The host feeds it back through the gate. Unused in the proving
   * slice — the display stays read-only until an action intent exists.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function TransactionList({ payload }: TransactionListProps) {
  const { account, transactions } = readTransactionList(payload);

  return (
    <Stack
      as="section"
      gap={3}
      aria-label={`Transactions for ${account.label}`}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <Stack as="header" direction="row" justify="between" align="center" gap={2}>
        <span className="text-ui font-medium text-text">{account.label}</span>
        {account.maskedNumber ? (
          <span className="font-mono text-xs text-text-subtle">{account.maskedNumber}</span>
        ) : null}
      </Stack>

      {transactions.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No transactions to show.</p>
      ) : (
        <Stack as="ul" gap={0} className="divide-y divide-border-subtle">
          {transactions.map((tx) => {
            const credit = tx.direction === "credit";
            const amount = formatAmount(tx.amount, tx.currency);
            return (
              <Stack
                as="li"
                key={tx.id}
                direction="row"
                justify="between"
                align="center"
                gap={3}
                className="py-2"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-ui font-medium text-text">{tx.counterparty}</span>
                  <span className="truncate text-xs text-text-muted">{tx.description}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <span
                    aria-label={`${credit ? "credit" : "debit"} ${amount}`}
                    className={
                      credit
                        ? "text-ui font-semibold text-success"
                        : "text-ui font-semibold text-text"
                    }
                  >
                    {credit ? "+" : "−"}
                    {amount}
                  </span>
                  <span className="text-xs text-text-subtle">{formatDate(tx.postedAt)}</span>
                </span>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
