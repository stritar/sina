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

  it("renders icon slots without axe violations", async () => {
    const { container } = render(
      <div>
        <Button iconLeft={<svg aria-hidden width="16" height="16" />}>Approve</Button>
        <Button iconRight={<svg aria-hidden width="16" height="16" />}>Next</Button>
        <Button
          iconLeft={<svg aria-hidden width="16" height="16" />}
          iconRight={<svg aria-hidden width="16" height="16" />}
        >
          Both
        </Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("requires an accessible name for an icon-only button", async () => {
    const named = render(
      <Button aria-label="Add item" iconLeft={<svg aria-hidden width="16" height="16" />} />,
    );
    expect(screen.getByRole("button", { name: "Add item" })).toBeTruthy();
    expect(await axe(named.container)).toHaveNoViolations();

    const unnamed = render(<Button iconLeft={<svg aria-hidden width="16" height="16" />} />);
    const results = await axe(unnamed.container);
    expect(results.violations.map((v) => v.id)).toContain("button-name");
  });

  it("applies the size class per size", () => {
    // Font weight now scales via the size class's CSS (see Button.module.css);
    // assert the correct size class is applied (non-scoped module names in jsdom).
    const sizes = ["sm", "md", "lg", "xl"] as const;
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>X</Button>);
      expect(screen.getByRole("button").className.split(/\s+/)).toContain(size);
      unmount();
    }
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
