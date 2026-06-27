import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Grid } from "./Grid.js";

describe("Grid", () => {
  it("renders children with no axe violations", async () => {
    const { container } = render(
      <Grid cols={3} gap={4} aria-label="cells">
        <span>One</span>
        <span>Two</span>
        <span>Three</span>
      </Grid>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("applies grid column and gap classes", () => {
    const { container } = render(
      <Grid cols={3} gap={4}>
        <span>x</span>
      </Grid>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("grid");
    expect(el.className).toContain("grid-cols-3");
    expect(el.className).toContain("gap-4");
  });
});
