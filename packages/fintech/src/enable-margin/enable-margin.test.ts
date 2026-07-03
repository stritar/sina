import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateEnableMargin } from "./enable-margin.schema.js";
import { escalate, authorized, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("enable-margin constitution", () => {
  it("passes an acknowledged margin disclosure and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateEnableMargin(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-acknowledged margin disclosure to MandatoryDisclosure", () => {
    const result = evaluateEnableMargin(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("MandatoryDisclosure");
    expect(result.violations.some((v) => v.code === "MARGIN_DISCLOSURE")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateEnableMargin(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
