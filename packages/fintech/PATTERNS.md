# SINA Fintech Pattern Catalog

The catalog of fintech UI patterns SINA renders — **governed** and **ungoverned** — across the
domains of modern fintech apps. It is the human companion to the machine-readable source of truth,
`src/registry.ts` (intent verb → constitution rule → mounted component).

## The one model

> **Every intent is validated-then-mounted. Governance is an optional escalation layer.**

- **Ungoverned (display / read)** — a `ConstitutionRule` with a schema but **no policy, no
  escalations**. It shape-validates the props (integer minor-unit amounts, ISO timestamps,
  `.strict()` against smuggled keys/actions, bounded arrays) and mounts a **presentational**
  component. Even a read is gated and audited; SINA validates the payload's **shape + provenance**,
  not the truthfulness or safety of the app's own data (source props from trusted tools; components
  render text, never raw HTML).
- **Governed (write / risk / compliance)** — a rule that additionally carries a **policy** (cited
  limits, velocity, verification, dual-control, suitability, KYC/AML, step-up) and **escalations**
  that force a stricter component (e.g. `SecureWireDialog`). Every threshold traces to a standard
  (`/new-schema` golden rule).

**Displays are read-only.** A display never renders a write action; any action it offers emits a
**new intent** through the gate (`onIntent`), which may escalate. This keeps the invariant intact.

Status: ✅ implemented · ⬜ backlog (scaffold via `/new-display-pattern`, `/new-schema`,
`/new-governed-component`). **The whole catalog is implemented** (ROADMAP Phase 6 + the
agent-executed Phase 6.5 sweep): every row has a schema, fixtures, a registry entry, a green gate
test, and a playground scenario; display components pass jest-axe.

---

## Ungoverned — display / read (compose existing `core` primitives)

| Pattern | Intent verb | Mounts | Composes | Status |
|---|---|---|---|---|
| Transaction list | `list_transactions` | `TransactionList` | Stack, (Badge) | ✅ |
| Account balance | `account_balance` | `BalanceCard` | Stack, SummaryList | ✅ |
| Transaction detail | `transaction_detail` | `TransactionDetail` | SummaryList, Badge, Separator | ✅ |
| Account list / switcher | `list_accounts` | `AccountList` | Grid/Stack, SummaryList | ✅ |
| Statement list | `list_statements` | `StatementList` | SummaryList | ✅ |
| Spending breakdown | `spending_breakdown` | `SpendingBreakdown` | Stack, **PieChart**¹ | ✅ |
| Cashflow summary | `cashflow_summary` | `CashflowSummary` | SummaryList, **BarChart**¹ | ✅ |
| Balance trend | `balance_trend` | `BalanceTrend` | KpiStat, **LineChart**¹ | ✅ |
| Recent activity feed | `activity_feed` | `ActivityFeed` | Stack, Badge | ✅ |
| Insight card | `insight` | `InsightCard` | Alert, Badge | ✅ |
| Card display / wallet | `list_cards` | `CardList` | Grid, Badge, Stack | ✅ |
| Rewards summary | `rewards_summary` | `RewardsSummary` | SummaryList, Progress, Badge | ✅ |
| Payee list | `list_payees` | `PayeeList` | Stack, Badge | ✅ |
| Subscriptions / recurring | `list_recurring` | `RecurringList` | SummaryList, Badge | ✅ |
| Invoice list / detail (B2B) | `list_invoices` | `InvoiceList` | SummaryList, Badge | ✅ |
| Upcoming payments | `upcoming_payments` | `UpcomingPayments` | Stack, Badge | ✅ |
| Portfolio holdings | `portfolio_holdings` | `PortfolioHoldings` | Stack, Badge, **DonutChart**¹ | ✅ |
| Asset detail / quote | `asset_detail` | `AssetDetail` | SummaryList, **LineChart**¹ | ✅ |
| Watchlist | `watchlist` | `Watchlist` | Stack, Badge | ✅ |
| Order history | `order_history` | `OrderHistory` | SummaryList, Badge | ✅ |
| FX quote | `fx_quote` | `FxQuote` | SummaryList, Badge | ✅ |
| Crypto holdings | `crypto_holdings` | `CryptoHoldings` | SummaryList, Badge | ✅ |
| Budget progress | `budget_progress` | `BudgetProgress` | Stack, Progress, Badge | ✅ |
| Savings goal | `savings_goal` | `SavingsGoal` | Progress, SummaryList, Badge | ✅ |
| Net worth | `net_worth` | `NetWorth` | SummaryList | ✅ |
| Alerts feed | `alerts_feed` | `AlertsFeed` | Stack, Alert, Badge | ✅ |
| Search results | `search_results` | `SearchResults` | SummaryList, Combobox | ✅ |

