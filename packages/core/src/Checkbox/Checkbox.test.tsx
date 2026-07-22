import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Checkbox } from "./Checkbox.js";

describe("Checkbox", () => {
  it("renders with a label and toggles by keyboard, no axe violations", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox label="I authorize this transfer" onCheckedChange={onCheckedChange} />,
    );
    const box = screen.getByRole("checkbox", { name: "I authorize this transfer" });
    expect(box.getAttribute("aria-checked")).toBe("false");

    await user.tab();
    expect(box).toBe(document.activeElement);
    await user.keyboard(" ");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("reflects the indeterminate state", () => {
    render(<Checkbox label="Partial" checked="indeterminate" />);
    const box = screen.getByRole("checkbox", { name: "Partial" });
    expect(box.getAttribute("aria-checked")).toBe("mixed");
  });
});
