import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateSecurityChange } from "./security-change.schema.js";
import { authorized, escalate, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("security-change constitution", () => {
  it("passes an authorized security change and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateSecurityChange(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-authorized security change to the GovernedActionDialog", () => {
    const result = evaluateSecurityChange(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "SECURITY_STEP_UP")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateSecurityChange(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
