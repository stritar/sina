import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateCloseAccount } from "./close-account.schema.js";
import { ACTION_INITIATOR_ID } from "../formats/step-up.js";
import { authorized, escalate, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("close-account constitution", () => {
  it("passes a cross-party-authorized closure and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateCloseAccount(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-authorized closure to the GovernedActionDialog", () => {
    const result = evaluateCloseAccount(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "CLOSE_ACCOUNT_STEP_UP")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateCloseAccount(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });

  it("rejects a self-approval (four-eyes)", () => {
    const selfApproved = {
      ...(authorized as object),
      stepUp: { ...authorized.stepUp, approverId: ACTION_INITIATOR_ID },
    };
    const result = evaluateCloseAccount(selfApproved);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });
});
