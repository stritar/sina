/** Transaction-detail fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { TransactionDetailPayload } from "./transaction-detail.schema.js";

export const valid: TransactionDetailPayload = {
  id: "txn_8f21c0",
  postedAt: "2026-06-28T14:32:00.000Z",
  description: "Monthly subscription — Pro plan",
  counterparty: "Acme SaaS Inc.",
  amount: usd(49.99),
  currency: "USD",
  direction: "debit",
  status: "posted",
  category: "Software",
  account: { label: "Checking", maskedNumber: "****4021" },
  memo: "Auto-renewal; annual review scheduled for December.",
};

/** Minimal-but-valid detail: no optional category/memo, an incoming credit still pending. */
export const validEmpty: TransactionDetailPayload = {
  id: "txn_min001",
  postedAt: "2026-07-01T00:00:00.000Z",
  description: "Incoming transfer",
  counterparty: "Jane Doe",
  amount: usd(1_200),
  currency: "USD",
  direction: "credit",
  status: "pending",
  account: { label: "Savings", maskedNumber: "****7788" },
};

/** A full, unmasked account number on `account` → `maskedNumber` regex reject. */
export const adversarial: unknown = {
  id: "txn_bad001",
  postedAt: "2026-06-28T14:32:00.000Z",
  description: "Card payment",
  counterparty: "Acme SaaS Inc.",
  amount: usd(49.99),
  currency: "USD",
  direction: "debit",
  status: "posted",
  account: { label: "Checking", maskedNumber: "4021401540214021" },
};
