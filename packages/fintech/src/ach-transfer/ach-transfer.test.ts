import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateAchTransfer } from "./ach-transfer.schema.js";
import { usd } from "../formats/currency.js";
import { ACTION_INITIATOR_ID, actionHash } from "../formats/step-up.js";
import {
  validSmall,
  overLimit,
  validAuthorized,
  sameDayOverNachaLimit,
  fabricatedConfirm,
} from "./fixtures.js";

afterEach(resetAuditSink);

describe("ach-transfer constitution", () => {
  it("passes a small compliant transfer and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateAchTransfer(validSmall);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an over-threshold transfer to the GovernedActionDialog", () => {
    const result = evaluateAchTransfer(overLimit);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "ACH_LIMIT_EXCEEDED")).toBe(true);
  });

  it("accepts a valid cross-party authorization bound to the exact terms", () => {
    const result = evaluateAchTransfer(validAuthorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
  });

  it("rejects a self-approval (four-eyes)", () => {
    const selfApproved = {
      ...(validAuthorized as object),
      stepUp: { ...validAuthorized.stepUp, approverId: ACTION_INITIATOR_ID },
    };
    const result = evaluateAchTransfer(selfApproved);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });

  it("rejects an authorization bound to different terms (payload mismatch)", () => {
    // Still above the authorization threshold (so step-up is required) but a
    // different amount than the one the approval's hash was bound to → mismatch.
    const mismatched = { ...(validAuthorized as object), amount: 7_000_000 };
    const result = evaluateAchTransfer(mismatched);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "APPROVAL_PAYLOAD_MISMATCH")).toBe(true);
  });

  it("hard-rejects a same-day entry above the Nacha per-payment limit", () => {
    const result = evaluateAchTransfer(sameDayOverNachaLimit);
    expect(result.valid).toBe(false);
    const violation = result.violations.find((v) => v.code === "ACH_SAMEDAY_LIMIT_EXCEEDED");
    expect(violation?.severity).toBe("reject");
    expect(violation?.standard).toContain("Nacha Operating Rules");
  });

  it("cannot approve its way past the Nacha limit (reject outranks authorization)", () => {
    // The entry is also over the $25k authorization band, so it escalates too — but a
    // `reject` keeps `valid` false no matter what approval a re-submission carries.
    const counterparty = {
      name: "Beta LLC",
      routingNumber: "021000021",
      accountNumber: "1234567890",
    };
    const terms = { amount: usd(1_500_000), currency: "USD" as const, counterparty, sameDay: true };
    const result = evaluateAchTransfer({
      ...terms,
      stepUp: {
        approverId: "mgr:dana",
        approverName: "Dana Approver",
        secondFactor: "246810",
        payloadHash: actionHash(terms),
      },
    });
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.severity === "reject")).toBe(true);
  });

  it("leaves a same-day entry below the Nacha limit alone", () => {
    const result = evaluateAchTransfer({ ...validSmall, sameDay: true });
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateAchTransfer(fabricatedConfirm);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
