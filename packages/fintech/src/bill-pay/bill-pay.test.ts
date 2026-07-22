import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateBillPay } from "./bill-pay.schema.js";
import { ACTION_INITIATOR_ID } from "../formats/step-up.js";
import { escalate, authorized, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("bill-pay constitution", () => {
  it("passes an authorized bill payment and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateBillPay(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an over-threshold payment to the GovernedActionDialog", () => {
    const result = evaluateBillPay(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "BILLPAY_LIMIT_EXCEEDED")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateBillPay(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });

  it("rejects a self-approval (four-eyes)", () => {
    const selfApproved = {
      ...(authorized as object),
      stepUp: { ...authorized.stepUp, approverId: ACTION_INITIATOR_ID },
    };
    const result = evaluateBillPay(selfApproved);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });
});
