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
  LIST_TRANSACTIONS: "list_transactions",
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
  ];
}
