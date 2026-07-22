import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TextField } from "./TextField.js";

describe("TextField", () => {
  it("associates the label and accepts input, no axe violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<TextField label="Recipient" />);
    const input = screen.getByLabelText("Recipient");
    await user.type(input, "Acme");
    expect((input as HTMLInputElement).value).toBe("Acme");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("marks the control invalid and announces the error", async () => {
    const { container } = render(<TextField label="Recipient" error="Required" />);
    const input = screen.getByLabelText("Recipient");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedby = input.getAttribute("aria-describedby");
    expect(describedby).toBeTruthy();
    expect(container.querySelector(`#${describedby}`)?.textContent).toContain("Required");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a textarea when multiline", () => {
    render(<TextField label="Memo" multiline />);
    const control = screen.getByLabelText("Memo");
    expect(control.tagName).toBe("TEXTAREA");
  });
});
