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

  it("passes a SEPA transfer without a BIC (IBAN-only rule — no synthesized BICs)", () => {
    expect(evaluateWireTransfer(fx.validIbanOnly)).toEqual({
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

  it("flags — never silently passes — a non-USD transfer (USD bands not evaluated)", () => {
    // The €60,000 wire from the integration review: format-valid, non-USD, over
    // every USD band. It must stay valid (flag does not block) but the pass must
    // be loud — exactly one POLICY_BANDS_NOT_EVALUATED flag with a citation.
    const result = evaluateWireTransfer(fx.validNonUsdLarge);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toMatchObject({
      code: "POLICY_BANDS_NOT_EVALUATED",
      severity: "flag",
      standard: "SINA policy — USD-only bands",
    });
    expect(result.violations[0]!.message).toContain("EUR");
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

describe("evaluateWireTransfer — secondary approval (Phase 5)", () => {
  it("escalates a $60k wire that carries no approval (unchanged)", () => {
    const result = evaluateWireTransfer(fx.overLimitTransfer);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("SecureWireDialog");
  });

  it("passes a $60k wire approved by a different manager, bound to the exact terms", () => {
    const result = evaluateWireTransfer(fx.validApprovedSixtyThousand);
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    // Only flags may remain (SAR/CTR); nothing blocking.
    expect(result.violations.every((v) => v.severity === "flag")).toBe(true);
  });

  it("rejects self-approval (four-eyes / separation of duties)", () => {
    const result = evaluateWireTransfer(fx.selfApprovedSixtyThousand);
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBeNull();
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });

  it("rejects a fabricated approval whose hash binds nothing", () => {
    const result = evaluateWireTransfer(fx.fabricatedApprovalFlag);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "APPROVAL_PAYLOAD_MISMATCH")).toBe(true);
  });

  it("rejects approve-$5k-execute-$60k (payload-binding mismatch)", () => {
    const result = evaluateWireTransfer(fx.approveFiveExecuteSixty);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "APPROVAL_PAYLOAD_MISMATCH")).toBe(true);
  });

  it("rejects a key smuggled inside the approval envelope (.strict())", () => {
    expect(evaluateWireTransfer(fx.smuggledInsideApproval).valid).toBe(false);
  });

  it("treats the initiator as server-supplied context, not a payload field", () => {
    // The self-approval payload is only self-approval relative to the default
    // agent initiator. A different server-known initiator makes it valid — proof
    // the check can't be satisfied from the stream.
    expect(evaluateWireTransfer(fx.selfApprovedSixtyThousand).valid).toBe(false);
    expect(
      evaluateWireTransfer(fx.selfApprovedSixtyThousand, { initiatorId: "mgr:someone-else" }).valid,
    ).toBe(true);
  });

  it("keeps the approver's second factor + raw id out of the audit log", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    evaluateWireTransfer(fx.validApprovedSixtyThousand);
    const logged = sink.mock.calls[0]?.[0].payload as { approval?: Record<string, unknown> };
    expect(logged.approval?.secondFactor).toBeUndefined(); // dropped
    expect(logged.approval?.approverId).not.toBe("mgr:dana"); // hashed, not raw
  });
});

describe("evaluateWireTransfer — audit", () => {
  it("emits an event stamped with version + decided component", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    evaluateWireTransfer(fx.overLimitTransfer);
    const event = sink.mock.calls[0]?.[0];
    expect(event.version).toBe("1.2.0");
    expect(event.decidedComponent).toBe("SecureWireDialog");
    expect(typeof event.timestamp).toBe("string");
  });
});
