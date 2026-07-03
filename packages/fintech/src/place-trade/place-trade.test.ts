import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluatePlaceTrade } from "./place-trade.schema.js";
import { authorized, escalate, reject } from "./fixtures.js";

afterEach(resetAuditSink);

describe("place-trade constitution", () => {
  it("passes an authorized trade and emits an audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluatePlaceTrade(authorized);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(sink).toHaveBeenCalledOnce();
  });

  it("escalates an un-authorized trade to the GovernedActionDialog", () => {
    const result = evaluatePlaceTrade(escalate);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("GovernedActionDialog");
    expect(result.violations.some((v) => v.code === "TRADE_STEP_UP")).toBe(true);
  });

  it("rejects a fabricated key via .strict()", () => {
    const result = evaluatePlaceTrade(reject);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SCHEMA_INVALID")).toBe(true);
  });
});
