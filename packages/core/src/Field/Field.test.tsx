import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Field } from "./Field.js";

describe("Field", () => {
  it("wires label, description, and error onto the control (no axe violations)", async () => {
    const { container } = render(
      <Field label="Amount" description="Enter a value" error="This field is required">
        <input />
      </Field>,
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const label = screen.getByText("Amount") as HTMLLabelElement;

    // label is associated with the control
    expect(label.getAttribute("for")).toBe(input.id);
    expect(input.id).not.toBe("");

    // invalid + described by BOTH the description and the error
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(describedBy).toHaveLength(2);
    for (const id of describedBy) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }

    expect(await axe(container)).toHaveNoViolations();
  });

  it("omits invalid wiring when there is no error", () => {
    render(
      <Field label="Amount">
        <input />
      </Field>,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });
});
