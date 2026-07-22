import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import {
  evaluateFintechIntent,
  fintechIntentManifest,
  INTENT_SCHEMAS,
  INTENTS,
  type FintechIntent,
} from "./registry.js";
import type { IntentPropsMap } from "./intent-props.js";
import { evaluateWireTransfer } from "./wire-transfer/wire-transfer.schema.js";
import * as txnFx from "./transaction-list/fixtures.js";
import * as balFx from "./account-balance/fixtures.js";
import * as wireFx from "./wire-transfer/fixtures.js";
import * as spendingFx from "./spending-breakdown/fixtures.js";
import * as budgetFx from "./budget-progress/fixtures.js";
import * as cardFx from "./card-list/fixtures.js";
import * as rewardsFx from "./rewards-summary/fixtures.js";
import * as payeeFx from "./payee-list/fixtures.js";
import * as upcomingFx from "./upcoming-payments/fixtures.js";
import * as portfolioFx from "./portfolio-holdings/fixtures.js";
import * as watchlistFx from "./watchlist/fixtures.js";

afterEach(() => {
  resetAuditSink();
});

describe("evaluateFintechIntent — ungoverned reads", () => {
  it("passes a valid transaction list and mounts TransactionList", () => {
    const decision = evaluateFintechIntent({
      intent: INTENTS.LIST_TRANSACTIONS,
      props: txnFx.validTwoTransactions,
    });
    expect(decision.result.valid).toBe(true);
    expect(decision.mount).toBe("TransactionList");
  });

  it("emits an audit event for a read, recording the mounted component + masked account", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    evaluateFintechIntent({ intent: INTENTS.LIST_TRANSACTIONS, props: txnFx.validTwoTransactions });
    expect(sink).toHaveBeenCalledTimes(1);
    const event = sink.mock.calls[0]?.[0];
    expect(event.decidedComponent).toBe("TransactionList");
    const payload = event.payload as { account: { maskedNumber: string } };
    expect(payload.account.maskedNumber).toBe("****4021");
  });

  it("renders an empty transaction list as a valid pass", () => {
    const decision = evaluateFintechIntent({
      intent: INTENTS.LIST_TRANSACTIONS,
      props: txnFx.validEmpty,
    });
    expect(decision.result.valid).toBe(true);
    expect(decision.mount).toBe("TransactionList");
  });

  it.each([
    ["a fabricated row action", txnFx.fabricatedRowAction],
    ["a non-integer amount", txnFx.nonIntegerRowAmount],
    ["a flood of rows", txnFx.floodOfRows],
  ])("rejects %s and mounts nothing", (_label, payload) => {
    const decision = evaluateFintechIntent({ intent: INTENTS.LIST_TRANSACTIONS, props: payload });
    expect(decision.result.valid).toBe(false);
    expect(decision.mount).toBeNull();
  });

  it("passes a description carrying markup (shape is valid; rendering safety is the component's job)", () => {
    const decision = evaluateFintechIntent({
      intent: INTENTS.LIST_TRANSACTIONS,
      props: txnFx.injectedHtmlDescription,
    });
    expect(decision.result.valid).toBe(true);
  });

  it("passes a valid balance and mounts BalanceCard", () => {
    const decision = evaluateFintechIntent({
      intent: INTENTS.ACCOUNT_BALANCE,
      props: balFx.validBalance,
    });
    expect(decision.result.valid).toBe(true);
    expect(decision.mount).toBe("BalanceCard");
  });

  it("rejects an unmasked account number in a balance read", () => {
    const decision = evaluateFintechIntent({
      intent: INTENTS.ACCOUNT_BALANCE,
      props: balFx.unmaskedAccount,
    });
    expect(decision.result.valid).toBe(false);
  });
});

