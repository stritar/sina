/**
 * The invoice-list constitution — an UNGOVERNED display pattern.
 *
 * Issued invoices for display: number, counterparty, amount, due date, status —
 * a pure read. Shape-only; amount is integer minor units; status is a bounded
 * enum. `.strict()` per invoice, bounded. Mounts the presentational `InvoiceList`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const invoice = z
  .object({
    id: z.string().min(1).max(40),
    number: z.string().min(1).max(40),
    counterparty: z.string().min(1).max(80),
    amount: minorUnitAmount,
    dueAt: z.string().datetime(),
    status: z.enum(["draft", "sent", "paid", "overdue", "void"]),
  })
  .strict();

export const invoiceListPayload = z
  .object({
    currency: currencyCode,
    invoices: z.array(invoice).max(100, "too many invoices (max 100)"),
  })
  .strict();

export type InvoiceListPayload = z.infer<typeof invoiceListPayload>;

export const INVOICE_LIST_VERSION = "1.0.0";
