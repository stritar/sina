import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateChangeLimit } from "./change-limit.schema.js";
import { ACTION_INITIATOR_ID } from "../formats/step-up.js";
import { escalate, authorized, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("change-limit constitution", () => {
  it("passes an authorized limit change bound to the exact terms and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateChangeLimit(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-authorized limit change to the GovernedActionDialog", () => {
    const result = evaluateChangeLimit(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "LIMIT_CHANGE_REQUIRES_APPROVAL")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateChangeLimit(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });

  it("rejects a self-approval (four-eyes)", () => {
    const selfApproved = {
      ...(authorized as object),
      stepUp: { ...authorized.stepUp, approverId: ACTION_INITIATOR_ID },
    };
    const result = evaluateChangeLimit(selfApproved);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });
});
