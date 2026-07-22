"use client";

/**
 * Component registry — maps a mount name (from the router's `Decision`) to the React
 * component that renders it. Two kinds:
 *
 *   - GOVERNED: the component a constitution FORCES on escalation. It collects
 *     evidence and re-gates server-side through the injected `GateTransport`
 *     (SecureWireDialog, …).
 *   - PRESENTATIONAL: the component an ungoverned clean pass mounts. It renders
 *     already-validated props read-only (TransactionList, BalanceCard, …).
 *
 * This seam is how new patterns land without rewiring the gate or the chat. The model
 * never names a component — it emits an intent verb, and this registry decides the
 * mount from the decision the gate already made.
 *
 * Every entry is `React.lazy`: a page that escalates a wire downloads the wire dialog
 * and nothing else — no chart.js, none of the 28 reads. The maps are built at MODULE
 * scope on purpose; a `lazy()` created inside the resolver would mint a new component
 * type on every render and remount forever. Callers must render mounts inside a
 * `<Suspense>` boundary (an SSR suspend without one throws).
 */

import { lazy, type ComponentType } from "react";

import type * as Reads from "./presentational.js";
import type { GovernedComponentProps } from "./types.js";

/** Presentational components take the validated payload and render it read-only. */
type PresentationalProps = { payload: unknown };

/** The 28 reads share one async chunk — see ./presentational.ts. */
function read(name: keyof typeof Reads): ComponentType<PresentationalProps> {
  return lazy(() =>
    import("./presentational.js").then((m) => ({
      default: m[name] as unknown as ComponentType<PresentationalProps>,
    })),
  );
}

const GOVERNED: Record<string, ComponentType<GovernedComponentProps>> = {
  SecureWireDialog: lazy(() =>
    import("./SecureWireDialogHost.js").then((m) => ({ default: m.SecureWireDialogHost })),
  ),
  // The generalized governed dialog every non-wire escalation mounts (money
  // movement, card ops, security changes, trades, B2B approvals).
  GovernedActionDialog: lazy(() =>
    import("./GovernedActionDialogHost.js").then((m) => ({ default: m.GovernedActionDialogHost })),
  ),
  // Consent / regulatory disclosures (acknowledge-before-proceed).
  MandatoryDisclosure: lazy(() =>
    import("./MandatoryDisclosureHost.js").then((m) => ({ default: m.MandatoryDisclosureHost })),
  ),
};

const PRESENTATIONAL: Record<string, ComponentType<PresentationalProps>> = {
  TransactionList: read("TransactionList"),
  BalanceCard: read("BalanceCard"),
  SpendingBreakdown: read("SpendingBreakdown"),
  BudgetProgress: read("BudgetProgress"),
  CardList: read("CardList"),
  RewardsSummary: read("RewardsSummary"),
  PayeeList: read("PayeeList"),
  UpcomingPayments: read("UpcomingPayments"),
  PortfolioHoldings: read("PortfolioHoldings"),
  Watchlist: read("Watchlist"),
  TransactionDetail: read("TransactionDetail"),
  AccountList: read("AccountList"),
  StatementList: read("StatementList"),
  CashflowSummary: read("CashflowSummary"),
  BalanceTrend: read("BalanceTrend"),
  ActivityFeed: read("ActivityFeed"),
  InsightCard: read("InsightCard"),
  RecurringList: read("RecurringList"),
  InvoiceList: read("InvoiceList"),
  AssetDetail: read("AssetDetail"),
  OrderHistory: read("OrderHistory"),
  FxQuote: read("FxQuote"),
  CryptoHoldings: read("CryptoHoldings"),
  SavingsGoal: read("SavingsGoal"),
  NetWorth: read("NetWorth"),
  AlertsFeed: read("AlertsFeed"),
  SearchResults: read("SearchResults"),
  ClarifyChoice: read("ClarifyChoice"),
};

/** Resolve the governed component the gate forces, or null if none is registered. */
export function resolveGovernedComponent(
  name: string | null,
): ComponentType<GovernedComponentProps> | null {
  return name ? (GOVERNED[name] ?? null) : null;
}

/** Resolve the presentational component an ungoverned pass mounts, or null. */
export function resolvePresentational(
  name: string | null,
): ComponentType<PresentationalProps> | null {
  return name ? (PRESENTATIONAL[name] ?? null) : null;
}
