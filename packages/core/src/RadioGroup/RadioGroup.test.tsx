import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RadioGroup, RadioGroupItem } from "./RadioGroup.js";

function Example({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <RadioGroup aria-label="Transfer speed" onValueChange={onValueChange}>
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="same-day" label="Same-day" />
      <RadioGroupItem value="wire" label="Wire" />
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("renders accessible radios with no axe violations", async () => {
    const { container } = render(<Example />);
    expect(screen.getByRole("radiogroup", { name: "Transfer speed" })).toBeDefined();
    expect(screen.getAllByRole("radio").length).toBe(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("is keyboard operable (focus then select)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    await user.tab();
    const first = screen.getByRole("radio", { name: "Standard" });
    expect(first).toBe(document.activeElement);
    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenCalledWith("standard");
  });
});
