import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateDispute } from "./dispute.schema.js";
import { authorized, escalate, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("dispute constitution", () => {
  it("passes a second-factor-cleared dispute and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateDispute(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates a bare dispute to the GovernedActionDialog", () => {
    const result = evaluateDispute(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "DISPUTE_STEP_UP")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateDispute(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
