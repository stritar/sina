import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CurrencyField } from "./CurrencyField.js";

describe("CurrencyField", () => {
  it("renders an accessible labeled field (no axe violations)", async () => {
    const { container } = render(
      <CurrencyField label="Transfer amount" description="Whole dollars" />,
    );
    expect(screen.getByRole("textbox", { name: "Transfer amount" })).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("formats with thousands separators on blur and reports the sanitized value", async () => {
    const user = userEvent.setup();
    const values: string[] = [];
    render(<CurrencyField label="Amount" onValueChange={(v) => values.push(v)} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.type(input, "12a34,5x6");
    // entry is constrained to digits/decimal
    expect(input.value).toBe("123456");
    expect(values.at(-1)).toBe("123456");

    await user.tab();
    expect(input.value).toBe("123,456");
  });

  it("marks the field invalid when an error is present", () => {
    render(<CurrencyField label="Amount" error="Required" />);
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});
