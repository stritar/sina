import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { VisuallyHidden } from "./VisuallyHidden.js";

describe("VisuallyHidden", () => {
  it("keeps content in the accessibility tree (no axe violations)", async () => {
    const { container } = render(
      <button type="button">
        <span aria-hidden>×</span>
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    );

    // The icon-only button gets its accessible name from the hidden text.
    expect(screen.getByRole("button", { name: "Close" })).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });
});
