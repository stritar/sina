import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Icon } from "./Icon.js";

describe("Icon", () => {
  it("exposes a labeled icon to assistive tech (no axe violations)", async () => {
    const { container } = render(<Icon icon={ShieldCheck} label="Secure" />);

    expect(screen.getByText("Secure")).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("hides a decorative icon from assistive tech", async () => {
    const { container } = render(<Icon icon={ShieldCheck} decorative />);

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(await axe(container)).toHaveNoViolations();
  });
});