¹ **Charts** — two `core` chart families back these reads. The interactive **Chart.js** primitives
(`LineChart`, `BarChart`, `PieChart`, `DonutChart` — `role="img"` + label, canvas `aria-hidden`,
hover tooltip, `valueFormatter` hook) are composed by `BalanceTrend`, `AssetDetail`, `CashflowSummary`,
`SpendingBreakdown`, and `PortfolioHoldings`; each pairs its chart with a text summary/legend so the
mouse-only tooltip is never the sole path to the data (and each is therefore `"use client"`). The
lightweight SVG sparkline `Chart` (`currentColor`-driven, server-mountable) still backs the compact
list reads (`CryptoHoldings`, `NetWorth`, `StatementList`). Tabular reads (transactions/orders) still
use the axe-clean list form; a `Table` primitive remains optional.

---

## Governed — write / risk / compliance (policy + escalation, every rule cited)

| Pattern | Intent verb | Escalates to | Governance dimension | Status |
|---|---|---|---|---|
| Wire transfer | `wire_transfer` | `SecureWireDialog` | Travel Rule / SAR / CTR / $50k dual-control | ✅ |
| ACH transfer | `ach_transfer` | `SecureTransferDialog` | NACHA, amount, velocity | ✅ |
| P2P payment | `p2p_payment` | `SecurePaymentDialog` | new-recipient friction, velocity, caps | ✅ |
| Bill pay | `bill_pay` | `SecureBillPayDialog` | payee verification, amount | ✅ |
| Recurring transfer setup | `recurring_setup` | `SecureRecurringDialog` | mandate, per-cycle cap | ✅ |
| FX conversion | `fx_convert` | `SecureFxDialog` | rate lock, cross-border step-up | ✅ |
| Crypto withdrawal | `crypto_withdraw` | `SecureCryptoWithdrawalDialog` | allowlist, Travel Rule | ✅ |
| Large withdrawal | `withdraw` | `SecureWithdrawalDialog` | CTR $10k, velocity | ✅ |
| Card issuance | `issue_card` | `SecureCardIssueDialog` | identity, eligibility | ✅ |
| Card freeze / cancel | `card_control` | `CardControlDialog` | cancel destructive → step-up | ✅ |
| Change spending limit | `change_limit` | `SecureLimitChangeDialog` | dual-control | ✅ |
| Change PIN / security | `security_change` | `StepUpAuthDialog` | 2FA step-up | ✅ |
| Add authorized user | `add_user` | `SecureGrantAccessDialog` | verification | ✅ |
| KYC verification | `kyc` | `KycFlow` | regulatory required fields | ✅ |
| Add payee / beneficiary | `add_payee` | `PayeeVerificationDialog` | micro-deposit, sanctions | ✅ |
| Link external account | `link_account` | `SecureLinkDialog` | consent, never store raw creds | ✅ |
| Dispute transaction | `dispute` | `DisputeFlow` | regulated timelines, evidence | ✅ |
| Close account | `close_account` | `SecureCloseDialog` | destructive, step-up | ✅ |
| Consent / disclosure | `disclosure` | `MandatoryDisclosure` | acknowledge before proceed | ✅ |
| Place trade | `place_trade` | `SecureTradeDialog` | suitability, market hours, caps | ✅ |
| Enable margin / options | `enable_margin` | `SuitabilityGateDialog` | eligibility, disclosures | ✅ |
| Approve pending txn (B2B) | `approve_pending` | `ApprovalQueueDialog` | maker-checker dual-control | ✅ |
| Loan / credit request | `credit_request` | `SecureCreditRequestDialog` | eligibility, disclosures | ✅ |

> **Realized components.** The **Escalates to** column names each flow's *logical* escalation target.
> Phase 6 consolidates them onto a small set of **real, un-bypassable** components that reuse the
> `SecureWireDialog` mechanics: **`SecureWireDialog`** (the bespoke wire flow), **`GovernedActionDialog`**
> (every approval / step-up money-movement, card, security, trade, and B2B flow), and
> **`MandatoryDisclosure`** (acknowledge-before-proceed: disclosures, margin, credit). All three are
> driven by the shared `formats/step-up.ts` dual-control envelope; the constitution — not the model —
> decides which one is forced, and re-verifies server-side. `src/registry.ts` maps each intent verb to
> its schema and the component the gate forces.

---

## Adding a pattern

- **Ungoverned display** → `/new-display-pattern` (shape-only schema + fixtures + presentational
  component + registry entry + scenario).
- **Governed flow** → `/new-schema` (cited policy + escalation) then `/new-governed-component`.
- Register the new intent in `src/registry.ts` (and `fintechIntentManifest()`), add a playground
  scenario, and flip the status here to ✅.
