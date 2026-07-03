/**
 * The fintech pattern registry — the intent verbs SINA can render, each mapped to
 * its constitution rule and the component it mounts. Governed intents carry policy
 * + escalation (wire-transfer); ungoverned display intents carry a shape-only rule
 * and a presentational component. `evaluateFintechIntent` is the single
 * server-side entry the harness calls — it dispatches the envelope through the
 * router ({@link @sina-design-system/governance}).
 *
 * The registry is a FACTORY over the server-known {@link ApprovalContext} — never
 * a module constant — so a wire's initiator identity is bound per request (and can
 * never be frozen at import time, nor spoofed from the payload).
 */

import {
  dispatch,
  pattern,
  type Decision,
  type IntentEnvelope,
  type PatternRegistry,
} from "@sina-design-system/governance";

import {
  evaluateWireTransfer,
  AGENT_INITIATOR_ID,
  type ApprovalContext,
} from "./wire-transfer/wire-transfer.schema.js";
import { evaluateAchTransfer } from "./ach-transfer/ach-transfer.schema.js";
import { evaluateDisclosure } from "./disclosure/disclosure.schema.js";
import { evaluateP2pPayment } from "./p2p-payment/p2p-payment.schema.js";
import { evaluateBillPay } from "./bill-pay/bill-pay.schema.js";
import { evaluateRecurringSetup } from "./recurring-setup/recurring-setup.schema.js";
import { evaluateFxConvert } from "./fx-convert/fx-convert.schema.js";
import { evaluateCryptoWithdraw } from "./crypto-withdraw/crypto-withdraw.schema.js";
import { evaluateWithdraw } from "./withdraw/withdraw.schema.js";
import { evaluateIssueCard } from "./issue-card/issue-card.schema.js";
import { evaluateCardControl } from "./card-control/card-control.schema.js";
import { evaluateChangeLimit } from "./change-limit/change-limit.schema.js";
import { evaluateSecurityChange } from "./security-change/security-change.schema.js";
import { evaluateAddUser } from "./add-user/add-user.schema.js";
import { evaluateKyc } from "./kyc/kyc.schema.js";
import { evaluateAddPayee } from "./add-payee/add-payee.schema.js";
import { evaluateLinkAccount } from "./link-account/link-account.schema.js";
import { evaluateDispute } from "./dispute/dispute.schema.js";
import { evaluateCloseAccount } from "./close-account/close-account.schema.js";
import { evaluatePlaceTrade } from "./place-trade/place-trade.schema.js";
import { evaluateEnableMargin } from "./enable-margin/enable-margin.schema.js";
import { evaluateCreditRequest } from "./credit-request/credit-request.schema.js";
import {
  transactionDetailPayload,
  TRANSACTION_DETAIL_VERSION,
  TRANSACTION_DETAIL_REDACTION,
} from "./transaction-detail/transaction-detail.schema.js";
import {
  accountListPayload,
  ACCOUNT_LIST_VERSION,
  ACCOUNT_LIST_REDACTION,
} from "./account-list/account-list.schema.js";
import {
  statementListPayload,
  STATEMENT_LIST_VERSION,
  STATEMENT_LIST_REDACTION,
} from "./statement-list/statement-list.schema.js";
import { cashflowSummaryPayload, CASHFLOW_SUMMARY_VERSION } from "./cashflow-summary/cashflow-summary.schema.js";
import {
  balanceTrendPayload,
  BALANCE_TREND_VERSION,
  BALANCE_TREND_REDACTION,
} from "./balance-trend/balance-trend.schema.js";
import { activityFeedPayload, ACTIVITY_FEED_VERSION } from "./activity-feed/activity-feed.schema.js";
import { insightPayload, INSIGHT_VERSION } from "./insight-card/insight-card.schema.js";
import { recurringListPayload, RECURRING_LIST_VERSION } from "./recurring-list/recurring-list.schema.js";
import { invoiceListPayload, INVOICE_LIST_VERSION } from "./invoice-list/invoice-list.schema.js";
import { assetDetailPayload, ASSET_DETAIL_VERSION } from "./asset-detail/asset-detail.schema.js";
import { orderHistoryPayload, ORDER_HISTORY_VERSION } from "./order-history/order-history.schema.js";
import { fxQuotePayload, FX_QUOTE_VERSION } from "./fx-quote/fx-quote.schema.js";
import { cryptoHoldingsPayload, CRYPTO_HOLDINGS_VERSION } from "./crypto-holdings/crypto-holdings.schema.js";
import { savingsGoalPayload, SAVINGS_GOAL_VERSION } from "./savings-goal/savings-goal.schema.js";
import { netWorthPayload, NET_WORTH_VERSION } from "./net-worth/net-worth.schema.js";
import { alertsFeedPayload, ALERTS_FEED_VERSION } from "./alerts-feed/alerts-feed.schema.js";
import { searchResultsPayload, SEARCH_RESULTS_VERSION } from "./search-results/search-results.schema.js";
import {
  transactionListPayload,
  TRANSACTION_LIST_VERSION,
  TRANSACTION_LIST_REDACTION,
} from "./transaction-list/transaction-list.schema.js";
import {
  accountBalancePayload,
  ACCOUNT_BALANCE_VERSION,
  ACCOUNT_BALANCE_REDACTION,
} from "./account-balance/account-balance.schema.js";
import {
  spendingBreakdownPayload,
  SPENDING_BREAKDOWN_VERSION,
} from "./spending-breakdown/spending-breakdown.schema.js";
import {
  budgetProgressPayload,
  BUDGET_PROGRESS_VERSION,
} from "./budget-progress/budget-progress.schema.js";
import { cardListPayload, CARD_LIST_VERSION, CARD_LIST_REDACTION } from "./card-list/card-list.schema.js";
import {
  rewardsSummaryPayload,
  REWARDS_SUMMARY_VERSION,
} from "./rewards-summary/rewards-summary.schema.js";
import { payeeListPayload, PAYEE_LIST_VERSION, PAYEE_LIST_REDACTION } from "./payee-list/payee-list.schema.js";
import {
  upcomingPaymentsPayload,
  UPCOMING_PAYMENTS_VERSION,
} from "./upcoming-payments/upcoming-payments.schema.js";
import {
  portfolioHoldingsPayload,
  PORTFOLIO_HOLDINGS_VERSION,
} from "./portfolio-holdings/portfolio-holdings.schema.js";
import { watchlistPayload, WATCHLIST_VERSION } from "./watchlist/watchlist.schema.js";

