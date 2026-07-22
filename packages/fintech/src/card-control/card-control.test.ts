import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { ACTION_INITIATOR_ID } from "../formats/step-up.js";
import { evaluateCardControl } from "./card-control.schema.js";
import { authorized, escalate, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("card-control constitution", () => {
  it("passes a second-factor-cleared destructive action and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateCardControl(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-authorized destructive action to the GovernedActionDialog", () => {
    const result = evaluateCardControl(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(
      result.violations.some((v) => v.code === "CARD_CONTROL_STEP_UP"),
    ).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateCardControl(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(
      true,
    );
  });

  it("rejects a second-factor step-up whose authorizer is the initiator (four-eyes)", () => {
    const result = evaluateCardControl({
      action: "cancel",
      card: { label: "Personal Debit", maskedNumber: "****1234" },
      stepUp: { secondFactor: "246810", approverId: ACTION_INITIATOR_ID },
    });
    expect(result.valid).toBe(false);
    expect(
      result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN"),
    ).toBe(true);
  });
});
