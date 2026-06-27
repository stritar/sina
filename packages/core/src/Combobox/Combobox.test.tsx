import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Combobox, type ComboboxOption } from "./Combobox.js";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const OPTIONS: ComboboxOption[] = [
  { value: "payroll", label: "Acme Payroll", description: "8810" },
  { value: "holdings", label: "Acme Holdings", description: "3321" },
  { value: "vendor", label: "Globex Vendor", description: "6624" },
];

describe("Combobox", () => {
  it("has an accessible combobox with no axe violations when closed", async () => {
    const { container } = render(<Combobox options={OPTIONS} aria-label="Account" />);
    const input = screen.getByRole("combobox", { name: "Account" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("filters as you type and selects with the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox options={OPTIONS} aria-label="Account" onValueChange={onValueChange} />);

    const input = screen.getByRole("combobox", { name: "Account" });
    await user.click(input);
    await user.type(input, "Acme");

    const optionEls = screen.getAllByRole("option");
    expect(optionEls.length).toBe(2); // only the two "Acme" options match

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("holdings");
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} aria-label="Account" />);
    const input = screen.getByRole("combobox", { name: "Account" });
    await user.click(input);
    await user.type(input, "zzz");
    expect(screen.getByText("No results")).toBeDefined();
  });
});
