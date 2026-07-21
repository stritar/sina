/**
 * InvoiceList — a SINA presentational fintech component (ungoverned).
 * Renders the validated `list_invoices` payload: issued invoices with amount, due
 * date, and a status Badge (overdue → danger). Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack, SummaryList } from "@sina-design-system/core";

import { formatAmount, formatDate } from "../format.js";
import styles from "./InvoiceList.module.css";

export interface InvoiceListProps {
  /** The server-validated `list_invoices` payload (`IntentProps<"list_invoices">` in `@sina-design-system/fintech`). */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers. The host feeds it
   * back through the gate. Unused in the proving slice — the display stays
   * read-only until an action intent exists.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface InvoiceRowView {
  id: string;
  number: string;
  counterparty: string;
  amount: number;
  dueAt: string;
  status: string;
}

interface InvoiceListView {
  currency: string;
  invoices: InvoiceRowView[];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read an invoice list off a (server-validated) payload, tolerating a hostile shape. */
function readInvoiceList(payload: unknown): InvoiceListView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.invoices) ? data.invoices : [];
  return {
    currency: str(data.currency, "USD"),
    invoices: list.map((row, index) => {
      const inv = (row ?? {}) as Record<string, unknown>;
      return {
        id: str(inv.id, `invoice_${index}`),
        number: str(inv.number, "—"),
        counterparty: str(inv.counterparty, "—"),
        amount: num(inv.amount),
        dueAt: str(inv.dueAt),
        status: str(inv.status, "draft"),
      };
    }),
  };
}

/** Map an invoice status to a Badge intent — overdue reads as danger. */
function statusIntent(status: string) {
  switch (status) {
    case "overdue":
      return "danger" as const;
    case "paid":
      return "success" as const;
    case "sent":
      return "info" as const;
    default:
      return "neutral" as const;
  }
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function InvoiceList({ payload }: InvoiceListProps) {
  const { currency, invoices } = readInvoiceList(payload);

  return (
    <Stack
      gap={3}
      aria-label="Invoices"
      className={styles.card}
    >
      {invoices.length === 0 ? (
        <p className={styles.empty}>No invoices to show.</p>
      ) : (
        <SummaryList
          items={invoices.map((inv) => ({
            label: (
              <span className={styles.labelCol}>
                <span className={styles.number}>{inv.number}</span>
                <span className={styles.counterparty}>{inv.counterparty}</span>
              </span>
            ),
            value: (
              <span className={styles.valueGroup}>
                <span className={styles.amountCol}>
                  <span className={styles.amount}>
                    {formatAmount(inv.amount, currency)}
                  </span>
                  <span className={styles.due}>{formatDate(inv.dueAt)}</span>
                </span>
                <Badge intent={statusIntent(inv.status)} size="sm">
                  {titleCase(inv.status)}
                </Badge>
              </span>
            ),
          }))}
        />
      )}
    </Stack>
  );
}
