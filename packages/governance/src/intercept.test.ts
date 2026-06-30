import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { intercept } from "./intercept.js";
import { redact, resetAuditSink, setAuditSink } from "./audit.js";
import { SCHEMA_INVALID, type Violation } from "./contract.js";

const schema = z.object({ amount: z.number() }).strict();

afterEach(() => {
  resetAuditSink();
});

describe("intercept — the governance seam", () => {
  it("passes a structurally valid payload with no policy violations", () => {
    const result = intercept({ schema }, { amount: 100 });
    expect(result).toEqual({ valid: true, violations: [], requiredComponent: null });
  });

  it("rejects a parse failure as a SCHEMA_INVALID violation (valid:false, no component)", () => {
    const result = intercept({ schema }, { amount: "not-a-number" });
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBeNull();
    expect(result.violations[0]?.code).toBe(SCHEMA_INVALID);
    expect(result.violations[0]?.severity).toBe("reject");
  });

  it("rejects smuggled unknown keys via .strict()", () => {
    const result = intercept({ schema }, { amount: 100, confirmButton: true });
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === SCHEMA_INVALID)).toBe(true);
  });

  it("escalates a policy violation to the mapped governed component", () => {
    const policy = (): Violation[] => [
      { code: "OVER_LIMIT", message: "too big", severity: "escalate" },
    ];
    const result = intercept(
      { schema, policy, escalations: { OVER_LIMIT: "SecureWireDialog" } },
      { amount: 100 },
    );
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("SecureWireDialog");
  });

  it("treats flag-only violations as valid (recorded, not blocking)", () => {
    const policy = (): Violation[] => [
      { code: "CTR_REPORTABLE", message: "over 10k", severity: "flag" },
    ];
    const result = intercept({ schema, policy }, { amount: 100 });
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    expect(result.violations).toHaveLength(1);
  });

  it("emits an audit event for every decision", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    intercept({ schema, version: "1.2.3" }, { amount: 100 });
    expect(sink).toHaveBeenCalledTimes(1);
    const event = sink.mock.calls[0]?.[0];
    expect(event.version).toBe("1.2.3");
    expect(typeof event.timestamp).toBe("string");
    expect(event.decidedComponent).toBeNull();
  });

  it("redacts sensitive fields from the audited payload", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    intercept(
      {
        schema: z.object({ amount: z.number() }).passthrough(),
        redaction: { drop: ["cvv"], mask: ["pan"], hash: ["iban"] },
      },
      { amount: 100, cvv: "123", pan: "4242424242424242", iban: "DE89370400440532013000" },
    );
    const logged = sink.mock.calls[0]?.[0].payload as Record<string, unknown>;
    expect(logged.cvv).toBeUndefined();
    expect(logged.pan).toBe("****4242");
    expect(String(logged.iban)).toMatch(/^fp_[0-9a-f]{8}$/);
  });
});

describe("redact", () => {
  it("drops, masks, and fingerprints by field name, recursing into nested objects", () => {
    const out = redact(
      { keep: "ok", cvv: "999", nested: { pin: "0000", account: "12345678" } },
      { drop: ["cvv", "pin"], hash: ["account"] },
    ) as Record<string, unknown>;
    expect(out.keep).toBe("ok");
    expect(out.cvv).toBeUndefined();
    const nested = out.nested as Record<string, unknown>;
    expect(nested.pin).toBeUndefined();
    expect(String(nested.account)).toMatch(/^fp_/);
  });

  it("returns the value untouched when no config is given", () => {
    const input = { a: 1 };
    expect(redact(input)).toBe(input);
  });
});
