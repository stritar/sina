import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateAchTransfer } from "./ach-transfer.schema.js";
import { ACTION_INITIATOR_ID } from "../formats/step-up.js";
import { validSmall, overLimit, validAuthorized, fabricatedConfirm } from "./fixtures.js";

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

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateAchTransfer(fabricatedConfirm);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
