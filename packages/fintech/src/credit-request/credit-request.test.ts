import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateCreditRequest } from "./credit-request.schema.js";
import { escalate, authorized, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("credit-request constitution", () => {
  it("passes an acknowledged credit request and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateCreditRequest(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-acknowledged credit request to MandatoryDisclosure", () => {
    const result = evaluateCreditRequest(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("MandatoryDisclosure");
    expect(result.violations.some((v) => v.code === "CREDIT_DISCLOSURE")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateCreditRequest(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