// Re-export the router's envelope/decision types so the fintech intent API is
// self-contained — consumers never reach into `governance` directly for these.
export type { IntentEnvelope, Decision } from "@sina-design-system/governance";

/** The intent verbs the model may emit. Stable identifiers; the model never names a component. */
export const INTENTS = {
  WIRE_TRANSFER: "wire_transfer",
  ACH_TRANSFER: "ach_transfer",
  DISCLOSURE: "disclosure",
  P2P_PAYMENT: "p2p_payment",
  BILL_PAY: "bill_pay",
  RECURRING_SETUP: "recurring_setup",
  FX_CONVERT: "fx_convert",
  CRYPTO_WITHDRAW: "crypto_withdraw",
  WITHDRAW: "withdraw",
  ISSUE_CARD: "issue_card",
  CARD_CONTROL: "card_control",
  CHANGE_LIMIT: "change_limit",
  SECURITY_CHANGE: "security_change",
  ADD_USER: "add_user",
  KYC: "kyc",
  ADD_PAYEE: "add_payee",
  LINK_ACCOUNT: "link_account",
  DISPUTE: "dispute",
  CLOSE_ACCOUNT: "close_account",
  PLACE_TRADE: "place_trade",
  ENABLE_MARGIN: "enable_margin",
  CREDIT_REQUEST: "credit_request",
  LIST_TRANSACTIONS: "list_transactions",
  TRANSACTION_DETAIL: "transaction_detail",
  LIST_ACCOUNTS: "list_accounts",
  LIST_STATEMENTS: "list_statements",
  CASHFLOW_SUMMARY: "cashflow_summary",
  BALANCE_TREND: "balance_trend",
  ACTIVITY_FEED: "activity_feed",
  INSIGHT: "insight",
  LIST_RECURRING: "list_recurring",
  LIST_INVOICES: "list_invoices",
  ASSET_DETAIL: "asset_detail",
  ORDER_HISTORY: "order_history",
  FX_QUOTE: "fx_quote",
  CRYPTO_HOLDINGS: "crypto_holdings",
  SAVINGS_GOAL: "savings_goal",
  NET_WORTH: "net_worth",
  ALERTS_FEED: "alerts_feed",
  SEARCH_RESULTS: "search_results",
  ACCOUNT_BALANCE: "account_balance",
  SPENDING_BREAKDOWN: "spending_breakdown",
  BUDGET_PROGRESS: "budget_progress",
  LIST_CARDS: "list_cards",
  REWARDS_SUMMARY: "rewards_summary",
  LIST_PAYEES: "list_payees",
  UPCOMING_PAYMENTS: "upcoming_payments",
  PORTFOLIO_HOLDINGS: "portfolio_holdings",
  WATCHLIST: "watchlist",
} as const;

