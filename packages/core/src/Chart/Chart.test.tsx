import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Chart } from "./Chart.js";

const SERIES = [10, 12, 9, 15, 14, 18, 22];

describe("Chart", () => {
  it("renders a labelled image with no axe violations", async () => {
    const { container } = render(<Chart data={SERIES} label="Balance up 12% over 7 days" />);
    const fig = screen.getByRole("img", { name: "Balance up 12% over 7 days" });
    expect(fig).toBeTruthy();
    // The SVG geometry is hidden from assistive tech — only the label is exposed.
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("plots one vertex per finite data point (line)", () => {
    const { container } = render(<Chart data={SERIES} label="trend" variant="line" />);
    const polyline = container.querySelector("polyline");
    expect(polyline).toBeTruthy();
    expect(polyline!.getAttribute("points")!.trim().split(/\s+/).length).toBe(SERIES.length);
  });

  it("renders one bar per point in bar variant", () => {
    const { container } = render(<Chart data={SERIES} label="trend" variant="bar" />);
    expect(container.querySelectorAll("rect").length).toBe(SERIES.length);
  });

  it("degrades to a flat baseline for an empty series and stays labelled", async () => {
    const { container } = render(<Chart data={[]} label="No data" />);
    expect(screen.getByRole("img", { name: "No data" })).toBeTruthy();
    expect(container.querySelector("line")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("colors via currentColor so a theme text-* token drives it", () => {
    const { container } = render(<Chart data={SERIES} label="trend" />);
    expect(container.querySelector("polyline")?.getAttribute("stroke")).toBe("currentColor");
  });
});
