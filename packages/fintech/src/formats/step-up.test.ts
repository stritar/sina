import { describe, expect, it } from "vitest";

import {
  ACTION_INITIATOR_ID,
  actionHash,
  stepUpViolations,
  type ActionContext,
  type StepUpRequirement,
} from "./step-up.js";

const ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID };

const secondFactorReq: StepUpRequirement = {
  mode: "second-factor",
  code: "STEP_UP_REQUIRED",
  message: "destructive action requires a second-factor re-authentication",
  standard: "SINA policy — step-up",
};

const acknowledgeReq: StepUpRequirement = {
  ...secondFactorReq,
  mode: "acknowledge",
};
const approvalReq: StepUpRequirement = { ...secondFactorReq, mode: "approval" };

/** Bare action terms (no step-up); `actionHash` binds over exactly these. */
const terms = {
  action: "cancel",
  card: { label: "Personal Debit", maskedNumber: "****1234" },
};
const boundHash = actionHash(terms);

const has = (vs: ReturnType<typeof stepUpViolations>, code: string) =>
  vs.some((v) => v.code === code);

describe("stepUpViolations — enforcement is verify-what's-present in every mode", () => {
  it("escalates when no step-up is supplied", () => {
    const vs = stepUpViolations(terms, ctx, secondFactorReq);
    expect(vs).toEqual([
      {
        code: secondFactorReq.code,
        message: secondFactorReq.message,
        standard: secondFactorReq.standard,
        severity: "escalate",
      },
    ]);
  });

  describe("second-factor mode", () => {
    it("passes a bare second factor (lightweight self re-authentication)", () => {
      const vs = stepUpViolations(
        { ...terms, stepUp: { secondFactor: "123456" } },
        ctx,
        secondFactorReq,
      );
      expect(vs).toEqual([]);
    });

    it("rejects self-approval when the authorizer id is the initiator", () => {
      const vs = stepUpViolations(
        {
          ...terms,
          stepUp: { secondFactor: "123456", approverId: ACTION_INITIATOR_ID },
        },
        ctx,
        secondFactorReq,
      );
      expect(has(vs, "SELF_APPROVAL_FORBIDDEN")).toBe(true);
      expect(vs.every((v) => v.severity === "reject")).toBe(true);
    });

    it("rejects a payload hash that does not bind to the terms", () => {
      const vs = stepUpViolations(
        {
          ...terms,
          stepUp: { secondFactor: "123456", payloadHash: "fp_deadbeef" },
        },
        ctx,
        secondFactorReq,
      );
      expect(has(vs, "APPROVAL_PAYLOAD_MISMATCH")).toBe(true);
    });

    it("passes a distinct authorizer bound to the exact terms", () => {
      const vs = stepUpViolations(
        {
          ...terms,
          stepUp: {
            secondFactor: "123456",
            approverId: "mgr:dana",
            payloadHash: boundHash,
          },
        },
        ctx,
        secondFactorReq,
      );
      expect(vs).toEqual([]);
    });

    it("stacks both rejects when the payload is self-approved AND unbound", () => {
      const vs = stepUpViolations(
        {
          ...terms,
          stepUp: {
            secondFactor: "123456",
            approverId: ACTION_INITIATOR_ID,
            payloadHash: "fp_wrong",
          },
        },
        ctx,
        secondFactorReq,
      );
      expect(has(vs, "SELF_APPROVAL_FORBIDDEN")).toBe(true);
      expect(has(vs, "APPROVAL_PAYLOAD_MISMATCH")).toBe(true);
    });
  });

  describe("acknowledge mode", () => {
    it("passes a plain acknowledgement", () => {
      const vs = stepUpViolations(
        { ...terms, stepUp: { acknowledged: true } },
        ctx,
        acknowledgeReq,
      );
      expect(vs).toEqual([]);
    });

    it("does not false-reject when the host attaches a matching binding hash", () => {
      const vs = stepUpViolations(
        { ...terms, stepUp: { acknowledged: true, payloadHash: boundHash } },
        ctx,
        acknowledgeReq,
      );
      expect(vs).toEqual([]);
    });
  });

  describe("approval mode (four-eyes) still holds", () => {
    const fullApproval = {
      approverId: "mgr:dana",
      approverName: "Dana Approver",
      secondFactor: "123456",
      payloadHash: boundHash,
    };

    it("passes a bound approval by a distinct party", () => {
      const vs = stepUpViolations(
        { ...terms, stepUp: fullApproval },
        ctx,
        approvalReq,
      );
      expect(vs).toEqual([]);
    });

    it("rejects self-approval", () => {
      const vs = stepUpViolations(
        {
          ...terms,
          stepUp: { ...fullApproval, approverId: ACTION_INITIATOR_ID },
        },
        ctx,
        approvalReq,
      );
      expect(has(vs, "SELF_APPROVAL_FORBIDDEN")).toBe(true);
    });

    it("escalates an approval missing its binding hash (providesMode not satisfied)", () => {
      const { payloadHash: _omit, ...withoutHash } = fullApproval;
      const vs = stepUpViolations(
        { ...terms, stepUp: withoutHash },
        ctx,
        approvalReq,
      );
      expect(vs).toEqual([
        {
          code: approvalReq.code,
          message: approvalReq.message,
          standard: approvalReq.standard,
          severity: "escalate",
        },
      ]);
    });
  });
});
