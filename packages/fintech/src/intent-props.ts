/**
 * The verb → payload-type map — the TypeScript twin of the intent registry.
 *
 * `IntentPropsMap` keys every intent verb in {@link INTENTS} to the payload type
 * its rule gates (governed verbs use the approval/step-up-bearing envelope, so
 * the type also covers a re-submission). The registry's `INTENT_SCHEMAS` map is
 * declared `satisfies { [K in FintechIntent]: z.ZodType<IntentPropsMap[K]> }`,
 * which proves at compile time that every verb has both a schema and a type and
 * that the two agree — this file cannot silently drift from the constitution.
 *
 * Server-side, type your adapter that builds a display payload as
 * `IntentProps<"list_transactions">` and the compiler holds it to the shape the
 * gate will enforce. Client-side the display components keep `payload: unknown`
 * on purpose: they re-parse what they are handed and trust only the gate.
 */

import type { ApprovedWireTransferPayload } from "./wire-transfer/wire-transfer.schema.js";
import type { AchTransferPayload } from "./ach-transfer/ach-transfer.schema.js";
import type { DisclosurePayload } from "./disclosure/disclosure.schema.js";
import type { P2pPaymentPayload } from "./p2p-payment/p2p-payment.schema.js";
import type { BillPayPayload } from "./bill-pay/bill-pay.schema.js";
import type { RecurringSetupPayload } from "./recurring-setup/recurring-setup.schema.js";
import type { FxConvertPayload } from "./fx-convert/fx-convert.schema.js";
import type { CryptoWithdrawPayload } from "./crypto-withdraw/crypto-withdraw.schema.js";
import type { WithdrawPayload } from "./withdraw/withdraw.schema.js";
import type { IssueCardPayload } from "./issue-card/issue-card.schema.js";
import type { CardControlPayload } from "./card-control/card-control.schema.js";
import type { ChangeLimitPayload } from "./change-limit/change-limit.schema.js";
import type { SecurityChangePayload } from "./security-change/security-change.schema.js";
import type { AddUserPayload } from "./add-user/add-user.schema.js";
import type { KycPayload } from "./kyc/kyc.schema.js";
import type { AddPayeePayload } from "./add-payee/add-payee.schema.js";
import type { LinkAccountPayload } from "./link-account/link-account.schema.js";
import type { DisputePayload } from "./dispute/dispute.schema.js";
import type { CloseAccountPayload } from "./close-account/close-account.schema.js";
import type { PlaceTradePayload } from "./place-trade/place-trade.schema.js";
import type { EnableMarginPayload } from "./enable-margin/enable-margin.schema.js";
import type { CreditRequestPayload } from "./credit-request/credit-request.schema.js";
import type { TransactionListPayload } from "./transaction-list/transaction-list.schema.js";
import type { TransactionDetailPayload } from "./transaction-detail/transaction-detail.schema.js";
import type { AccountListPayload } from "./account-list/account-list.schema.js";
import type { StatementListPayload } from "./statement-list/statement-list.schema.js";
import type { CashflowSummaryPayload } from "./cashflow-summary/cashflow-summary.schema.js";
import type { BalanceTrendPayload } from "./balance-trend/balance-trend.schema.js";
import type { ActivityFeedPayload } from "./activity-feed/activity-feed.schema.js";
import type { InsightCardPayload } from "./insight-card/insight-card.schema.js";
import type { RecurringListPayload } from "./recurring-list/recurring-list.schema.js";
import type { InvoiceListPayload } from "./invoice-list/invoice-list.schema.js";
import type { AssetDetailPayload } from "./asset-detail/asset-detail.schema.js";
import type { OrderHistoryPayload } from "./order-history/order-history.schema.js";
import type { FxQuotePayload } from "./fx-quote/fx-quote.schema.js";
import type { CryptoHoldingsPayload } from "./crypto-holdings/crypto-holdings.schema.js";
import type { SavingsGoalPayload } from "./savings-goal/savings-goal.schema.js";
import type { NetWorthPayload } from "./net-worth/net-worth.schema.js";
import type { AlertsFeedPayload } from "./alerts-feed/alerts-feed.schema.js";
import type { SearchResultsPayload } from "./search-results/search-results.schema.js";
import type { AccountBalancePayload } from "./account-balance/account-balance.schema.js";
import type { SpendingBreakdownPayload } from "./spending-breakdown/spending-breakdown.schema.js";
import type { BudgetProgressPayload } from "./budget-progress/budget-progress.schema.js";
import type { CardListPayload } from "./card-list/card-list.schema.js";
import type { RewardsSummaryPayload } from "./rewards-summary/rewards-summary.schema.js";
import type { PayeeListPayload } from "./payee-list/payee-list.schema.js";
import type { UpcomingPaymentsPayload } from "./upcoming-payments/upcoming-payments.schema.js";
import type { PortfolioHoldingsPayload } from "./portfolio-holdings/portfolio-holdings.schema.js";
import type { WatchlistPayload } from "./watchlist/watchlist.schema.js";
import type { ClarifyChoicePayload } from "./clarify-choice/clarify-choice.schema.js";

/** Every intent verb mapped to the payload type its constitution rule gates. */
export interface IntentPropsMap {
  wire_transfer: ApprovedWireTransferPayload;
  ach_transfer: AchTransferPayload;
  disclosure: DisclosurePayload;
  p2p_payment: P2pPaymentPayload;
  bill_pay: BillPayPayload;
  recurring_setup: RecurringSetupPayload;
  fx_convert: FxConvertPayload;
  crypto_withdraw: CryptoWithdrawPayload;
  withdraw: WithdrawPayload;
  issue_card: IssueCardPayload;
  card_control: CardControlPayload;
  change_limit: ChangeLimitPayload;
  security_change: SecurityChangePayload;
  add_user: AddUserPayload;
  kyc: KycPayload;
  add_payee: AddPayeePayload;
  link_account: LinkAccountPayload;
  dispute: DisputePayload;
  close_account: CloseAccountPayload;
  place_trade: PlaceTradePayload;
  enable_margin: EnableMarginPayload;
  credit_request: CreditRequestPayload;
  list_transactions: TransactionListPayload;
  transaction_detail: TransactionDetailPayload;
  list_accounts: AccountListPayload;
  list_statements: StatementListPayload;
  cashflow_summary: CashflowSummaryPayload;
  balance_trend: BalanceTrendPayload;
  activity_feed: ActivityFeedPayload;
  insight: InsightCardPayload;
  list_recurring: RecurringListPayload;
  list_invoices: InvoiceListPayload;
  asset_detail: AssetDetailPayload;
  order_history: OrderHistoryPayload;
  fx_quote: FxQuotePayload;
  crypto_holdings: CryptoHoldingsPayload;
  savings_goal: SavingsGoalPayload;
  net_worth: NetWorthPayload;
  alerts_feed: AlertsFeedPayload;
  search_results: SearchResultsPayload;
  account_balance: AccountBalancePayload;
  spending_breakdown: SpendingBreakdownPayload;
  budget_progress: BudgetProgressPayload;
  list_cards: CardListPayload;
  rewards_summary: RewardsSummaryPayload;
  list_payees: PayeeListPayload;
  upcoming_payments: UpcomingPaymentsPayload;
  portfolio_holdings: PortfolioHoldingsPayload;
  watchlist: WatchlistPayload;
  clarify_choice: ClarifyChoicePayload;
}

/** The payload type for one verb: `IntentProps<"wire_transfer">`. */
export type IntentProps<I extends keyof IntentPropsMap> = IntentPropsMap[I];
