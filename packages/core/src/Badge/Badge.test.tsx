import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "./Badge.js";

describe("Badge", () => {
  it("renders text with no axe violations", async () => {
    const { container } = render(<Badge intent="success">Compliant</Badge>);
    expect(screen.getByText("Compliant")).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("conveys meaning by text, not color alone (icon is decorative)", async () => {
    const { container } = render(
      <Badge intent="warning" icon={Lock}>
        Requires approval
      </Badge>,
    );
    // The icon is aria-hidden; the label text carries the meaning.
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Requires approval")).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("applies the solid appearance classes to the root", () => {
    const { container } = render(
      <Badge appearance="solid" intent="danger">
        Blocked
      </Badge>,
    );
    // Colors live on the root pill; the label is an inner padded span.
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("bg-danger");
    expect(root.className).toContain("text-danger-fg");
  });

  it("renders a dismiss button with an accessible name and fires onClose", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Badge intent="info" onClose={onClose} closeLabel="Remove Pending">
        Pending
      </Badge>,
    );
    const close = screen.getByRole("button", { name: "Remove Pending" });
    await userEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("omits the dismiss button when onClose is not provided", () => {
    render(<Badge intent="neutral">Draft</Badge>);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
