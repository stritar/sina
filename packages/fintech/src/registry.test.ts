import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateFintechIntent, fintechIntentManifest, INTENTS } from "./registry.js";
import { evaluateWireTransfer } from "./wire-transfer/wire-transfer.schema.js";
import * as txnFx from "./transaction-list/fixtures.js";
import * as balFx from "./account-balance/fixtures.js";
import * as wireFx from "./wire-transfer/fixtures.js";

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

describe("fintechIntentManifest", () => {
  it("lists every registered intent with its kind + component", () => {
    const manifest = fintechIntentManifest();
    const intents = manifest.map((entry) => entry.intent);
    expect(intents).toContain(INTENTS.LIST_TRANSACTIONS);
    expect(intents).toContain(INTENTS.WIRE_TRANSFER);
    expect(manifest.find((entry) => entry.intent === INTENTS.WIRE_TRANSFER)?.kind).toBe("governed");
    expect(manifest.find((entry) => entry.intent === INTENTS.LIST_TRANSACTIONS)?.kind).toBe("display");
  });
});
