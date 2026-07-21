/**
 * Display helpers. Amounts are ISO-4217 minor units (the wire constitution's
 * model); convert to major units per currency for display. Presentation only —
 * these never feed the gate.
 */

import type { SummaryItem } from "@sina-design-system/core";
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

/** camelCase / snake_case → "Title Case" for a human-facing field label. */
function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Fields that are envelopes/plumbing, never shown as action terms. */
const TERMS_HIDDEN_KEYS = new Set(["stepUp", "approval", "payloadHash"]);

/**
 * Derive a read-only terms summary from ANY governed action payload, so one
 * `GovernedActionDialog` can render every flow's terms without a per-flow adapter.
 * Shows a formatted `amount` (with sibling `currency`) first, then the remaining
 * primitive fields; a nested object contributes its `name`/`label`. Presentation
 * only — never feeds the gate.
 */
export function deriveActionTerms(payload: unknown): SummaryItem[] {
  const data = (payload ?? {}) as Record<string, unknown>;
  const currency = typeof data.currency === "string" ? data.currency : "USD";
  const items: SummaryItem[] = [];

  if (typeof data.amount === "number") {
    items.push({ label: "Amount", value: formatAmount(data.amount, currency), emphasis: true });
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === "amount" || TERMS_HIDDEN_KEYS.has(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      items.push({ label: humanizeKey(key), value: String(value) });
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>;
      const name = nested.name ?? nested.label;
      if (typeof name === "string") items.push({ label: humanizeKey(key), value: name });
    }
  }

  return items.slice(0, 8);
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

function bool(value: unknown): boolean {
  return value === true;
}

function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map((row) => (row ?? {}) as Record<string, unknown>) : [];
}

