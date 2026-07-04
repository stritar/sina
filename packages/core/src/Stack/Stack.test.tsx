import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Stack } from "./Stack.js";

describe("Stack", () => {
  it("renders children with no axe violations", async () => {
    const { container } = render(
      <Stack gap={4} aria-label="group">
        <span>One</span>
        <span>Two</span>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("applies flex direction and gap classes", () => {
    const { container } = render(
      <Stack direction="row" gap={6}>
        <span>x</span>
      </Stack>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("root");
    expect(el.className).toContain("row");
    expect(el.className).toContain("gap6");
  });

  it("renders as the requested element", () => {
    const { container } = render(
      <Stack as="ul">
        <li>x</li>
      </Stack>,
    );
    expect(container.querySelector("ul")).not.toBeNull();
  });
});
