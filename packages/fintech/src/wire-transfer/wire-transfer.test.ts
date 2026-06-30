import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuditSink, setAuditSink } from "@sina-design-system/governance";

import { evaluateWireTransfer } from "./wire-transfer.schema.js";
import * as fx from "./fixtures.js";

afterEach(() => {
  resetAuditSink();
});

describe("evaluateWireTransfer — compliant", () => {
  it("passes a small, fully-formed transfer cleanly", () => {
    expect(evaluateWireTransfer(fx.validSmallTransfer)).toEqual({
      valid: true,
      violations: [],
      requiredComponent: null,
    });
  });

  it("passes the $5,000 transfer with a SAR flag (flags do not block)", () => {
    const result = evaluateWireTransfer(fx.validFiveThousand);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(result.violations.map((v) => v.code)).toContain("SAR_REVIEW");
    expect(result.violations.every((v) => v.severity === "flag")).toBe(true);
  });

  it("does not apply USD bands to a non-USD transfer (FX deferral is intentional)", () => {
    expect(evaluateWireTransfer(fx.validNonUsdLarge)).toEqual({
      valid: true,
      violations: [],
      requiredComponent: null,
    });
  });
});

describe("evaluateWireTransfer — adversarial", () => {
  it("forces SecureWireDialog above the $50k approval limit", () => {
    const result = evaluateWireTransfer(fx.overLimitTransfer);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("SecureWireDialog");
    expect(
      result.violations.some((v) => v.code === "AMOUNT_REQUIRES_APPROVAL" && Boolean(v.standard)),
    ).toBe(true);
  });

  it("forces SecureWireDialog when Travel Rule info is missing", () => {
    const result = evaluateWireTransfer(fx.travelRuleMissingInfo);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("SecureWireDialog");
    expect(result.violations.some((v) => v.code === "TRAVEL_RULE_INFO_MISSING")).toBe(true);
  });

  it("rejects a malformed IBAN with no governed component", () => {
    const result = evaluateWireTransfer(fx.malformedIban);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBeNull();
  });

  it("rejects a non-integer amount", () => {
    expect(evaluateWireTransfer(fx.nonIntegerAmount).valid).toBe(false);
  });

  it("rejects a fabricated Confirm button", () => {
    expect(evaluateWireTransfer(fx.fabricatedConfirmButton).valid).toBe(false);
  });

  it("rejects smuggled card data and keeps it out of the audit log", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const result = evaluateWireTransfer(fx.smuggledCardData);
    expect(result.valid).toBe(false);
    const logged = sink.mock.calls[0]?.[0].payload as Record<string, unknown>;
    expect(logged.cvv).toBeUndefined();
  });

  it("rejects an unsupported currency", () => {
    expect(evaluateWireTransfer(fx.unsupportedCurrency).valid).toBe(false);
  });
});

describe("evaluateWireTransfer — audit", () => {
  it("emits an event stamped with version + decided component", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    evaluateWireTransfer(fx.overLimitTransfer);
    const event = sink.mock.calls[0]?.[0];
    expect(event.version).toBe("1.0.0");
    expect(event.decidedComponent).toBe("SecureWireDialog");
    expect(typeof event.timestamp).toBe("string");
  });
});
