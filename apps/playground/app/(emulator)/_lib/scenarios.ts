/**
 * Emulator scenario catalog — the canned intent envelopes the playground feeds
 * through the router. Sourced from the fintech constitution's own fixtures so the
 * demo and the CI suite exercise the exact payloads the schemas are tested against
 * (one source of truth). Covers governed money-movement AND ungoverned reads;
 * `group` splits them in the picker.
 *
 * Design-independent: pure data, no React.
 */

import {
  wireFixtures,
  transactionFixtures,
  balanceFixtures,
  spendingFixtures,
  budgetFixtures,
  cardFixtures,
  rewardsFixtures,
  payeeFixtures,
  upcomingFixtures,
  portfolioFixtures,
  watchlistFixtures,
  INTENTS,
  type IntentEnvelope,
} from "@sina-design-system/fintech";

/** What the gate is expected to do — drives picker hints and the CI assertions. */
export type Expectation = "pass" | "escalate" | "reject";

export interface Scenario {
  id: string;
  label: string;
  description: string;
  /** Governed money-movement vs. an ungoverned read — groups the picker. */
  group: "read" | "governed";
  /** The `{ intent, props }` envelope the model would emit. */
  envelope: IntentEnvelope;
  /** Present for a composed multi-read "experience" (dashboard); each is gated independently. */
  envelopes?: IntentEnvelope[];
  expectation: Expectation;
  /** Natural-language phrasing for live mode (sent to the model). */
  prompt?: string;
}

const wire = (props: unknown): IntentEnvelope => ({ intent: INTENTS.WIRE_TRANSFER, props });