describe("evaluateFintechIntent — governed wire preserved through the router", () => {
  it("escalates an over-limit wire to SecureWireDialog", () => {
    const decision = evaluateFintechIntent({
      intent: INTENTS.WIRE_TRANSFER,
      props: wireFx.overLimitTransfer,
    });
    expect(decision.result.requiredComponent).toBe("SecureWireDialog");
    expect(decision.mount).toBe("SecureWireDialog");
  });

  it("produces the same result the direct evaluator does (routing is transparent)", () => {
    const routed = evaluateFintechIntent({
      intent: INTENTS.WIRE_TRANSFER,
      props: wireFx.validApprovedSixtyThousand,
    });
    const direct = evaluateWireTransfer(wireFx.validApprovedSixtyThousand);
    expect(routed.result).toEqual(direct);
  });

  it("still forbids self-approval through the router (initiator context not frozen)", () => {
    const decision = evaluateFintechIntent({
      intent: INTENTS.WIRE_TRANSFER,
      props: wireFx.selfApprovedSixtyThousand,
    });
    expect(decision.result.valid).toBe(false);
    expect(decision.result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });
});

describe("evaluateFintechIntent — unknown intent", () => {
  it("default-denies and mounts nothing", () => {
    const decision = evaluateFintechIntent({ intent: "delete_everything", props: {} });
    expect(decision.result.valid).toBe(false);
    expect(decision.mount).toBeNull();
  });
});

describe("evaluateFintechIntent — the expanded read catalog", () => {
  it.each([
    [INTENTS.SPENDING_BREAKDOWN, "SpendingBreakdown", spendingFx.validBreakdown, spendingFx.fabricatedCategoryKey],
    [INTENTS.BUDGET_PROGRESS, "BudgetProgress", budgetFx.validBudgets, budgetFx.zeroLimit],
    [INTENTS.LIST_CARDS, "CardList", cardFx.validCards, cardFx.unmaskedPan],
    [INTENTS.REWARDS_SUMMARY, "RewardsSummary", rewardsFx.validRewards, rewardsFx.fractionalPoints],
    [INTENTS.LIST_PAYEES, "PayeeList", payeeFx.validPayees, payeeFx.unmaskedPayee],
    [INTENTS.UPCOMING_PAYMENTS, "UpcomingPayments", upcomingFx.validUpcoming, upcomingFx.badStatus],
    [INTENTS.PORTFOLIO_HOLDINGS, "PortfolioHoldings", portfolioFx.validHoldings, portfolioFx.nonIntegerValue],
    [INTENTS.WATCHLIST, "Watchlist", watchlistFx.validWatchlist, watchlistFx.floodItems],
  ])("%s validates + mounts %s, and rejects its adversarial payload", (intent, component, valid, adversarial) => {
    const pass = evaluateFintechIntent({ intent, props: valid });
    expect(pass.result.valid).toBe(true);
    expect(pass.mount).toBe(component);

    const fail = evaluateFintechIntent({ intent, props: adversarial });
    expect(fail.result.valid).toBe(false);
    expect(fail.mount).toBeNull();
  });

  it("accepts a card with no network/expiry (optional fields are never synthesized)", () => {
    const decision = evaluateFintechIntent({
      intent: INTENTS.LIST_CARDS,
      props: cardFx.validSparseCard,
    });
    expect(decision.result.valid).toBe(true);
    expect(decision.mount).toBe("CardList");
  });
});

describe("fintechIntentManifest", () => {
  it("lists every registered intent with its kind + component", () => {
    const manifest = fintechIntentManifest();
    const intents = manifest.map((entry) => entry.intent);
    expect(intents).toContain(INTENTS.LIST_TRANSACTIONS);
    expect(intents).toContain(INTENTS.WIRE_TRANSFER);
    expect(manifest.find((entry) => entry.intent === INTENTS.WIRE_TRANSFER)?.kind).toBe("governed");
    expect(manifest.find((entry) => entry.intent === INTENTS.LIST_TRANSACTIONS)?.kind).toBe("display");
  });

  it("covers exactly the INTENTS verbs — no missing rows, no strays", () => {
    const manifest = fintechIntentManifest();
    const listed = manifest.map((entry) => entry.intent).sort();
    expect(listed).toEqual(Object.values(INTENTS).sort());
  });

  it("attaches a self-contained propsSchema to every entry", () => {
    for (const entry of fintechIntentManifest()) {
      expect(entry.propsSchema, `${entry.intent} has no propsSchema`).toBeTruthy();
      expect(JSON.stringify(entry.propsSchema)).not.toContain('"$ref"');
    }
  });

  it("surfaces the closed-world property: strict schemas emit additionalProperties: false", () => {
    // The whole pitch rests on `.strict()` — a fabricated Confirm button is a
    // reject. The JSON Schema a model sees must carry the same closed world.
    const wire = fintechIntentManifest().find((entry) => entry.intent === INTENTS.WIRE_TRANSFER);
    expect(wire?.propsSchema).toMatchObject({ additionalProperties: false });
  });
});

describe("INTENT_SCHEMAS / IntentPropsMap — the compile-time bind", () => {
  it("keys IntentPropsMap by exactly the FintechIntent verbs", () => {
    expectTypeOf<keyof IntentPropsMap>().toEqualTypeOf<FintechIntent>();
  });

  it("has a schema for every verb (runtime mirror of the satisfies clause)", () => {
    expect(Object.keys(INTENT_SCHEMAS).sort()).toEqual(Object.values(INTENTS).sort());
  });
});
