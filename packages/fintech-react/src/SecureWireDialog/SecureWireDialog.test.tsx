import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { SecureWireDialog } from "./SecureWireDialog.js";

// jsdom lacks these; Radix Dialog probes for them defensively.
if (!window.matchMedia) {
  // @ts-expect-error test shim
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
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
  amount: 6_000_000,
  currency: "USD",
  debtor: { name: "Acme Corp", account: { scheme: "sepa" } },
  creditor: { name: "Beta LLC", account: { scheme: "sepa" } },
};

const violations = [
  {
    code: "AMOUNT_REQUIRES_APPROVAL",
    message: "wire above $50,000 requires secondary managerial approval",
    severity: "escalate" as const,
  },
];

async function open() {
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", { name: /review wire transfer/i }),
  );
  return user;
}

/** Walk review → collect → pending, ready to click Approve. */
async function reachApprove(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /request approval/i }));
  await user.type(screen.getByLabelText(/approver id/i), "mgr:dana");
  await user.type(screen.getByLabelText(/approver name/i), "Dana Approver");
  await user.click(screen.getByRole("button", { name: /send for approval/i }));
  // CredentialOTP distributes a pasted/typed block from the first box.
  fireEvent.change(screen.getByLabelText(/digit 1/i), {
    target: { value: "246810" },
  });
}

describe("SecureWireDialog", () => {
  it("has no axe violations in the open review state", async () => {
    const onSubmitApproval = vi
      .fn()
      .mockResolvedValue({ approved: true, violations: [] });
    render(
      <SecureWireDialog
        intent={intent}
        violations={violations}
        onSubmitApproval={onSubmitApproval}
      />,
    );
    await open();
    expect(
      await screen.findByText(/secondary approval required/i),
    ).toBeTruthy();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("submits the approver's evidence and reports approval (server decides)", async () => {
    const onSubmitApproval = vi
      .fn()
      .mockResolvedValue({ approved: true, violations: [] });
    const onApproved = vi.fn();
    render(
      <SecureWireDialog
        intent={intent}
        violations={violations}
        onSubmitApproval={onSubmitApproval}
        onApproved={onApproved}
      />,
    );
    const user = await open();
    await reachApprove(user);
    await user.click(screen.getByRole("button", { name: /^approve$/i }));

    expect(await screen.findByText(/approved & governed/i)).toBeTruthy();
    expect(onSubmitApproval).toHaveBeenCalledWith({
      approverId: "mgr:dana",
      approverName: "Dana Approver",
      secondFactor: "246810",
    });
    // The component NEVER computes/sends a binding hash — that's the server's job.
    expect(onSubmitApproval.mock.calls[0][0]).not.toHaveProperty("payloadHash");
    expect(onApproved).toHaveBeenCalledOnce();
  });

  it("keeps the wire blocked and names the reason when the re-gate denies (self-approval)", async () => {
    const onSubmitApproval = vi.fn().mockResolvedValue({
      approved: false,
      violations: [
        {
          code: "SELF_APPROVAL_FORBIDDEN",
          message: "the transfer initiator cannot approve their own wire",
          severity: "reject" as const,
        },
      ],
    });
    render(
      <SecureWireDialog
        intent={intent}
        violations={violations}
        onSubmitApproval={onSubmitApproval}
      />,
    );
    const user = await open();
    await reachApprove(user);
    await user.click(screen.getByRole("button", { name: /^approve$/i }));

    expect(await screen.findByText(/approval rejected/i)).toBeTruthy();
    expect(
      screen.getByText(/transfer initiator cannot approve their own wire/i),
    ).toBeTruthy();
    // Still open — the un-bypassable moment.
    expect(screen.getByText(/secondary approval required/i)).toBeTruthy();
  });
});

describe("SecureWireDialog — currency-agnostic copy", () => {
  const eurIntent = {
    amount: 6_000_000,
    currency: "EUR",
    debtor: { name: "Acme GmbH", account: { scheme: "sepa" } },
    creditor: { name: "Beta SARL", account: { scheme: "sepa" } },
  };
  const onSubmitApproval = vi
    .fn()
    .mockResolvedValue({ approved: true, violations: [] });

  it("does not assume USD dollars in the fallback review copy", async () => {
    render(
      <SecureWireDialog
        intent={eurIntent}
        onSubmitApproval={onSubmitApproval}
      />,
    );
    await open();
    expect(
      screen.getByText(
        /wires above the approval threshold require secondary managerial approval/i,
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/\$50,000/)).toBeNull();
    // Terms render the wire's own currency, not dollars.
    expect(screen.getByText(/€60,000\.00/)).toBeTruthy();
  });

  it("names the threshold when a thresholdLabel is supplied", async () => {
    render(
      <SecureWireDialog
        intent={eurIntent}
        thresholdLabel="€50,000"
        onSubmitApproval={onSubmitApproval}
      />,
    );
    await open();
    expect(
      screen.getByText(
        /wires above €50,000 require secondary managerial approval/i,
      ),
    ).toBeTruthy();
  });
});

describe("SecureWireDialog — unreadable payload", () => {
  const onSubmitApproval = vi
    .fn()
    .mockResolvedValue({ approved: true, violations: [] });

  it("fails loud instead of rendering a plausible-wrong $0.00 when the amount is missing", async () => {
    const malformed = {
      currency: "USD",
      debtor: { name: "Acme" },
      creditor: { name: "Beta" },
    };
    render(
      <SecureWireDialog
        intent={malformed}
        onSubmitApproval={onSubmitApproval}
      />,
    );
    await open();
    expect(
      await screen.findByText(/this wire could not be read/i),
    ).toBeTruthy();
    expect(screen.getByText(/amount/i)).toBeTruthy();
    expect(screen.queryByText(/\$0\.00/)).toBeNull();
    // No approval flow is offered on an unreadable payload.
    expect(
      screen.queryByRole("button", { name: /request approval/i }),
    ).toBeNull();
  });
});