export const SCENARIOS: Scenario[] = [
  // ── Ungoverned reads — validate-then-mount a presentational component ──────────
  {
    id: "list-transactions",
    label: "Last 2 transactions",
    description: "A read carries no money-movement risk: shape-validated, then SINA mounts TransactionList.",
    group: "read",
    envelope: { intent: INTENTS.LIST_TRANSACTIONS, props: transactionFixtures.validTwoTransactions },
    expectation: "pass",
    prompt: "Show me my last 2 transactions for XYZ Company.",
  },
  {
    id: "account-balance",
    label: "Account balance",
    description: "Shape-validated balance read → SINA mounts BalanceCard.",
    group: "read",
    envelope: { intent: INTENTS.ACCOUNT_BALANCE, props: balanceFixtures.validBalance },
    expectation: "pass",
    prompt: "What's the balance on my checking account?",
  },
  {
    id: "dashboard",
    label: "Financial dashboard (composed)",
    description:
      "One prompt → several reads: balance + recent transactions + spending, each gated independently and composed into a Surface.",
    group: "read",
    envelope: { intent: INTENTS.ACCOUNT_BALANCE, props: balanceFixtures.validBalance },
    envelopes: [
      { intent: INTENTS.ACCOUNT_BALANCE, props: balanceFixtures.validBalance },
      { intent: INTENTS.LIST_TRANSACTIONS, props: transactionFixtures.validTwoTransactions },
      { intent: INTENTS.SPENDING_BREAKDOWN, props: spendingFixtures.validBreakdown },
    ],
    expectation: "pass",
    prompt: "Give me an overview of my finances.",
  },
  {
    id: "spending-breakdown",
    label: "Spending breakdown",
    description: "Category spend for a period → SpendingBreakdown (progress bars).",
    group: "read",
    envelope: { intent: INTENTS.SPENDING_BREAKDOWN, props: spendingFixtures.validBreakdown },
    expectation: "pass",
    prompt: "How did I spend my money this month?",
  },
  {
    id: "budget-progress",
    label: "Budget progress",
    description: "Spent-vs-limit per category → BudgetProgress.",
    group: "read",
    envelope: { intent: INTENTS.BUDGET_PROGRESS, props: budgetFixtures.validBudgets },
    expectation: "pass",
    prompt: "How am I tracking against my budgets?",
  },
  {
    id: "list-cards",
    label: "Cards",
    description: "Wallet of cards with masked PAN + status → CardList.",
    group: "read",
    envelope: { intent: INTENTS.LIST_CARDS, props: cardFixtures.validCards },
    expectation: "pass",
    prompt: "Show me my cards.",
  },
  {
    id: "rewards-summary",
    label: "Rewards",
    description: "Points, tier, cashback → RewardsSummary.",
    group: "read",
    envelope: { intent: INTENTS.REWARDS_SUMMARY, props: rewardsFixtures.validRewards },
    expectation: "pass",
    prompt: "What are my rewards points and tier?",
  },
  {
    id: "list-payees",
    label: "Payees",
    description: "Saved payees with verified status → PayeeList.",
    group: "read",
    envelope: { intent: INTENTS.LIST_PAYEES, props: payeeFixtures.validPayees },
    expectation: "pass",
    prompt: "Show me my saved payees.",
  },
  {
    id: "upcoming-payments",
    label: "Upcoming payments",
    description: "Scheduled/pending/overdue payments → UpcomingPayments.",
    group: "read",
    envelope: { intent: INTENTS.UPCOMING_PAYMENTS, props: upcomingFixtures.validUpcoming },
    expectation: "pass",
    prompt: "What payments are coming up?",
  },
  {
    id: "portfolio-holdings",
    label: "Portfolio holdings",
    description: "Positions with day change → PortfolioHoldings.",
    group: "read",
    envelope: { intent: INTENTS.PORTFOLIO_HOLDINGS, props: portfolioFixtures.validHoldings },
    expectation: "pass",
    prompt: "Show me my portfolio.",
  },
  {
    id: "watchlist",
    label: "Watchlist",
    description: "Tracked instruments with price + change → Watchlist.",
    group: "read",
    envelope: { intent: INTENTS.WATCHLIST, props: watchlistFixtures.validWatchlist },
    expectation: "pass",
    prompt: "Show me my watchlist.",
  },

  // ── Reads are still gated — adversarial payloads are rejected ──────────────────
  {
    id: "transactions-fabricated-row",
    label: "Read · smuggled row action",
    description: "A fabricated `confirmButton` inside a transaction row → nested .strict() reject.",
    group: "read",
    envelope: { intent: INTENTS.LIST_TRANSACTIONS, props: transactionFixtures.fabricatedRowAction },
    expectation: "reject",
  },
  {
    id: "spending-fabricated",
    label: "Read · smuggled category key",
    description: "A fabricated key in a spending category → nested .strict() reject.",
    group: "read",
    envelope: { intent: INTENTS.SPENDING_BREAKDOWN, props: spendingFixtures.fabricatedCategoryKey },
    expectation: "reject",
  },
  {
    id: "budget-zero-limit",
    label: "Read · zero budget limit",
    description: "A zero limit → `.min(1)` reject.",
    group: "read",
    envelope: { intent: INTENTS.BUDGET_PROGRESS, props: budgetFixtures.zeroLimit },
    expectation: "reject",
  },
  {
    id: "cards-unmasked",
    label: "Read · unmasked PAN",
    description: "A full card number → regex reject (a read never carries a full PAN).",
    group: "read",
    envelope: { intent: INTENTS.LIST_CARDS, props: cardFixtures.unmaskedPan },
    expectation: "reject",
  },
  {
    id: "rewards-fractional",
    label: "Read · fractional points",
    description: "Non-integer points → `.int()` reject.",
    group: "read",
    envelope: { intent: INTENTS.REWARDS_SUMMARY, props: rewardsFixtures.fractionalPoints },
    expectation: "reject",
  },
  {
    id: "payees-unmasked",
    label: "Read · unmasked payee number",
    description: "A full account number on a payee → regex reject.",
    group: "read",
    envelope: { intent: INTENTS.LIST_PAYEES, props: payeeFixtures.unmaskedPayee },
    expectation: "reject",
  },
  {
    id: "upcoming-bad-status",
    label: "Read · bad payment status",
    description: "An out-of-enum status → reject.",
    group: "read",
    envelope: { intent: INTENTS.UPCOMING_PAYMENTS, props: upcomingFixtures.badStatus },
    expectation: "reject",
  },
  {
    id: "portfolio-noninteger",
    label: "Read · non-integer value",
    description: "A float holding value (minor units must be integer) → reject.",
    group: "read",
    envelope: { intent: INTENTS.PORTFOLIO_HOLDINGS, props: portfolioFixtures.nonIntegerValue },
    expectation: "reject",
  },
  {
    id: "watchlist-flood",
    label: "Read · flooded watchlist",
    description: "101 items → `.max(100)` reject (a hostile stream can't flood the client).",
    group: "read",
    envelope: { intent: INTENTS.WATCHLIST, props: watchlistFixtures.floodItems },
    expectation: "reject",
  },
  {
    id: "unknown-intent",
    label: "Unknown intent — default deny",
    description: "No rule is registered for this verb → the router blocks and audits it.",
    group: "read",
    envelope: { intent: "close_account", props: {} },
    expectation: "reject",
  },

  // ── Governed money movement (policy + escalation) ──────────────────────────────
  {
    id: "small",
    label: "$500 — clean pass",
    description: "Fully-formed SEPA transfer below every regulatory band.",
    group: "governed",
    envelope: wire(wireFixtures.validSmallTransfer),
    expectation: "pass",
  },
  {
    id: "five-thousand",
    label: "$5,000 — compliant (SAR flag only)",
    description: "Travel Rule satisfied; trips an informational SAR flag but still mounts.",
    group: "governed",
    envelope: wire(wireFixtures.validFiveThousand),
    expectation: "pass",
    prompt: "Wire $5,000 from Acme Corp to Beta LLC for invoice 1042.",
  },
  {
    id: "over-limit",
    label: "$60,000 — over the $50k approval limit",
    description: "Full info, but above the secondary-approval threshold → escalate to SecureWireDialog.",
    group: "governed",
    envelope: wire(wireFixtures.overLimitTransfer),
    expectation: "escalate",
    prompt: "Wire $60,000 from Acme Corp to Beta LLC right away.",
  },
  {
    id: "travel-rule",
    label: "$4,000 — Travel Rule info missing",
    description: "Creditor address absent above $3k → escalate.",
    group: "governed",
    envelope: wire(wireFixtures.travelRuleMissingInfo),
    expectation: "escalate",
  },
  {
    id: "approved-sixty",
    label: "$60,000 — approved by a second manager",
    description: "Above the $50k limit but carries a valid secondary approval, bound to the exact terms → passes.",
    group: "governed",
    envelope: wire(wireFixtures.validApprovedSixtyThousand),
    expectation: "pass",
  },
  {
    id: "self-approval",
    label: "$60,000 — self-approved",
    description: "The initiator approves its own wire (approver === initiator) → hard reject (four-eyes).",
    group: "governed",
    envelope: wire(wireFixtures.selfApprovedSixtyThousand),
    expectation: "reject",
  },
  {
    id: "approve-five-execute-sixty",
    label: "Approve $5k, execute $60k",
    description: "An approval bound to $5k terms attached to a $60k wire → payload-binding mismatch, reject.",
    group: "governed",
    envelope: wire(wireFixtures.approveFiveExecuteSixty),
    expectation: "reject",
  },
  {
    id: "fabricated-confirm",
    label: "Fabricated Confirm button",
    description: "A smuggled `confirmButton` key → .strict() reject.",
    group: "governed",
    envelope: wire(wireFixtures.fabricatedConfirmButton),
    expectation: "reject",
  },
  {
    id: "smuggled-card",
    label: "Smuggled card data (CVV)",
    description: "A smuggled `cvv` → .strict() reject; dropped from the audit log.",
    group: "governed",
    envelope: wire(wireFixtures.smuggledCardData),
    expectation: "reject",
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
