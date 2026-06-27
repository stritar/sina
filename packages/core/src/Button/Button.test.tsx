import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./Button.js";

describe("Button", () => {
  it("renders all variants without axe violations", async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Confirm</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="danger">Delete</Button>
        <Button variant="ghost">Dismiss</Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("is operable by keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Confirm</Button>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Confirm" })).toBe(document.activeElement);

    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("marks the loading state busy and blocks activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Confirm
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Confirm" }) as HTMLButtonElement;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(true);

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as the child element via asChild", () => {
    render(
      <Button asChild>
        <a href="/next">Continue</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Continue" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/next");
  });
});