/** Format a signed percent for display, e.g. `+2.4%` / `−1.1%` (sign carries meaning, not color). */
export function formatPct(pct: number): string {
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

// ── Spending breakdown ────────────────────────────────────────────────────────
export interface SpendingCategoryView {
  label: string;
  amount: number;
}
export interface SpendingBreakdownView {
  period: string;
  currency: string;
  total: number;
  categories: SpendingCategoryView[];
}
export function readSpendingBreakdown(payload: unknown): SpendingBreakdownView {
  const d = (payload ?? {}) as Record<string, unknown>;
  return {
    period: str(d.period, "—"),
    currency: str(d.currency, "USD"),
    total: num(d.total),
    categories: rows(d.categories).map((c) => ({ label: str(c.label, "—"), amount: num(c.amount) })),
  };
}

// ── Budget progress ───────────────────────────────────────────────────────────
export interface BudgetView {
  label: string;
  spent: number;
  limit: number;
}
export interface BudgetProgressView {
  currency: string;
  budgets: BudgetView[];
}
export function readBudgetProgress(payload: unknown): BudgetProgressView {
  const d = (payload ?? {}) as Record<string, unknown>;
  return {
    currency: str(d.currency, "USD"),
    budgets: rows(d.budgets).map((b) => ({
      label: str(b.label, "—"),
      spent: num(b.spent),
      limit: num(b.limit),
    })),
  };
}

// ── Card list ─────────────────────────────────────────────────────────────────
export interface CardView {
  id: string;
  label: string;
  network: string;
  maskedNumber: string;
  status: string;
  expiry: string;
}
export function readCardList(payload: unknown): CardView[] {
  const d = (payload ?? {}) as Record<string, unknown>;
  return rows(d.cards).map((c, i) => ({
    id: str(c.id, `card_${i}`),
    label: str(c.label, "—"),
    network: str(c.network),
    maskedNumber: str(c.maskedNumber),
    status: str(c.status, "active"),
    expiry: str(c.expiry),
  }));
}

// ── Rewards summary ───────────────────────────────────────────────────────────
export interface RewardsView {
  program: string;
  currency: string;
  points: number;
  tier: string;
  nextTier?: string;
  pointsToNextTier?: number;
  cashback?: number;
}
export function readRewards(payload: unknown): RewardsView {
  const d = (payload ?? {}) as Record<string, unknown>;
  return {
    program: str(d.program, "Rewards"),
    currency: str(d.currency, "USD"),
    points: num(d.points),
    tier: str(d.tier, "—"),
    nextTier: typeof d.nextTier === "string" ? d.nextTier : undefined,
    pointsToNextTier: typeof d.pointsToNextTier === "number" ? d.pointsToNextTier : undefined,
    cashback: typeof d.cashback === "number" ? d.cashback : undefined,
  };
}

// ── Payee list ────────────────────────────────────────────────────────────────
export interface PayeeView {
  id: string;
  name: string;
  maskedNumber: string;
  verified: boolean;
  lastPaidAt?: string;
}
export function readPayeeList(payload: unknown): PayeeView[] {
  const d = (payload ?? {}) as Record<string, unknown>;
  return rows(d.payees).map((p, i) => ({
    id: str(p.id, `payee_${i}`),
    name: str(p.name, "—"),
    maskedNumber: str(p.maskedNumber),
    verified: bool(p.verified),
    lastPaidAt: typeof p.lastPaidAt === "string" ? p.lastPaidAt : undefined,
  }));
}

// ── Upcoming payments ─────────────────────────────────────────────────────────
export interface UpcomingPaymentView {
  id: string;
  payee: string;
  amount: number;
  dueAt: string;
  status: string;
}
export interface UpcomingPaymentsView {
  currency: string;
  payments: UpcomingPaymentView[];
}
export function readUpcomingPayments(payload: unknown): UpcomingPaymentsView {
  const d = (payload ?? {}) as Record<string, unknown>;
  return {
    currency: str(d.currency, "USD"),
    payments: rows(d.payments).map((p, i) => ({
      id: str(p.id, `pay_${i}`),
      payee: str(p.payee, "—"),
      amount: num(p.amount),
      dueAt: str(p.dueAt),
      status: str(p.status, "scheduled"),
    })),
  };
}

// ── Portfolio holdings ────────────────────────────────────────────────────────
export interface HoldingView {
  symbol: string;
  name: string;
  quantity: number;
  value: number;
  changePct: number;
}
export interface PortfolioHoldingsView {
  currency: string;
  totalValue: number;
  holdings: HoldingView[];
}
export function readPortfolioHoldings(payload: unknown): PortfolioHoldingsView {
  const d = (payload ?? {}) as Record<string, unknown>;
  return {
    currency: str(d.currency, "USD"),
    totalValue: num(d.totalValue),
    holdings: rows(d.holdings).map((h, i) => ({
      symbol: str(h.symbol, `H${i}`),
      name: str(h.name, "—"),
      quantity: num(h.quantity),
      value: num(h.value),
      changePct: num(h.changePct),
    })),
  };
}

// ── Watchlist ─────────────────────────────────────────────────────────────────
export interface WatchItemView {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  changePct: number;
}
export function readWatchlist(payload: unknown): WatchItemView[] {
  const d = (payload ?? {}) as Record<string, unknown>;
  return rows(d.items).map((w, i) => ({
    symbol: str(w.symbol, `W${i}`),
    name: str(w.name, "—"),
    price: num(w.price),
    currency: str(w.currency, "USD"),
    changePct: num(w.changePct),
  }));
}

// ── Clarify choice ────────────────────────────────────────────────────────────
export interface ChoiceOptionView {
  id: string;
  label: string;
  description: string;
}
export interface ClarifyChoiceView {
  prompt: string;
  options: ChoiceOptionView[];
}
export function readClarifyChoice(payload: unknown): ClarifyChoiceView {
  const d = (payload ?? {}) as Record<string, unknown>;
  return {
    prompt: str(d.prompt),
    options: rows(d.options).map((o, i) => ({
      id: str(o.id, `opt_${i}`),
      label: str(o.label, "—"),
      description: str(o.description),
    })),
  };
}
