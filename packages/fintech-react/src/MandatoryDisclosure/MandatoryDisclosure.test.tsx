import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { MandatoryDisclosure } from "./MandatoryDisclosure.js";

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

const MARKUP = "<img src=x onerror=alert(1)> Reg E paragraph one.";

const intent = {
  disclosureId: "reg-e-eft",
  title: "Electronic Fund Transfer Disclosure",
  version: "2024.1",
  body: [MARKUP, "You may be liable for unauthorized transfers if you do not notify us."],
};

const violations = [
  {
    code: "DISCLOSURE_NOT_ACKNOWLEDGED",
    message: "the required disclosure must be acknowledged before proceeding",
    severity: "escalate" as const,
  },
];

async function open() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /review disclosure/i }));
  return user;
}

describe("MandatoryDisclosure", () => {
  it("renders the verbatim disclosure text and has no axe violations", async () => {
    const onSubmitApproval = vi.fn().mockResolvedValue({ approved: true, violations: [] });
    const { baseElement } = render(
      <MandatoryDisclosure intent={intent} violations={violations} onSubmitApproval={onSubmitApproval} />,
    );
    await open();
    expect(await screen.findByText(/electronic fund transfer disclosure/i)).toBeTruthy();
    // Markup is rendered as TEXT, never injected — the raw string is present, no <img> node.
    expect(baseElement.textContent).toContain(MARKUP);
    expect(baseElement.querySelector("img")).toBeNull();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("requires the checkbox before it can submit, then reports acknowledgement (server decides)", async () => {
    const onSubmitApproval = vi.fn().mockResolvedValue({ approved: true, violations: [] });
    const onApproved = vi.fn();
    render(
      <MandatoryDisclosure
        intent={intent}
        violations={violations}
        onSubmitApproval={onSubmitApproval}
        onApproved={onApproved}
      />,
    );
    const user = await open();

    const submit = screen.getByRole("button", { name: /acknowledge & continue/i });
    expect(submit.hasAttribute("disabled")).toBe(true);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /acknowledge & continue/i }));

    expect(await screen.findByText(/acknowledged & governed/i)).toBeTruthy();
    expect(onSubmitApproval).toHaveBeenCalledWith({ acknowledged: true });
    expect(onApproved).toHaveBeenCalledOnce();
  });

  it("stays blocked when the re-gate denies", async () => {
    const onSubmitApproval = vi.fn().mockResolvedValue({
      approved: false,
      violations: [
        {
          code: "DISCLOSURE_NOT_ACKNOWLEDGED",
          message: "the required disclosure must be acknowledged before proceeding",
          severity: "escalate" as const,
        },
      ],
    });
    render(
      <MandatoryDisclosure intent={intent} violations={violations} onSubmitApproval={onSubmitApproval} />,
    );
    const user = await open();
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /acknowledge & continue/i }));

    expect(await screen.findByText(/still blocked/i)).toBeTruthy();
  });
});
