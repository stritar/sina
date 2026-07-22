import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { GovernedActionDialog } from "./GovernedActionDialog.js";

// jsdom lacks these; Radix Dialog probes for them defensively.
if (!window.matchMedia) {
  // @ts-expect-error test shim
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
}
if (!("ResizeObserver" in window)) {
  // @ts-expect-error test shim
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(cleanup);

const intent = {
  amount: 900_000,
  currency: "USD",
  rail: "ach",
  counterparty: { name: "Beta LLC" },
};

const violations = [
  {
    code: "ACH_LIMIT_EXCEEDED",
    message: "ACH transfer above the per-transfer limit requires authorization",
    severity: "escalate" as const,
  },
];

async function open() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /review & authorize/i }));
  return user;
}

async function reachAuthorize(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /request authorization/i }));
  await user.type(screen.getByLabelText(/authorizer id/i), "mgr:dana");
  await user.type(screen.getByLabelText(/authorizer name/i), "Dana Approver");
  await user.click(screen.getByRole("button", { name: /continue/i }));
  fireEvent.change(screen.getByLabelText(/digit 1/i), { target: { value: "246810" } });
}

describe("GovernedActionDialog", () => {
  it("has no axe violations in the open review state and shows the derived terms", async () => {
    const onSubmitApproval = vi.fn().mockResolvedValue({ approved: true, violations: [] });
    render(
      <GovernedActionDialog intent={intent} violations={violations} onSubmitApproval={onSubmitApproval} />,
    );
    await open();
    expect(await screen.findByText(/authorization required/i)).toBeTruthy();
    // Generic terms deriver renders the amount + fields.
    expect(screen.getByText("$9,000.00")).toBeTruthy();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("submits the authorizer's evidence and reports approval (server decides), never a hash", async () => {
    const onSubmitApproval = vi.fn().mockResolvedValue({ approved: true, violations: [] });
    const onApproved = vi.fn();
    render(
      <GovernedActionDialog
        intent={intent}
        violations={violations}
        onSubmitApproval={onSubmitApproval}
        onApproved={onApproved}
      />,
    );
    const user = await open();
    await reachAuthorize(user);
    await user.click(screen.getByRole("button", { name: /^authorize$/i }));

    expect(await screen.findByText(/authorized & governed/i)).toBeTruthy();
    expect(onSubmitApproval).toHaveBeenCalledWith({
      approverId: "mgr:dana",
      approverName: "Dana Approver",
      secondFactor: "246810",
    });
    expect(onSubmitApproval.mock.calls[0][0]).not.toHaveProperty("payloadHash");
    expect(onApproved).toHaveBeenCalledOnce();
  });

  it("keeps the action blocked and names the reason when the re-gate denies", async () => {
    const onSubmitApproval = vi.fn().mockResolvedValue({
      approved: false,
      violations: [
        {
          code: "SELF_APPROVAL_FORBIDDEN",
          message: "the initiator cannot approve their own action",
          severity: "reject" as const,
        },
      ],
    });
    render(
      <GovernedActionDialog intent={intent} violations={violations} onSubmitApproval={onSubmitApproval} />,
    );
    const user = await open();
    await reachAuthorize(user);
    await user.click(screen.getByRole("button", { name: /^authorize$/i }));

    expect(await screen.findByText(/authorization rejected/i)).toBeTruthy();
    expect(screen.getByText(/initiator cannot approve their own action/i)).toBeTruthy();
    expect(screen.getByText(/authorization required/i)).toBeTruthy();
  });
});
