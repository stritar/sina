import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./DropdownMenu.js";

beforeAll(() => {
  // Radix's floating content measures + captures pointers; jsdom implements neither.
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

function Menu({ onSelect }: { onSelect?: () => void } = {}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Page actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onSelect}>View as Markdown</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Open in Claude</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("has an accessible trigger with no axe violations when closed", async () => {
    const { container } = render(<Menu />);
    const trigger = screen.getByRole("button", { name: "Page actions" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens with the keyboard and has no axe violations when open", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<Menu />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Page actions" })).toBe(document.activeElement);
    await user.keyboard("{Enter}");

    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    // Portalled content lives outside `container`, so axe the whole body. `region`
    // is off: Radix mounts the floating layer as a direct child of <body>, outside
    // any landmark by design, and this test renders no page landmarks for it to
    // sit in. Every other rule (roles, names, focus order) still applies.
    expect(
      await axe(baseElement, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });

  it("roves focus with the arrow keys and fires the item on Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Menu onSelect={onSelect} />);

    await user.tab();
    await user.keyboard("{Enter}");
    // Opening by keyboard focuses the first item; the arrows rove from there.
    const [first, second] = screen.getAllByRole("menuitem");
    expect(first).toBe(document.activeElement);

    await user.keyboard("{ArrowDown}");
    expect(second).toBe(document.activeElement);

    await user.keyboard("{ArrowUp}{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Menu />);

    const trigger = screen.getByRole("button", { name: "Page actions" });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toBe(document.activeElement);
  });
});
