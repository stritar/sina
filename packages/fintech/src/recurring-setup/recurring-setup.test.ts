import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateRecurringSetup } from "./recurring-setup.schema.js";
import { ACTION_INITIATOR_ID } from "../formats/step-up.js";
import { authorized, escalate, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("recurring-setup constitution", () => {
  it("passes an authorized standing order and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateRecurringSetup(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an over-cap setup to the GovernedActionDialog", () => {
    const result = evaluateRecurringSetup(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "RECURRING_CAP_EXCEEDED")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateRecurringSetup(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });

  it("rejects a self-approval (four-eyes)", () => {
    const selfApproved = {
      ...(authorized as object),
      stepUp: { ...authorized.stepUp, approverId: ACTION_INITIATOR_ID },
    };
    const result = evaluateRecurringSetup(selfApproved);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });
});
