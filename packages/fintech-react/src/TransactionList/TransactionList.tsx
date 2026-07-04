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

import clsx from "clsx";

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Stack } from "@sina-design-system/core";

import { formatAmount, formatDate, readTransactionList } from "../format.js";
import styles from "./TransactionList.module.css";

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
      gap={3}
      aria-label={`Transactions for ${account.label}`}
      className={styles.card}
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className={styles.accountLabel}>{account.label}</span>
        {account.maskedNumber ? (
          <span className={styles.accountNumber}>{account.maskedNumber}</span>
        ) : null}
      </Stack>

      {transactions.length === 0 ? (
        <p className={styles.empty}>No transactions to show.</p>
      ) : (
        <Stack as="ul" gap={0} className={styles.list}>
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
                className={styles.row}
              >
                <span className={styles.rowMain}>
                  <span className={styles.counterparty}>{tx.counterparty}</span>
                  <span className={styles.description}>{tx.description}</span>
                </span>
                <span className={styles.rowAside}>
                  <span
                    aria-label={`${credit ? "credit" : "debit"} ${amount}`}
                    className={clsx(
                      styles.amount,
                      credit ? styles.amountCredit : styles.amountDebit,
                    )}
                  >
                    {credit ? "+" : "−"}
                    {amount}
                  </span>
                  <span className={styles.date}>{formatDate(tx.postedAt)}</span>
                </span>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
