import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip.js";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function Example() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>Why blocked?</TooltipTrigger>
        <TooltipContent>Exceeds the limit</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe("Tooltip", () => {
  it("renders a trigger with no axe violations", async () => {
    const { container } = render(<Example />);
    expect(screen.getByRole("button", { name: "Why blocked?" })).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("reveals content on focus", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Why blocked?" })).toBe(document.activeElement);
    expect(await screen.findAllByText("Exceeds the limit")).not.toHaveLength(0);
  });
});
