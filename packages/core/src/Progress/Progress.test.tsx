import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Progress } from "./Progress.js";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Progress", () => {
  it("renders a determinate progressbar with no axe violations", async () => {
    const { container } = render(<Progress value={60} label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar.getAttribute("aria-valuenow")).toBe("60");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("omits aria-valuenow when indeterminate", () => {
    render(<Progress label="Validating" />);
    const bar = screen.getByRole("progressbar", { name: "Validating" });
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
  });
});
