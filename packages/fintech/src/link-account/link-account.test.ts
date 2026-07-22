import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateLinkAccount } from "./link-account.schema.js";
import { escalate, authorized, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("link-account constitution", () => {
  it("passes a second-factor-cleared account link and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateLinkAccount(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates a bare account link to the GovernedActionDialog", () => {
    const result = evaluateLinkAccount(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "LINK_ACCOUNT_STEP_UP")).toBe(true);
  });

  it("rejects smuggled raw credentials via .strict()", () => {
    const result = evaluateLinkAccount(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
