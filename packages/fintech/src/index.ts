/**
 * @sina-design-system/fintech
 *
 * The Fintech "constitution": pure Zod schemas that intercept and validate LLM
 * intents server-side before they are allowed to render. No React, no UI. Every
 * rule traces to a standard or regulator (citations live on the rule); the
 * shared interception contract + audit come from `@sina-design-system/governance`.
 */

// Format primitives (ISO 4217 / 13616 / 9362, ABA, Luhn) + the minor-units model.
export * from "./formats/currency.js";
export * from "./formats/amount.js";
export * from "./formats/iban.js";
export * from "./formats/bic.js";
export * from "./formats/routing.js";
export * from "./formats/card.js";
export * from "./formats/canonical.js";
export * from "./formats/masked-account.js";
export * from "./formats/step-up.js";

// The cited numeric limits (the legible constitution).
export * from "./thresholds.js";

// The flagship governed schema.
export * from "./wire-transfer/wire-transfer.schema.js";

// Governed money-movement / action schemas (policy + escalation → a governed component).
export * from "./ach-transfer/ach-transfer.schema.js";
export * from "./disclosure/disclosure.schema.js";
export * from "./p2p-payment/p2p-payment.schema.js";
export * from "./bill-pay/bill-pay.schema.js";
export * from "./recurring-setup/recurring-setup.schema.js";
export * from "./fx-convert/fx-convert.schema.js";
export * from "./crypto-withdraw/crypto-withdraw.schema.js";
export * from "./withdraw/withdraw.schema.js";
export * from "./issue-card/issue-card.schema.js";
export * from "./card-control/card-control.schema.js";
export * from "./change-limit/change-limit.schema.js";
export * from "./security-change/security-change.schema.js";
export * from "./add-user/add-user.schema.js";
export * from "./kyc/kyc.schema.js";
export * from "./add-payee/add-payee.schema.js";
export * from "./link-account/link-account.schema.js";
export * from "./dispute/dispute.schema.js";
export * from "./close-account/close-account.schema.js";
export * from "./place-trade/place-trade.schema.js";
export * from "./enable-margin/enable-margin.schema.js";
export * from "./credit-request/credit-request.schema.js";

// Ungoverned display constitutions (shape-only; mount a presentational component).
export * from "./transaction-list/transaction-list.schema.js";
export * from "./account-balance/account-balance.schema.js";
export * from "./spending-breakdown/spending-breakdown.schema.js";
export * from "./budget-progress/budget-progress.schema.js";
export * from "./card-list/card-list.schema.js";
export * from "./rewards-summary/rewards-summary.schema.js";
export * from "./payee-list/payee-list.schema.js";
export * from "./upcoming-payments/upcoming-payments.schema.js";
export * from "./portfolio-holdings/portfolio-holdings.schema.js";
export * from "./watchlist/watchlist.schema.js";
export * from "./transaction-detail/transaction-detail.schema.js";
export * from "./account-list/account-list.schema.js";
export * from "./statement-list/statement-list.schema.js";
export * from "./cashflow-summary/cashflow-summary.schema.js";
export * from "./balance-trend/balance-trend.schema.js";
export * from "./activity-feed/activity-feed.schema.js";
export * from "./insight-card/insight-card.schema.js";
export * from "./recurring-list/recurring-list.schema.js";
export * from "./invoice-list/invoice-list.schema.js";
export * from "./asset-detail/asset-detail.schema.js";
export * from "./order-history/order-history.schema.js";
export * from "./fx-quote/fx-quote.schema.js";
export * from "./crypto-holdings/crypto-holdings.schema.js";
export * from "./savings-goal/savings-goal.schema.js";
export * from "./net-worth/net-worth.schema.js";
export * from "./alerts-feed/alerts-feed.schema.js";
export * from "./search-results/search-results.schema.js";

// The intent router registry: verb → rule + mount, and the single gate entry point.
export * from "./registry.js";

// Canned compliant/adversarial payloads (consumed by the playground + tests).
export * as wireFixtures from "./wire-transfer/fixtures.js";
export * as achFixtures from "./ach-transfer/fixtures.js";
export * as disclosureFixtures from "./disclosure/fixtures.js";
export * as p2pFixtures from "./p2p-payment/fixtures.js";
export * as billPayFixtures from "./bill-pay/fixtures.js";
export * as recurringSetupFixtures from "./recurring-setup/fixtures.js";
export * as fxConvertFixtures from "./fx-convert/fixtures.js";
export * as cryptoWithdrawFixtures from "./crypto-withdraw/fixtures.js";
export * as withdrawFixtures from "./withdraw/fixtures.js";
export * as issueCardFixtures from "./issue-card/fixtures.js";
export * as cardControlFixtures from "./card-control/fixtures.js";
export * as changeLimitFixtures from "./change-limit/fixtures.js";
export * as securityChangeFixtures from "./security-change/fixtures.js";
export * as addUserFixtures from "./add-user/fixtures.js";
export * as kycFixtures from "./kyc/fixtures.js";
export * as addPayeeFixtures from "./add-payee/fixtures.js";
export * as linkAccountFixtures from "./link-account/fixtures.js";
export * as disputeFixtures from "./dispute/fixtures.js";
export * as closeAccountFixtures from "./close-account/fixtures.js";
export * as placeTradeFixtures from "./place-trade/fixtures.js";
export * as enableMarginFixtures from "./enable-margin/fixtures.js";
export * as creditRequestFixtures from "./credit-request/fixtures.js";
export * as transactionDetailFixtures from "./transaction-detail/fixtures.js";
export * as accountListFixtures from "./account-list/fixtures.js";
export * as statementListFixtures from "./statement-list/fixtures.js";
export * as cashflowFixtures from "./cashflow-summary/fixtures.js";
export * as balanceTrendFixtures from "./balance-trend/fixtures.js";
export * as activityFeedFixtures from "./activity-feed/fixtures.js";
export * as insightFixtures from "./insight-card/fixtures.js";
export * as recurringFixtures from "./recurring-list/fixtures.js";
export * as invoiceFixtures from "./invoice-list/fixtures.js";
export * as assetDetailFixtures from "./asset-detail/fixtures.js";
export * as orderHistoryFixtures from "./order-history/fixtures.js";
export * as fxQuoteFixtures from "./fx-quote/fixtures.js";
export * as cryptoHoldingsFixtures from "./crypto-holdings/fixtures.js";
export * as savingsGoalFixtures from "./savings-goal/fixtures.js";
export * as netWorthFixtures from "./net-worth/fixtures.js";
export * as alertsFeedFixtures from "./alerts-feed/fixtures.js";
export * as searchResultsFixtures from "./search-results/fixtures.js";
export * as transactionFixtures from "./transaction-list/fixtures.js";
export * as balanceFixtures from "./account-balance/fixtures.js";
export * as spendingFixtures from "./spending-breakdown/fixtures.js";
export * as budgetFixtures from "./budget-progress/fixtures.js";
export * as cardFixtures from "./card-list/fixtures.js";
export * as rewardsFixtures from "./rewards-summary/fixtures.js";
export * as payeeFixtures from "./payee-list/fixtures.js";
export * as upcomingFixtures from "./upcoming-payments/fixtures.js";
export * as portfolioFixtures from "./portfolio-holdings/fixtures.js";
export * as watchlistFixtures from "./watchlist/fixtures.js";
