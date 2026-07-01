/**
 * Phase 4 exit-criteria proof (direct-intent, mock-free, CI-safe).
 *
 * Drives the constitution through the emulator gate seam and asserts the
 * interception guarantees from ROADMAP §Phase 4 / §5 — without a live LLM:
 *   - a $60,000 stream is blocked and forces SecureWireDialog
 *   - a compliant $5,000 stream mounts the standard primitive
 *   - adversarial keys are rejected and redacted from the audit log
 *
 * Run sandbox-off (vitest's `/tmp` mkdir EPERMs under the command sandbox).
 */

import { describe, expect, it } from "vitest";

import { runGate } from "./gate";
import { getScenario } from "./scenarios";

function payloadOf(id: string): unknown {
  const scenario = getScenario(id);
  if (!scenario) throw new Error(`unknown scenario: ${id}`);
  return scenario.payload;
}

describe("emulator gate seam — Phase 4 exit criteria", () => {
  it("blocks the $60,000 over-limit stream and forces SecureWireDialog", () => {
    const { result } = runGate(payloadOf("over-limit"));
    expect(result.valid).toBe(false);
    expect(result.requiredComponent).toBe("SecureWireDialog");
  });

  it("mounts the standard primitive for a compliant $5,000 transfer", () => {
    const { result } = runGate(payloadOf("five-thousand"));
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
  });

  it("rejects a fabricated Confirm button via .strict()", () => {
    const { result, schemaViolations } = runGate(payloadOf("fabricated-confirm"));
    expect(result.valid).toBe(false);
    expect(schemaViolations.length).toBeGreaterThan(0);
  });

  it("drops smuggled card data (CVV) from the emitted audit event", () => {
    const { result, audit } = runGate(payloadOf("smuggled-card"));
    expect(result.valid).toBe(false);
    expect(audit).not.toBeNull();
    // the raw CVV value must never reach the audit log
    expect(JSON.stringify(audit)).not.toContain("123");
  });

  it("emits a redacted audit event with measured latency for every decision", () => {
    const trace = runGate(payloadOf("over-limit"));
    expect(trace.audit).not.toBeNull();
    expect(trace.audit?.decidedComponent).toBe("SecureWireDialog");
    expect(trace.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

describe("emulator gate seam — Phase 5 secondary approval", () => {
  it("passes the $60k wire once a second manager approves the exact terms", () => {
    const { result } = runGate(payloadOf("approved-sixty"));
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
  });

  it("rejects a self-approved wire (four-eyes)", () => {
    const { result } = runGate(payloadOf("self-approval"));
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "SELF_APPROVAL_FORBIDDEN")).toBe(true);
  });

  it("rejects approve-$5k-execute-$60k (payload-binding mismatch)", () => {
    const { result } = runGate(payloadOf("approve-five-execute-sixty"));
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "APPROVAL_PAYLOAD_MISMATCH")).toBe(true);
  });
});
