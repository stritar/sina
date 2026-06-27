import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Separator } from "./Separator.js";

describe("Separator", () => {
  it("is decorative (aria-hidden) by default with no axe violations", async () => {
    const { container } = render(
      <div>
        <p>Above</p>
        <Separator />
        <p>Below</p>
      </div>,
    );
    const sep = container.querySelector("[data-orientation]") as HTMLElement;
    // Radix renders a decorative separator as role="none" (no semantic boundary).
    expect(sep.getAttribute("role")).toBe("none");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("exposes role=separator when semantic", () => {
    const { container } = render(<Separator decorative={false} orientation="vertical" />);
    const sep = container.querySelector("[data-orientation]") as HTMLElement;
    expect(sep.getAttribute("role")).toBe("separator");
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
  });
});
