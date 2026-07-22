import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select.js";

// Radix Select relies on a few DOM APIs jsdom doesn't implement.
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

function Example({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Account">
        <SelectValue placeholder="Select an account" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="checking">Checking</SelectItem>
        <SelectItem value="savings">Savings</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("renders an accessible trigger without axe violations", async () => {
    const { container } = render(<Example />);
    const trigger = screen.getByRole("combobox", { name: "Account" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens and selects an option by keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    await user.tab();
    const trigger = screen.getByRole("combobox", { name: "Account" });
    expect(trigger).toBe(document.activeElement);

    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeDefined();

    // Open highlights the first option (Checking); ArrowDown moves to Savings.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("savings");
  });
});
