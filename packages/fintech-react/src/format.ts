/**
 * Display helpers. Amounts are ISO-4217 minor units (the wire constitution's
 * model); convert to major units per currency for display. Presentation only —
 * these never feed the gate.
 */

import { MINOR_UNIT_EXPONENT, type CurrencyCode } from "@sina-design-system/fintech";

export function formatAmount(minor: number, currency: string): string {
  const exponent = MINOR_UNIT_EXPONENT[currency as CurrencyCode] ?? 2;
  const major = minor / 10 ** exponent;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
  } catch {
    return `${major.toLocaleString("en-US")} ${currency}`;
  }
}

interface WireParty {
  name?: string;
  scheme?: string;
}

export interface WireView {
  amount: number;
  currency: string;
  debtor: WireParty;
  creditor: WireParty;
}

function readParty(value: unknown): WireParty {
  if (!value || typeof value !== "object") return {};
  const party = value as Record<string, unknown>;
  const account =
    party.account && typeof party.account === "object"
      ? (party.account as Record<string, unknown>)
      : undefined;
  return {
    name: typeof party.name === "string" ? party.name : undefined,
    scheme: typeof account?.scheme === "string" ? account.scheme : undefined,
  };
}

/** Read the human-facing terms off an intent payload, tolerating a hostile shape. */
export function readWire(intent: unknown): WireView {
  const wire = (intent ?? {}) as Record<string, unknown>;
  return {
    amount: typeof wire.amount === "number" ? wire.amount : 0,
    currency: typeof wire.currency === "string" ? wire.currency : "USD",
    debtor: readParty(wire.debtor),
    creditor: readParty(wire.creditor),
  };
}

/** Format an ISO-8601 timestamp for display (UTC, so output is deterministic). */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

interface MaskedAccountView {
  label: string;
  maskedNumber: string;
}

function readAccount(value: unknown): MaskedAccountView {
  const account = (value ?? {}) as Record<string, unknown>;
  return { label: str(account.label, "—"), maskedNumber: str(account.maskedNumber) };
}

export interface TransactionRowView {
  id: string;
  postedAt: string;
  description: string;
  counterparty: string;
  amount: number;
  currency: string;
  direction: "debit" | "credit";
}

export interface TransactionListView {
  account: MaskedAccountView;
  transactions: TransactionRowView[];
}

/** Read a transaction list off a (server-validated) payload, tolerating a hostile shape. */
export function readTransactionList(payload: unknown): TransactionListView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(data.transactions) ? data.transactions : [];
  return {
    account: readAccount(data.account),
    transactions: rows.map((row, index) => {
      const tx = (row ?? {}) as Record<string, unknown>;
      return {
        id: str(tx.id, `row_${index}`),
        postedAt: str(tx.postedAt),
        description: str(tx.description, "—"),
        counterparty: str(tx.counterparty, "—"),
        amount: num(tx.amount),
        currency: str(tx.currency, "USD"),
        direction: tx.direction === "credit" ? "credit" : "debit",
      };
    }),
  };
}

export interface BalanceView {
  account: MaskedAccountView;
  available: number;
  current: number;
  currency: string;
}

/** Read an account balance off a (server-validated) payload, tolerating a hostile shape. */
export function readBalance(payload: unknown): BalanceView {
  const data = (payload ?? {}) as Record<string, unknown>;
  return {
    account: readAccount(data.account),
    available: num(data.available),
    current: num(data.current),
    currency: str(data.currency, "USD"),
  };
}
