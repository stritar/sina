import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateAddUser } from "./add-user.schema.js";
import { authorized, escalate, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("add-user constitution", () => {
  it("passes a second-factor-cleared add-user and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateAddUser(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-authorized add-user to the GovernedActionDialog", () => {
    const result = evaluateAddUser(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "ADD_USER_STEP_UP")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateAddUser(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
