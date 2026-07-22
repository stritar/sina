/**
 * Transaction-list fixtures — a valid "last 2 transactions" read plus hostile
 * shapes. Valid fixtures are typed (a schema drift breaks them at compile time);
 * adversarial ones are `unknown` (they model hostile LLM streams). Fed through
 * `evaluateFintechIntent` with intent `list_transactions`.
 */

import { usd } from "../formats/currency.js";
import type { TransactionListPayload } from "./transaction-list.schema.js";

/** The user's example: the last 2 transactions for XYZ Company → clean ungoverned pass. */
export const validTwoTransactions: TransactionListPayload = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  transactions: [
    {
      id: "txn_1",
      postedAt: "2026-06-29T14:03:00.000Z",
      description: "Invoice #4471",
      counterparty: "XYZ Company",
      amount: usd(1_250),
      currency: "USD",
      direction: "debit",
    },
    {
      id: "txn_2",
      postedAt: "2026-06-27T09:15:00.000Z",
      description: "Refund #221",
      counterparty: "XYZ Company",
      amount: usd(80),
      currency: "USD",
      direction: "credit",
    },
  ],
};

/** No transactions — a valid empty state (the component renders "no transactions"). */
export const validEmpty: TransactionListPayload = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  transactions: [],
};

/** A fabricated row action smuggled into a row → nested `.strict()` reject. */
export const fabricatedRowAction: unknown = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  transactions: [
    {
      id: "txn_1",
      postedAt: "2026-06-29T14:03:00.000Z",
      description: "Invoice #4471",
      counterparty: "XYZ Company",
      amount: usd(1_250),
      currency: "USD",
      direction: "debit",
      confirmButton: true,
    },
  ],
};

/** A non-integer minor-unit amount → hard reject (integer minor units only). */
export const nonIntegerRowAmount: unknown = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  transactions: [
    {
      id: "txn_1",
      postedAt: "2026-06-29T14:03:00.000Z",
      description: "Invoice #4471",
      counterparty: "XYZ Company",
      amount: 1250.5,
      currency: "USD",
      direction: "debit",
    },
  ],
};

/** 201 rows → `.max(200)` reject (a hostile stream cannot flood the client). */
export const floodOfRows: unknown = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  transactions: Array.from({ length: 201 }, (_value, index) => ({
    id: `txn_${index}`,
    postedAt: "2026-06-29T14:03:00.000Z",
    description: "row",
    counterparty: "XYZ Company",
    amount: usd(1),
    currency: "USD",
    direction: "debit",
  })),
};

/**
 * A description carrying markup. This PASSES — it is a valid bounded string. It
 * documents the boundary: SINA validates SHAPE and provenance, not truthfulness
 * or the safety of the app's own data. The presentational component MUST render
 * it as text (never `dangerouslySetInnerHTML`), which is what neutralises it.
 */
export const injectedHtmlDescription: TransactionListPayload = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  transactions: [
    {
      id: "txn_1",
      postedAt: "2026-06-29T14:03:00.000Z",
      description: '<img src=x onerror="alert(1)">',
      counterparty: "XYZ Company",
      amount: usd(1_250),
      currency: "USD",
      direction: "debit",
    },
  ],
};
