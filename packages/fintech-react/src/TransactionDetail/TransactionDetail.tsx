/**
 * TransactionDetail — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `transaction_detail` payload the gate already passed: a
 * single posted transaction's terms (formatted amount, direction + status
 * Badges, posted date, optional category/memo) plus a **masked** account
 * reference. It carries NO governance logic. Two rules it must keep:
 *
 *  1. **Read-only.** It offers no write action. Per SINA's "displays are
 *     read-only" rule, any action must emit a NEW intent through the gate via
 *     `onIntent` — never a raw button. `onIntent` is unused in the proving slice;
 *     it exists so a later action doesn't smuggle a money-moving control past the
 *     constitution.
 *  2. **Text, never HTML.** Free-text fields (description, counterparty, memo)
 *     render as text — never `dangerouslySetInnerHTML` — which neutralises markup
 *     a tool might have returned.
 *
 * Brand-open tokens only (ordinary UI that rebrands cleanly); the governed
 * "secure" visual language is reserved for escalations.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Separator, Stack, SummaryList } from "@sina-design-system/core";
import type { SummaryItem } from "@sina-design-system/core";

import { formatAmount, formatDate } from "../format.js";
import styles from "./TransactionDetail.module.css";

export interface TransactionDetailProps {
  /** The server-validated `transaction_detail` payload. */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers. The host feeds
   * it back through the gate. Unused in the proving slice — the display stays
   * read-only until an action intent exists.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface TransactionDetailView {
  id: string;
  postedAt: string;
  description: string;
  counterparty: string;
  amount: number;
  currency: string;
  direction: "debit" | "credit";
  status: string;
  category?: string;
  accountLabel: string;
  maskedNumber: string;
  memo?: string;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read a transaction detail off a (server-validated) payload, tolerating a hostile shape. */
function readTransactionDetail(payload: unknown): TransactionDetailView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const account = (data.account ?? {}) as Record<string, unknown>;
  return {
    id: str(data.id),
    postedAt: str(data.postedAt),
    description: str(data.description),
    counterparty: str(data.counterparty, "—"),
    amount: num(data.amount),
    currency: str(data.currency, "USD"),
    direction: data.direction === "credit" ? "credit" : "debit",
    status: str(data.status, "posted"),
    category: typeof data.category === "string" ? data.category : undefined,
    accountLabel: str(account.label, "—"),
    maskedNumber: str(account.maskedNumber),
    memo: typeof data.memo === "string" ? data.memo : undefined,
  };
}

function titleCase(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function TransactionDetail({ payload }: TransactionDetailProps) {
  const detail = readTransactionDetail(payload);
  const isEmpty = !detail.id && !detail.description;
  const credit = detail.direction === "credit";
  const amount = formatAmount(detail.amount, detail.currency);

  const items: SummaryItem[] = [
    { label: "Amount", value: `${credit ? "+" : "−"}${amount}`, emphasis: true },
    {
      label: "Direction",
      value: (
        <Badge intent={credit ? "success" : "neutral"} size="sm">
          {credit ? "Credit" : "Debit"}
        </Badge>
      ),
    },
    {
      label: "Status",
      value: (
        <Badge intent={detail.status === "pending" ? "warning" : "info"} size="sm">
          {titleCase(detail.status)}
        </Badge>
      ),
    },
    { label: "Posted", value: formatDate(detail.postedAt) },
    ...(detail.category ? [{ label: "Category", value: detail.category }] : []),
  ];

  return (
    <Stack
      gap={3}
      aria-label={`Transaction detail${detail.description ? `: ${detail.description}` : ""}`}
      className={styles.card}
    >
      {isEmpty ? (
        <p className={styles.empty}>No transaction to show.</p>
      ) : (
        <>
          <Stack gap={1}>
            <span className={styles.description}>{detail.description}</span>
            <span className={styles.counterparty}>{detail.counterparty}</span>
          </Stack>

          <SummaryList items={items} />

          <Separator />

          <Stack direction="row" justify="between" align="center" gap={2}>
            <span className={styles.accountLabel}>{detail.accountLabel}</span>
            {detail.maskedNumber ? (
              <span className={styles.masked}>{detail.maskedNumber}</span>
            ) : null}
          </Stack>

          {detail.memo ? <p className={styles.memo}>{detail.memo}</p> : null}
        </>
      )}
    </Stack>
  );
}
