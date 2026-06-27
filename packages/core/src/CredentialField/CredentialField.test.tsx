import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CredentialField, CredentialOTP } from "./CredentialField.js";

describe("CredentialField", () => {
  it("masks input by default and toggles visibility, no axe violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<CredentialField label="Approval code" />);
    const input = screen.getByLabelText("Approval code") as HTMLInputElement;
    expect(input.type).toBe("password");

    const toggle = screen.getByRole("button", { name: "Show code" });
    await user.click(toggle);
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide code" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("CredentialOTP", () => {
  it("auto-advances across boxes and reports the joined value, no axe violations", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<CredentialOTP length={4} onChange={onChange} />);

    const boxes = screen.getAllByRole("textbox");
    expect(boxes.length).toBe(4);

    await user.click(boxes[0]);
    await user.keyboard("42");
    expect(onChange).toHaveBeenLastCalledWith("42");
    // focus advanced to the third box
    expect(boxes[2]).toBe(document.activeElement);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("steps back and clears on Backspace from an empty box", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CredentialOTP length={4} defaultValue="12" onChange={onChange} />);
    const boxes = screen.getAllByRole("textbox");

    await user.click(boxes[2]);
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith("1");
    expect(boxes[1]).toBe(document.activeElement);
  });
});
