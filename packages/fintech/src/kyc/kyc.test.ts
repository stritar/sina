import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateKyc } from "./kyc.schema.js";
import { escalate, authorized, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("kyc constitution", () => {
  it("passes a second-factor-authorized verification and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateKyc(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-verified request to the GovernedActionDialog", () => {
    const result = evaluateKyc(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "KYC_STEP_UP")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateKyc(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