export type FintechIntent = (typeof INTENTS)[keyof typeof INTENTS];

/**
 * Build the fintech registry bound to a server-supplied {@link ApprovalContext}.
 * A factory, not a constant: the wire entry delegates to `evaluateWireTransfer`
 * so its initiator (four-eyes) context is applied per call and never frozen.
 */
export function fintechRegistry(
  ctx: ApprovalContext = { initiatorId: AGENT_INITIATOR_ID },
): PatternRegistry {
  return {
    // Governed money movement — policy escalates to the SecureWireDialog.
    [INTENTS.WIRE_TRANSFER]: { evaluate: (props) => evaluateWireTransfer(props, ctx) },
    // Governed ACH — reuses the shared step-up dual-control → GovernedActionDialog.
    [INTENTS.ACH_TRANSFER]: { evaluate: (props) => evaluateAchTransfer(props, ctx) },
    // Mandatory disclosure — acknowledge-before-proceed → MandatoryDisclosure.
    [INTENTS.DISCLOSURE]: { evaluate: (props) => evaluateDisclosure(props, ctx) },
    // Governed family — each reuses the shared step-up dual-control and mounts a
    // generalized governed component (GovernedActionDialog / MandatoryDisclosure).
    [INTENTS.P2P_PAYMENT]: { evaluate: (props) => evaluateP2pPayment(props, ctx) },
    [INTENTS.BILL_PAY]: { evaluate: (props) => evaluateBillPay(props, ctx) },
    [INTENTS.RECURRING_SETUP]: { evaluate: (props) => evaluateRecurringSetup(props, ctx) },
    [INTENTS.FX_CONVERT]: { evaluate: (props) => evaluateFxConvert(props, ctx) },
    [INTENTS.CRYPTO_WITHDRAW]: { evaluate: (props) => evaluateCryptoWithdraw(props, ctx) },
    [INTENTS.WITHDRAW]: { evaluate: (props) => evaluateWithdraw(props, ctx) },
    [INTENTS.ISSUE_CARD]: { evaluate: (props) => evaluateIssueCard(props, ctx) },
    [INTENTS.CARD_CONTROL]: { evaluate: (props) => evaluateCardControl(props, ctx) },
    [INTENTS.CHANGE_LIMIT]: { evaluate: (props) => evaluateChangeLimit(props, ctx) },
    [INTENTS.SECURITY_CHANGE]: { evaluate: (props) => evaluateSecurityChange(props, ctx) },
    [INTENTS.ADD_USER]: { evaluate: (props) => evaluateAddUser(props, ctx) },
    [INTENTS.KYC]: { evaluate: (props) => evaluateKyc(props, ctx) },
    [INTENTS.ADD_PAYEE]: { evaluate: (props) => evaluateAddPayee(props, ctx) },
    [INTENTS.LINK_ACCOUNT]: { evaluate: (props) => evaluateLinkAccount(props, ctx) },
    [INTENTS.DISPUTE]: { evaluate: (props) => evaluateDispute(props, ctx) },
    [INTENTS.CLOSE_ACCOUNT]: { evaluate: (props) => evaluateCloseAccount(props, ctx) },
    [INTENTS.PLACE_TRADE]: { evaluate: (props) => evaluatePlaceTrade(props, ctx) },
    [INTENTS.ENABLE_MARGIN]: { evaluate: (props) => evaluateEnableMargin(props, ctx) },
    [INTENTS.CREDIT_REQUEST]: { evaluate: (props) => evaluateCreditRequest(props, ctx) },

    // Ungoverned reads — shape-only, mount a presentational component on a clean pass.
    [INTENTS.LIST_TRANSACTIONS]: pattern({
      rule: {
        schema: transactionListPayload,
        redaction: TRANSACTION_LIST_REDACTION,
        version: TRANSACTION_LIST_VERSION,
        component: "TransactionList",
      },
    }),
    [INTENTS.ACCOUNT_BALANCE]: pattern({
      rule: {
        schema: accountBalancePayload,
        redaction: ACCOUNT_BALANCE_REDACTION,
        version: ACCOUNT_BALANCE_VERSION,
        component: "BalanceCard",
      },
    }),
    [INTENTS.SPENDING_BREAKDOWN]: pattern({
      rule: {
        schema: spendingBreakdownPayload,
        version: SPENDING_BREAKDOWN_VERSION,
        component: "SpendingBreakdown",
      },
    }),
    [INTENTS.BUDGET_PROGRESS]: pattern({
      rule: {
        schema: budgetProgressPayload,
        version: BUDGET_PROGRESS_VERSION,
        component: "BudgetProgress",
      },
    }),
    [INTENTS.LIST_CARDS]: pattern({
      rule: {
        schema: cardListPayload,
        redaction: CARD_LIST_REDACTION,
        version: CARD_LIST_VERSION,
        component: "CardList",
      },
    }),
    [INTENTS.REWARDS_SUMMARY]: pattern({
      rule: {
        schema: rewardsSummaryPayload,
        version: REWARDS_SUMMARY_VERSION,
        component: "RewardsSummary",
      },
    }),
    [INTENTS.LIST_PAYEES]: pattern({
      rule: {
        schema: payeeListPayload,
        redaction: PAYEE_LIST_REDACTION,
        version: PAYEE_LIST_VERSION,
        component: "PayeeList",
      },
    }),
    [INTENTS.UPCOMING_PAYMENTS]: pattern({
      rule: {
        schema: upcomingPaymentsPayload,
        version: UPCOMING_PAYMENTS_VERSION,
        component: "UpcomingPayments",
      },
    }),
    [INTENTS.PORTFOLIO_HOLDINGS]: pattern({
      rule: {
        schema: portfolioHoldingsPayload,
        version: PORTFOLIO_HOLDINGS_VERSION,
        component: "PortfolioHoldings",
      },
    }),
    [INTENTS.WATCHLIST]: pattern({
      rule: {
        schema: watchlistPayload,
        version: WATCHLIST_VERSION,
        component: "Watchlist",
      },
    }),

    // Expanded ungoverned read catalog — shape-only rules, presentational mounts.
    [INTENTS.TRANSACTION_DETAIL]: pattern({ rule: { schema: transactionDetailPayload, redaction: TRANSACTION_DETAIL_REDACTION, version: TRANSACTION_DETAIL_VERSION, component: "TransactionDetail" } }),
    [INTENTS.LIST_ACCOUNTS]: pattern({ rule: { schema: accountListPayload, redaction: ACCOUNT_LIST_REDACTION, version: ACCOUNT_LIST_VERSION, component: "AccountList" } }),
    [INTENTS.LIST_STATEMENTS]: pattern({ rule: { schema: statementListPayload, redaction: STATEMENT_LIST_REDACTION, version: STATEMENT_LIST_VERSION, component: "StatementList" } }),
    [INTENTS.CASHFLOW_SUMMARY]: pattern({ rule: { schema: cashflowSummaryPayload, version: CASHFLOW_SUMMARY_VERSION, component: "CashflowSummary" } }),
    [INTENTS.BALANCE_TREND]: pattern({ rule: { schema: balanceTrendPayload, redaction: BALANCE_TREND_REDACTION, version: BALANCE_TREND_VERSION, component: "BalanceTrend" } }),
    [INTENTS.ACTIVITY_FEED]: pattern({ rule: { schema: activityFeedPayload, version: ACTIVITY_FEED_VERSION, component: "ActivityFeed" } }),
    [INTENTS.INSIGHT]: pattern({ rule: { schema: insightPayload, version: INSIGHT_VERSION, component: "InsightCard" } }),
    [INTENTS.LIST_RECURRING]: pattern({ rule: { schema: recurringListPayload, version: RECURRING_LIST_VERSION, component: "RecurringList" } }),
    [INTENTS.LIST_INVOICES]: pattern({ rule: { schema: invoiceListPayload, version: INVOICE_LIST_VERSION, component: "InvoiceList" } }),
    [INTENTS.ASSET_DETAIL]: pattern({ rule: { schema: assetDetailPayload, version: ASSET_DETAIL_VERSION, component: "AssetDetail" } }),
    [INTENTS.ORDER_HISTORY]: pattern({ rule: { schema: orderHistoryPayload, version: ORDER_HISTORY_VERSION, component: "OrderHistory" } }),
    [INTENTS.FX_QUOTE]: pattern({ rule: { schema: fxQuotePayload, version: FX_QUOTE_VERSION, component: "FxQuote" } }),
    [INTENTS.CRYPTO_HOLDINGS]: pattern({ rule: { schema: cryptoHoldingsPayload, version: CRYPTO_HOLDINGS_VERSION, component: "CryptoHoldings" } }),
    [INTENTS.SAVINGS_GOAL]: pattern({ rule: { schema: savingsGoalPayload, version: SAVINGS_GOAL_VERSION, component: "SavingsGoal" } }),
    [INTENTS.NET_WORTH]: pattern({ rule: { schema: netWorthPayload, version: NET_WORTH_VERSION, component: "NetWorth" } }),
    [INTENTS.ALERTS_FEED]: pattern({ rule: { schema: alertsFeedPayload, version: ALERTS_FEED_VERSION, component: "AlertsFeed" } }),
    [INTENTS.SEARCH_RESULTS]: pattern({ rule: { schema: searchResultsPayload, version: SEARCH_RESULTS_VERSION, component: "SearchResults" } }),
  };
}

