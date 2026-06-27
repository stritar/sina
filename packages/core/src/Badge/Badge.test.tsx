import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("applies the solid appearance classes", () => {
    render(
      <Badge appearance="solid" intent="danger">
        Blocked
      </Badge>,
    );
    const el = screen.getByText("Blocked");
    expect(el.className).toContain("bg-danger");
    expect(el.className).toContain("text-danger-fg");
  });
});
