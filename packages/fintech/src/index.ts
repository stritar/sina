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

// The cited numeric limits (the legible constitution).
export * from "./thresholds.js";

// The flagship governed schema.
export * from "./wire-transfer/wire-transfer.schema.js";

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

// The intent router registry: verb → rule + mount, and the single gate entry point.
export * from "./registry.js";

// Canned compliant/adversarial payloads (consumed by the playground + tests).
export * as wireFixtures from "./wire-transfer/fixtures.js";
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
