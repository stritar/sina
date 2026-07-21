/**
 * @sina-design-system/fintech-react
 *
 * SINA's fintech component layer — governed AND presentational. It MARRIES a
 * `core` primitive to the `fintech` constitution and renders the decision the
 * gate already made: a forced governed component on escalation (SecureWireDialog),
 * or a presentational display on a clean ungoverned pass (TransactionList,
 * BalanceCard). The one package allowed to import both `core` (primitives) and
 * `fintech` (the rules); it authors no schemas of its own (no `zod`).
 *
 * The invariant (§1b): validation is server-side. These components never gate a
 * payload — governed ones collect evidence and surface the verdict; presentational
 * ones render already-validated props (as text, never raw HTML) and stay
 * read-only: any action re-enters the gate as a new intent.
 */

export {
  FintechLocaleProvider,
  useFintechLocale,
  type FintechLocaleProviderProps,
} from "./locale.js";

export {
  SecureWireDialog,
  type SecureWireDialogProps,
  type WireApprovalEvidence,
  type SecureWireRegateResult,
} from "./SecureWireDialog/SecureWireDialog.js";

export {
  GovernedActionDialog,
  type GovernedActionDialogProps,
  type GovernedActionEvidence,
  type GovernedActionRegateResult,
} from "./GovernedActionDialog/GovernedActionDialog.js";
export {
  MandatoryDisclosure,
  type MandatoryDisclosureProps,
  type DisclosureAcknowledgement,
} from "./MandatoryDisclosure/MandatoryDisclosure.js";

export { TransactionList, type TransactionListProps } from "./TransactionList/TransactionList.js";
export { BalanceCard, type BalanceCardProps } from "./BalanceCard/BalanceCard.js";
export { SpendingBreakdown, type SpendingBreakdownProps } from "./SpendingBreakdown/SpendingBreakdown.js";
export { BudgetProgress, type BudgetProgressProps } from "./BudgetProgress/BudgetProgress.js";
export { CardList, type CardListProps } from "./CardList/CardList.js";
export { RewardsSummary, type RewardsSummaryProps } from "./RewardsSummary/RewardsSummary.js";
export { PayeeList, type PayeeListProps } from "./PayeeList/PayeeList.js";
export { UpcomingPayments, type UpcomingPaymentsProps } from "./UpcomingPayments/UpcomingPayments.js";
export { PortfolioHoldings, type PortfolioHoldingsProps } from "./PortfolioHoldings/PortfolioHoldings.js";
export { Watchlist, type WatchlistProps } from "./Watchlist/Watchlist.js";
export { TransactionDetail, type TransactionDetailProps } from "./TransactionDetail/TransactionDetail.js";
export { AccountList, type AccountListProps } from "./AccountList/AccountList.js";
export { StatementList, type StatementListProps } from "./StatementList/StatementList.js";
export { CashflowSummary, type CashflowSummaryProps } from "./CashflowSummary/CashflowSummary.js";
export { BalanceTrend, type BalanceTrendProps } from "./BalanceTrend/BalanceTrend.js";
export { ActivityFeed, type ActivityFeedProps } from "./ActivityFeed/ActivityFeed.js";
export { InsightCard, type InsightCardProps } from "./InsightCard/InsightCard.js";
export { RecurringList, type RecurringListProps } from "./RecurringList/RecurringList.js";
export { InvoiceList, type InvoiceListProps } from "./InvoiceList/InvoiceList.js";
export { AssetDetail, type AssetDetailProps } from "./AssetDetail/AssetDetail.js";
export { OrderHistory, type OrderHistoryProps } from "./OrderHistory/OrderHistory.js";
export { FxQuote, type FxQuoteProps } from "./FxQuote/FxQuote.js";
export { CryptoHoldings, type CryptoHoldingsProps } from "./CryptoHoldings/CryptoHoldings.js";
export { SavingsGoal, type SavingsGoalProps } from "./SavingsGoal/SavingsGoal.js";
export { NetWorth, type NetWorthProps } from "./NetWorth/NetWorth.js";
export { AlertsFeed, type AlertsFeedProps } from "./AlertsFeed/AlertsFeed.js";
export { SearchResults, type SearchResultsProps } from "./SearchResults/SearchResults.js";
export { ClarifyChoice, type ClarifyChoiceProps } from "./ClarifyChoice/ClarifyChoice.js";
