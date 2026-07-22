import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateDisclosure } from "./disclosure.schema.js";
import { validAcknowledged, notAcknowledged, fabricatedKey } from "./fixtures.js";

afterEach(resetAuditSink);

describe("disclosure constitution", () => {
  it("passes an acknowledged disclosure and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateDisclosure(validAcknowledged);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-acknowledged disclosure to MandatoryDisclosure", () => {
    const result = evaluateDisclosure(notAcknowledged);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("MandatoryDisclosure");
    expect(result.violations.some((v) => v.code === "DISCLOSURE_NOT_ACKNOWLEDGED")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluateDisclosure(fabricatedKey);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