/**
 * The single server-side entry the harness calls. Dispatches an `{ intent, props }`
 * envelope through the router and returns the {@link Decision} (result + mount).
 */
export function evaluateFintechIntent(envelope: IntentEnvelope, ctx?: ApprovalContext): Decision {
  return dispatch(fintechRegistry(ctx), envelope);
}

/** A model-facing descriptor of one renderable intent (advisory; the gate stays authoritative). */
export interface IntentDescriptor {
  intent: string;
  kind: "display" | "governed";
  component: string;
  summary: string;
}

/**
 * The intent manifest — which intents exist and what they render. This is what
 * tells a model which verbs it may emit. Per-intent prop JSON-schema attaches when
 * the repo moves to Zod 4's `z.toJSONSchema` (or adds `zod-to-json-schema`); until
 * then `gateLive` mirrors each prop schema in its tool definition. Advisory UX —
 * `evaluateFintechIntent` (the server gate) remains authoritative.
 */
export function fintechIntentManifest(): IntentDescriptor[] {
  return [
    {
      intent: INTENTS.LIST_TRANSACTIONS,
      kind: "display",
      component: "TransactionList",
      summary: "Show a bounded list of an account's posted transactions.",
    },
    {
      intent: INTENTS.ACCOUNT_BALANCE,
      kind: "display",
      component: "BalanceCard",
      summary: "Show an account's available and current balance.",
    },
    {
      intent: INTENTS.SPENDING_BREAKDOWN,
      kind: "display",
      component: "SpendingBreakdown",
      summary: "Show a spending breakdown by category for a period.",
    },
    {
      intent: INTENTS.BUDGET_PROGRESS,
      kind: "display",
      component: "BudgetProgress",
      summary: "Show budget progress (spent vs limit) by category.",
    },
    {
      intent: INTENTS.LIST_CARDS,
      kind: "display",
      component: "CardList",
      summary: "Show the wallet of cards with their status.",
    },
    {
      intent: INTENTS.REWARDS_SUMMARY,
      kind: "display",
      component: "RewardsSummary",
      summary: "Show rewards points, tier, and cashback.",
    },
    {
      intent: INTENTS.LIST_PAYEES,
      kind: "display",
      component: "PayeeList",
      summary: "Show saved payees and their verification status.",
    },
    {
      intent: INTENTS.UPCOMING_PAYMENTS,
      kind: "display",
      component: "UpcomingPayments",
      summary: "Show scheduled and upcoming payments.",
    },
    {
      intent: INTENTS.PORTFOLIO_HOLDINGS,
      kind: "display",
      component: "PortfolioHoldings",
      summary: "Show investment holdings with day change.",
    },
    {
      intent: INTENTS.WATCHLIST,
      kind: "display",
      component: "Watchlist",
      summary: "Show tracked instruments with price and day change.",
    },
    {
      intent: INTENTS.WIRE_TRANSFER,
      kind: "governed",
      component: "SecureWireDialog",
      summary: "Initiate a wire transfer (governed: limits, Travel Rule, secondary approval).",
    },
    {
      intent: INTENTS.ACH_TRANSFER,
      kind: "governed",
      component: "GovernedActionDialog",
      summary: "Initiate an ACH transfer (governed: authorization above $25k, CTR flag).",
    },
    {
      intent: INTENTS.DISCLOSURE,
      kind: "governed",
      component: "MandatoryDisclosure",
      summary: "Present a mandatory regulatory disclosure that must be acknowledged before proceeding.",
    },
    { intent: INTENTS.TRANSACTION_DETAIL, kind: "display", component: "TransactionDetail", summary: "Show one transaction's full detail." },
    { intent: INTENTS.LIST_ACCOUNTS, kind: "display", component: "AccountList", summary: "Show the list of accounts with balances." },
    { intent: INTENTS.LIST_STATEMENTS, kind: "display", component: "StatementList", summary: "Show available account statements." },
    { intent: INTENTS.CASHFLOW_SUMMARY, kind: "display", component: "CashflowSummary", summary: "Show inflow vs outflow for a period." },
    { intent: INTENTS.BALANCE_TREND, kind: "display", component: "BalanceTrend", summary: "Show an account's balance trend over time." },
    { intent: INTENTS.ACTIVITY_FEED, kind: "display", component: "ActivityFeed", summary: "Show a recent account-activity feed." },
    { intent: INTENTS.INSIGHT, kind: "display", component: "InsightCard", summary: "Show a single financial insight." },
    { intent: INTENTS.LIST_RECURRING, kind: "display", component: "RecurringList", summary: "Show recurring subscriptions/charges." },
    { intent: INTENTS.LIST_INVOICES, kind: "display", component: "InvoiceList", summary: "Show B2B invoices." },
    { intent: INTENTS.ASSET_DETAIL, kind: "display", component: "AssetDetail", summary: "Show an asset quote with a price trend." },
    { intent: INTENTS.ORDER_HISTORY, kind: "display", component: "OrderHistory", summary: "Show trade order history." },
    { intent: INTENTS.FX_QUOTE, kind: "display", component: "FxQuote", summary: "Show an FX rate quote." },
    { intent: INTENTS.CRYPTO_HOLDINGS, kind: "display", component: "CryptoHoldings", summary: "Show crypto holdings." },
    { intent: INTENTS.SAVINGS_GOAL, kind: "display", component: "SavingsGoal", summary: "Show savings-goal progress." },
    { intent: INTENTS.NET_WORTH, kind: "display", component: "NetWorth", summary: "Show net worth (assets - liabilities)." },
    { intent: INTENTS.ALERTS_FEED, kind: "display", component: "AlertsFeed", summary: "Show an account alerts feed." },
    { intent: INTENTS.SEARCH_RESULTS, kind: "display", component: "SearchResults", summary: "Show unified search results." },
    { intent: INTENTS.P2P_PAYMENT, kind: "governed", component: "GovernedActionDialog", summary: "Send a P2P payment (governed: step-up above $2,500)." },
    { intent: INTENTS.BILL_PAY, kind: "governed", component: "GovernedActionDialog", summary: "Pay a bill (governed: authorization above $10,000)." },
    { intent: INTENTS.RECURRING_SETUP, kind: "governed", component: "GovernedActionDialog", summary: "Set up a recurring transfer (governed: per-cycle cap above $5,000)." },
    { intent: INTENTS.FX_CONVERT, kind: "governed", component: "GovernedActionDialog", summary: "Convert currency (governed: authorization above $10,000)." },
    { intent: INTENTS.CRYPTO_WITHDRAW, kind: "governed", component: "GovernedActionDialog", summary: "Withdraw crypto (governed: FATF Travel Rule above $1,000)." },
    { intent: INTENTS.WITHDRAW, kind: "governed", component: "GovernedActionDialog", summary: "Withdraw cash (governed: CTR + authorization above $10,000)." },
    { intent: INTENTS.ISSUE_CARD, kind: "governed", component: "GovernedActionDialog", summary: "Issue a card (governed: identity step-up)." },
    { intent: INTENTS.CARD_CONTROL, kind: "governed", component: "GovernedActionDialog", summary: "Freeze/cancel a card (governed: destructive actions step-up)." },
    { intent: INTENTS.CHANGE_LIMIT, kind: "governed", component: "GovernedActionDialog", summary: "Change a spending limit (governed: dual-control above $10,000)." },
    { intent: INTENTS.SECURITY_CHANGE, kind: "governed", component: "GovernedActionDialog", summary: "Change PIN/password/MFA (governed: 2FA step-up)." },
    { intent: INTENTS.ADD_USER, kind: "governed", component: "GovernedActionDialog", summary: "Add an authorized user (governed: verification step-up)." },
    { intent: INTENTS.KYC, kind: "governed", component: "GovernedActionDialog", summary: "Complete KYC verification (governed: identity step-up)." },
    { intent: INTENTS.ADD_PAYEE, kind: "governed", component: "GovernedActionDialog", summary: "Add a payee/beneficiary (governed: new-payee verification)." },
    { intent: INTENTS.LINK_ACCOUNT, kind: "governed", component: "GovernedActionDialog", summary: "Link an external account (governed: consent step-up)." },
    { intent: INTENTS.DISPUTE, kind: "governed", component: "GovernedActionDialog", summary: "Dispute a transaction (governed: identity + evidence step-up)." },
    { intent: INTENTS.CLOSE_ACCOUNT, kind: "governed", component: "GovernedActionDialog", summary: "Close an account (governed: destructive, dual-control)." },
    { intent: INTENTS.PLACE_TRADE, kind: "governed", component: "GovernedActionDialog", summary: "Place a trade (governed: order confirmation step-up)." },
    { intent: INTENTS.ENABLE_MARGIN, kind: "governed", component: "MandatoryDisclosure", summary: "Enable margin/options (governed: suitability disclosure)." },
    { intent: INTENTS.CREDIT_REQUEST, kind: "governed", component: "MandatoryDisclosure", summary: "Request credit/loan (governed: TILA disclosure)." },
  ];
}
