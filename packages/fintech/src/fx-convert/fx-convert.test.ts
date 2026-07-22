import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateFxConvert } from "./fx-convert.schema.js";
import { ACTION_INITIATOR_ID } from "../formats/step-up.js";
import { escalate, authorized, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("fx-convert constitution", () => {
  it("accepts a valid cross-party authorization and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateFxConvert(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an over-threshold conversion to the GovernedActionDialog", () => {
    const result = evaluateFxConvert(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "FX_LIMIT_EXCEEDED")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateFxConvert(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });

  it("rejects a self-approval (four-eyes)", () => {
    const selfApproved = {
      ...(authorized as object),
      stepUp: { ...authorized.stepUp, approverId: ACTION_INITIATOR_ID },
    };
    const result = evaluateFxConvert(selfApproved);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });
});
