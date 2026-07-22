/**
 * Emulator gate-seam proof (direct-intent, mock-free, CI-safe).
 *
 * Drives the fintech router through the emulator gate seam and asserts the
 * interception guarantees without a live LLM:
 *   - governed wires escalate / reject as cited (Travel Rule, four-eyes, binding)
 *   - ungoverned reads validate-then-mount a presentational component
 *   - an unknown intent is default-denied
 *   - every decision emits a redacted audit event
 *
 * Run sandbox-off (vitest's `/tmp` mkdir EPERMs under the command sandbox).
 */

import { describe, expect, it } from "vitest";
import type { IntentEnvelope } from "@sina-design-system/fintech";

import { runGate, runExperience } from "./gate";
import { getScenario } from "./scenarios";

function envelopeOf(id: string): IntentEnvelope {
  const scenario = getScenario(id);
  if (!scenario) throw new Error(`unknown scenario: ${id}`);
  return scenario.envelope;
}

describe("emulator gate seam — governed money movement", () => {
  it("blocks the $60,000 over-limit stream and forces SecureWireDialog", () => {
    const { result, mount } = runGate(envelopeOf("over-limit"));
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("SecureWireDialog");
    expect(mount).toBe("SecureWireDialog");
  });

  it("mounts the standard primitive for a compliant $5,000 transfer", () => {
    const { result } = runGate(envelopeOf("five-thousand"));
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
  });

  it("rejects a fabricated Confirm button via .strict()", () => {
    const { result, schemaViolations } = runGate(envelopeOf("fabricated-confirm"));
    expect(result.valid).toBe(false);
    expect(schemaViolations.length).toBeGreaterThan(0);
  });

  it("drops smuggled card data (CVV) from the emitted audit event", () => {
    const { result, audit } = runGate(envelopeOf("smuggled-card"));
    expect(result.valid).toBe(false);
    expect(audit).not.toBeNull();
    // the raw CVV value must never reach the audit log
    expect(JSON.stringify(audit)).not.toContain("123");
  });

  it("emits a redacted audit event with measured latency for every decision", () => {
    const trace = runGate(envelopeOf("over-limit"));
    expect(trace.audit).not.toBeNull();
    expect(trace.audit?.decidedComponent).toBe("SecureWireDialog");
    expect(trace.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

describe("emulator gate seam — secondary approval", () => {
  it("passes the $60k wire once a second manager approves the exact terms", () => {
    const { result } = runGate(envelopeOf("approved-sixty"));
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
  });

  it("rejects a self-approved wire (four-eyes)", () => {
    const { result } = runGate(envelopeOf("self-approval"));
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });

  it("rejects approve-$5k-execute-$60k (payload-binding mismatch)", () => {
    const { result } = runGate(envelopeOf("approve-five-execute-sixty"));
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "APPROVAL_PAYLOAD_MISMATCH")).toBe(true);
  });
});

describe("emulator gate seam — ungoverned reads + unknown intents", () => {
  it("validates a transaction-list read and mounts TransactionList", () => {
    const { result, mount } = runGate(envelopeOf("list-transactions"));
    expect(result.valid).toBe(true);
    expect(mount).toBe("TransactionList");
  });

  it("audits a read with the mounted component recorded", () => {
    const { audit } = runGate(envelopeOf("list-transactions"));
    expect(audit).not.toBeNull();
    expect(audit?.decidedComponent).toBe("TransactionList");
  });

  it("validates a balance read and mounts BalanceCard", () => {
    const { result, mount } = runGate(envelopeOf("account-balance"));
    expect(result.valid).toBe(true);
    expect(mount).toBe("BalanceCard");
  });

  it("rejects a read with a smuggled row action and mounts nothing", () => {
    const { result, mount } = runGate(envelopeOf("transactions-fabricated-row"));
    expect(result.valid).toBe(false);
    expect(mount).toBeNull();
  });

  it("default-denies an unknown intent and still audits it", () => {
    const { result, mount, audit } = runGate(envelopeOf("unknown-intent"));
    expect(result.valid).toBe(false);
    expect(mount).toBeNull();
    expect(audit).not.toBeNull();
  });
});

describe("emulator gate seam — the expanded read catalog", () => {
  it.each([
    ["spending-breakdown", "SpendingBreakdown"],
    ["budget-progress", "BudgetProgress"],
    ["list-cards", "CardList"],
    ["rewards-summary", "RewardsSummary"],
    ["list-payees", "PayeeList"],
    ["upcoming-payments", "UpcomingPayments"],
    ["portfolio-holdings", "PortfolioHoldings"],
    ["watchlist", "Watchlist"],
  ])("%s validates, mounts %s, and audits it", (scenarioId, component) => {
    const { result, mount, audit } = runGate(envelopeOf(scenarioId));
    expect(result.valid).toBe(true);
    expect(mount).toBe(component);
    expect(audit?.decidedComponent).toBe(component);
  });

  it.each([
    "spending-fabricated",
    "budget-zero-limit",
    "cards-unmasked",
    "rewards-fractional",
    "payees-unmasked",
    "upcoming-bad-status",
    "portfolio-noninteger",
    "watchlist-flood",
  ])("rejects the adversarial read %s and mounts nothing", (scenarioId) => {
    const { result, mount } = runGate(envelopeOf(scenarioId));
    expect(result.valid).toBe(false);
    expect(mount).toBeNull();
  });
});

describe("emulator gate seam — full read catalog (Phase 6.5)", () => {
  it.each([
    ["transaction-detail", "TransactionDetail"],
    ["account-list", "AccountList"],
    ["statement-list", "StatementList"],
    ["cashflow-summary", "CashflowSummary"],
    ["balance-trend", "BalanceTrend"],
    ["activity-feed", "ActivityFeed"],
    ["insight-card", "InsightCard"],
    ["recurring-list", "RecurringList"],
    ["invoice-list", "InvoiceList"],
    ["asset-detail", "AssetDetail"],
    ["order-history", "OrderHistory"],
    ["fx-quote", "FxQuote"],
    ["crypto-holdings", "CryptoHoldings"],
    ["savings-goal", "SavingsGoal"],
    ["net-worth", "NetWorth"],
    ["alerts-feed", "AlertsFeed"],
    ["search-results", "SearchResults"],
    ["clarify-choice", "ClarifyChoice"],
  ])("%s validates, mounts %s, and audits it", (scenarioId, component) => {
    const { result, mount, audit } = runGate(envelopeOf(scenarioId));
    expect(result.valid).toBe(true);
    expect(mount).toBe(component);
    expect(audit?.decidedComponent).toBe(component);
  });

  it.each([
    "transaction-detail-reject",
    "account-list-reject",
    "statement-list-reject",
    "cashflow-summary-reject",
    "balance-trend-reject",
    "activity-feed-reject",
    "insight-card-reject",
    "recurring-list-reject",
    "invoice-list-reject",
    "asset-detail-reject",
    "order-history-reject",
    "fx-quote-reject",
    "crypto-holdings-reject",
    "savings-goal-reject",
    "net-worth-reject",
    "alerts-feed-reject",
    "search-results-reject",
    "clarify-choice-reject",
  ])("rejects the adversarial read %s and mounts nothing", (scenarioId) => {
    const { result, mount } = runGate(envelopeOf(scenarioId));
    expect(result.valid).toBe(false);
    expect(mount).toBeNull();
  });
});

describe("emulator gate seam — full governed family (Phase 6.5)", () => {
  it.each([
    ["p2p-payment", "GovernedActionDialog"],
    ["bill-pay", "GovernedActionDialog"],
    ["recurring-setup", "GovernedActionDialog"],
    ["fx-convert", "GovernedActionDialog"],
    ["crypto-withdraw", "GovernedActionDialog"],
    ["withdraw", "GovernedActionDialog"],
    ["issue-card", "GovernedActionDialog"],
    ["card-control", "GovernedActionDialog"],
    ["change-limit", "GovernedActionDialog"],
    ["security-change", "GovernedActionDialog"],
    ["add-user", "GovernedActionDialog"],
    ["kyc", "GovernedActionDialog"],
    ["add-payee", "GovernedActionDialog"],
    ["link-account", "GovernedActionDialog"],
    ["dispute", "GovernedActionDialog"],
    ["close-account", "GovernedActionDialog"],
    ["place-trade", "GovernedActionDialog"],
    ["enable-margin", "MandatoryDisclosure"],
    ["credit-request", "MandatoryDisclosure"],
    ["ach-over-limit", "GovernedActionDialog"],
    ["disclosure-required", "MandatoryDisclosure"],
  ])("%s escalates and forces %s (un-bypassable)", (scenarioId, component) => {
    const { result, mount } = runGate(envelopeOf(scenarioId));
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe(component);
    expect(mount).toBe(component);
  });

  it.each([
    "p2p-payment-reject",
    "bill-pay-reject",
    "recurring-setup-reject",
    "fx-convert-reject",
    "crypto-withdraw-reject",
    "withdraw-reject",
    "issue-card-reject",
    "card-control-reject",
    "change-limit-reject",
    "security-change-reject",
    "add-user-reject",
    "kyc-reject",
    "add-payee-reject",
    "link-account-reject",
    "dispute-reject",
    "close-account-reject",
    "place-trade-reject",
    "enable-margin-reject",
    "credit-request-reject",
  ])("rejects the adversarial governed intent %s and mounts nothing", (scenarioId) => {
    const { result, mount } = runGate(envelopeOf(scenarioId));
    expect(result.valid).toBe(false);
    expect(mount).toBeNull();
  });

  it("passes an authorized ACH transfer bound to the exact terms", () => {
    const { result } = runGate(envelopeOf("ach-authorized"));
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
  });
});

describe("emulator gate seam — composed experience", () => {
  it("gates each intent of the dashboard independently and mounts all three", () => {
    const scenario = getScenario("dashboard");
    const envelopes = scenario?.envelopes ?? [];
    const traces = runExperience(envelopes);
    expect(traces).toHaveLength(3);
    expect(traces.every((trace) => trace.result.valid)).toBe(true);
    expect(traces.map((trace) => trace.mount)).toEqual([
      "BalanceCard",
      "TransactionList",
      "SpendingBreakdown",
    ]);
    // Each intent emits its own audit event.
    expect(traces.every((trace) => trace.audit !== null)).toBe(true);
  });
});
