/**
 * The presentational reads, in one barrel.
 *
 * Exists purely so the registry can pull all 27 ungoverned read components through a
 * SINGLE dynamic import — one shared async chunk — instead of 27. A wire scenario
 * (the only kind the docs run) then never downloads any of them, and never downloads
 * chart.js.
 */

export {
  TransactionList,
  BalanceCard,
  SpendingBreakdown,
  BudgetProgress,
  CardList,
  RewardsSummary,
  PayeeList,
  UpcomingPayments,
  PortfolioHoldings,
  Watchlist,
  TransactionDetail,
  AccountList,
  StatementList,
  CashflowSummary,
  BalanceTrend,
  ActivityFeed,
  InsightCard,
  RecurringList,
  InvoiceList,
  AssetDetail,
  OrderHistory,
  FxQuote,
  CryptoHoldings,
  SavingsGoal,
  NetWorth,
  AlertsFeed,
  SearchResults,
} from "@sina-design-system/fintech-react";
